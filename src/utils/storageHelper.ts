import type { DataKeluarga } from '../data/citizenData';

const IDB_NAME = 'si_warga_rt05_db';
const IDB_VERSION = 2;
const CITIZENS_STORE = 'citizens_records';
const META_STORE = 'keyval';
const LEGACY_CITIZENS_KEY = 'citizens_v1';
const DELETED_IDS_KEY = 'deleted_citizen_ids';

/**
 * Compress uploaded KTP / KK image using HTMLCanvasElement so text stays crisp
 * while keeping payload compact (~100-250 KB) to support hundreds of KK without
 * hitting browser localStorage or network payload limits.
 */
export async function compressDataUrl(
  rawDataUrl: string,
  maxDimension = 1280,
  initialQuality = 0.78
): Promise<string> {
  if (!rawDataUrl || rawDataUrl.startsWith('data:image/svg+xml')) {
    return rawDataUrl;
  }

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Format gambar tidak didukung browser.'));
      image.src = rawDataUrl;
    });

    const renderScaled = (maxDim: number, q: number): string | null => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      return canvas.toDataURL('image/jpeg', q);
    };

    let compressed = renderScaled(maxDimension, initialQuality);
    if (!compressed) return rawDataUrl;

    // Target <= ~320KB base64 chars (~240KB binary) so hundreds of KK fit cleanly
    if (compressed.length > 320_000) {
      const tighter = renderScaled(Math.min(maxDimension, 1080), 0.65);
      if (tighter && tighter.length < compressed.length) {
        compressed = tighter;
      }
    }

    return compressed.length < rawDataUrl.length ? compressed : rawDataUrl;
  } catch {
    return rawDataUrl;
  }
}

export async function compressImageFile(
  file: File,
  maxDimension = 1280,
  initialQuality = 0.78
): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal membaca file gambar.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });

  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return rawDataUrl;
  }

  return compressDataUrl(rawDataUrl, maxDimension, initialQuality);
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE);
        }
        if (!db.objectStoreNames.contains(CITIZENS_STORE)) {
          db.createObjectStore(CITIZENS_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveSingleCitizenToIdb(citizen: DataKeluarga): Promise<void> {
  const db = await openDatabase();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(CITIZENS_STORE, 'readwrite');
      tx.objectStore(CITIZENS_STORE).put(citizen);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function deleteSingleCitizenFromIdb(id: string): Promise<void> {
  const db = await openDatabase();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction([CITIZENS_STORE, META_STORE], 'readwrite');
      tx.objectStore(CITIZENS_STORE).delete(id);
      const metaStore = tx.objectStore(META_STORE);
      const req = metaStore.get(DELETED_IDS_KEY);
      req.onsuccess = () => {
        const existing = Array.isArray(req.result) ? (req.result as string[]) : [];
        if (!existing.includes(id)) {
          metaStore.put([...existing, id], DELETED_IDS_KEY);
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function getDeletedCitizenIdsFromIdb(): Promise<string[]> {
  const db = await openDatabase();
  if (!db) return [];
  return new Promise<string[]>((resolve) => {
    try {
      const tx = db.transaction(META_STORE, 'readonly');
      const req = tx.objectStore(META_STORE).get(DELETED_IDS_KEY);
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function saveCitizensIdbBackup(citizens: DataKeluarga[]): Promise<void> {
  const db = await openDatabase();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction([CITIZENS_STORE, META_STORE], 'readwrite');
      const store = tx.objectStore(CITIZENS_STORE);
      store.clear();
      for (const c of citizens) {
        if (c && typeof c.id === 'string') {
          store.put(c);
        }
      }
      // Also clear legacy key to avoid duplicate stale data
      tx.objectStore(META_STORE).delete(LEGACY_CITIZENS_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function loadCitizensIdbBackup(): Promise<DataKeluarga[]> {
  const db = await openDatabase();
  if (!db) return [];
  return new Promise<DataKeluarga[]>((resolve) => {
    try {
      const tx = db.transaction([CITIZENS_STORE, META_STORE], 'readonly');
      const recordsReq = tx.objectStore(CITIZENS_STORE).getAll();
      const legacyReq = tx.objectStore(META_STORE).get(LEGACY_CITIZENS_KEY);

      tx.oncomplete = () => {
        const records = Array.isArray(recordsReq.result)
          ? (recordsReq.result as DataKeluarga[])
          : [];
        const legacy = Array.isArray(legacyReq.result)
          ? (legacyReq.result as DataKeluarga[])
          : [];

        if (records.length === 0 && legacy.length > 0) {
          resolve(legacy);
          return;
        }
        // Merge both without duplicates (prefer newer records store)
        const byId = new Map<string, DataKeluarga>();
        for (const item of legacy) {
          if (item && typeof item.id === 'string') byId.set(item.id, item);
        }
        for (const item of records) {
          if (item && typeof item.id === 'string') byId.set(item.id, item);
        }
        resolve(Array.from(byId.values()));
      };
      tx.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Strip heavy base64 images before writing lightweight cache to 5MB-capped localStorage
 * so localStorage can store 1,000+ KK metadata records without ever throwing QuotaExceededError.
 */
export function saveLightweightLocalCache(citizens: DataKeluarga[]): void {
  try {
    const slim = citizens.map((c) => ({
      ...c,
      fotoKtp: undefined,
      fotoKk: undefined,
      hasFotoKtp: Boolean(c.fotoKtp),
      hasFotoKk: Boolean(c.fotoKk),
    }));
    localStorage.setItem('si_warga_rt05_official_v2', JSON.stringify(slim));
  } catch {
    // ignore if storage disabled
  }
}
