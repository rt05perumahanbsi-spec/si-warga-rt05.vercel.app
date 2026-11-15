import type { DataKeluarga } from '../data/citizenData';

const DRIVE_FOLDER_NAME = 'SI-WARGA 05 RT 05 BLOK E - Arsip & Backup';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export interface DriveQuotaInfo {
  userEmail: string;
  displayName: string;
  limitBytes: number;
  usageBytes: number;
  usageInDriveBytes: number;
}

export interface DriveArchiveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  modifiedTime: string;
  webViewLink?: string;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const idx = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, idx);
  return `${value.toFixed(idx >= 2 ? 2 : 1)} ${units[idx]}`;
}

async function driveFetch(
  url: string,
  accessToken: string,
  init: RequestInit = {}
): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers || {}),
    },
  });

  if (res.status === 401) {
    throw new Error('TOKEN_EXPIRED');
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Drive API error (${res.status}): ${errText || res.statusText}`);
  }
  return res;
}

export async function fetchDriveQuotaAndUser(accessToken: string): Promise<DriveQuotaInfo> {
  const res = await driveFetch(
    `${DRIVE_API_BASE}/about?fields=storageQuota(limit,usage,usageInDrive),user(emailAddress,displayName)`,
    accessToken
  );
  const data = (await res.json()) as {
    storageQuota?: { limit?: string; usage?: string; usageInDrive?: string };
    user?: { emailAddress?: string; displayName?: string };
  };

  return {
    userEmail: data.user?.emailAddress || '',
    displayName: data.user?.displayName || '',
    limitBytes: Number(data.storageQuota?.limit || 15 * 1024 * 1024 * 1024),
    usageBytes: Number(data.storageQuota?.usage || 0),
    usageInDriveBytes: Number(data.storageQuota?.usageInDrive || 0),
  };
}

export async function ensureSiWargaDriveFolder(accessToken: string): Promise<string> {
  const q = encodeURIComponent(
    `name='${DRIVE_FOLDER_NAME.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const listRes = await driveFetch(
    `${DRIVE_API_BASE}/files?q=${q}&fields=files(id,name)&pageSize=10`,
    accessToken
  );
  const listData = (await listRes.json()) as { files?: Array<{ id: string; name: string }> };
  if (listData.files && listData.files.length > 0) {
    return listData.files[0].id;
  }

  const createRes = await driveFetch(`${DRIVE_API_BASE}/files`, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  const created = (await createRes.json()) as { id: string };
  return created.id;
}

export async function listSiWargaDriveFiles(accessToken: string): Promise<{
  folderId: string;
  files: DriveArchiveFile[];
}> {
  const folderId = await ensureSiWargaDriveFolder(accessToken);
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const res = await driveFetch(
    `${DRIVE_API_BASE}/files?q=${q}&orderBy=modifiedTime desc&pageSize=50&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)`,
    accessToken
  );
  const data = (await res.json()) as {
    files?: Array<{
      id: string;
      name: string;
      mimeType: string;
      size?: string;
      modifiedTime: string;
      webViewLink?: string;
    }>;
  };

  return {
    folderId,
    files: (data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: Number(f.size || 0),
      modifiedTime: f.modifiedTime,
      webViewLink: f.webViewLink,
    })),
  };
}

export async function uploadBlobToDrive(
  accessToken: string,
  folderId: string,
  filename: string,
  mimeType: string,
  blob: Blob,
  overwriteFileId?: string
): Promise<DriveArchiveFile> {
  const boundary = `-------siwarga05_${Date.now()}`;
  const metadata: Record<string, unknown> = overwriteFileId
    ? { name: filename, mimeType }
    : { name: filename, mimeType, parents: [folderId] };

  const metaPart = new Blob(
    [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
        metadata
      )}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    ],
    { type: 'text/plain' }
  );
  const endPart = new Blob([`\r\n--${boundary}--`], { type: 'text/plain' });
  const multipartBody = new Blob([metaPart, blob, endPart], {
    type: `multipart/related; boundary=${boundary}`,
  });

  const url = overwriteFileId
    ? `${DRIVE_UPLOAD_BASE}/files/${encodeURIComponent(overwriteFileId)}?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`
    : `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`;

  const res = await driveFetch(url, accessToken, {
    method: overwriteFileId ? 'PATCH' : 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  const saved = (await res.json()) as {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime: string;
    webViewLink?: string;
  };

  return {
    id: saved.id,
    name: saved.name,
    mimeType: saved.mimeType,
    size: Number(saved.size || blob.size),
    modifiedTime: saved.modifiedTime || new Date().toISOString(),
    webViewLink: saved.webViewLink,
  };
}

export async function downloadCitizensBackupFromDrive(
  accessToken: string,
  fileId: string
): Promise<DataKeluarga[]> {
  const res = await driveFetch(
    `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?alt=media`,
    accessToken
  );
  const text = await res.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error('Format file cadangan di Google Drive tidak valid.');
  }
  return parsed as DataKeluarga[];
}

export async function deleteFileFromDrive(accessToken: string, fileId: string): Promise<void> {
  await driveFetch(`${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}`, accessToken, {
    method: 'DELETE',
  });
}
