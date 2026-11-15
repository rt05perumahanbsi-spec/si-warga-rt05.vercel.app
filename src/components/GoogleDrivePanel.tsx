import React from 'react';
import {
  HardDrive,
  RefreshCw,
  UploadCloud,
  FileJson,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FolderOpen,
  Replace,
} from 'lucide-react';
import type { DataKeluarga } from '../data/citizenData';
import { clearDriveAccessToken } from '../firebase';
import {
  buildAllCitizensPdfBlob,
  buildCitizensExcelBlob,
} from '../utils/citizenExport';
import {
  deleteFileFromDrive,
  downloadCitizensBackupFromDrive,
  fetchDriveQuotaAndUser,
  formatBytes,
  listSiWargaDriveFiles,
  uploadBlobToDrive,
  type DriveArchiveFile,
  type DriveQuotaInfo,
} from '../utils/googleDriveSync';

interface GoogleDrivePanelProps {
  citizens: DataKeluarga[];
  driveAccessToken: string | null;
  cloudUserEmail: string | null;
  onConnectGoogleDrive: () => Promise<void> | void;
  onRestoreCitizens: (restored: DataKeluarga[]) => Promise<void>;
  onNotify: (msg: string) => void;
}

type PendingDriveConfirmation =
  | {
      type: 'overwrite';
      file: DriveArchiveFile;
    }
  | {
      type: 'delete';
      file: DriveArchiveFile;
    };

function getTimestampSuffix(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
    now.getHours()
  )}${pad(now.getMinutes())}`;
}

export const GoogleDrivePanel: React.FC<GoogleDrivePanelProps> = ({
  citizens,
  driveAccessToken,
  cloudUserEmail,
  onConnectGoogleDrive,
  onRestoreCitizens,
  onNotify,
}) => {
  const [quota, setQuota] = React.useState<DriveQuotaInfo | null>(null);
  const [folderId, setFolderId] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<DriveArchiveFile[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [busyAction, setBusyAction] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] =
    React.useState<PendingDriveConfirmation | null>(null);

  const handleDriveError = React.useCallback(
    (err: unknown, fallbackMsg: string) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('TOKEN_EXPIRED')) {
        clearDriveAccessToken();
        setQuota(null);
        setFolderId(null);
        setFiles([]);
        setErrorMsg(
          'Sesi akses Google Drive telah berakhir. Silakan klik tombol Masuk Google Drive untuk menghubungkan kembali.'
        );
        return;
      }
      setErrorMsg(`${fallbackMsg}: ${msg}`);
    },
    []
  );

  const refreshDriveState = React.useCallback(async () => {
    if (!driveAccessToken) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [quotaInfo, listed] = await Promise.all([
        fetchDriveQuotaAndUser(driveAccessToken),
        listSiWargaDriveFiles(driveAccessToken),
      ]);
      setQuota(quotaInfo);
      setFolderId(listed.folderId);
      setFiles(listed.files);
    } catch (err) {
      handleDriveError(err, 'Gagal memuat info Google Drive');
    } finally {
      setIsLoading(false);
    }
  }, [driveAccessToken, handleDriveError]);

  React.useEffect(() => {
    if (driveAccessToken) {
      refreshDriveState();
    } else {
      setQuota(null);
      setFolderId(null);
      setFiles([]);
    }
  }, [driveAccessToken, refreshDriveState]);

  const ensureFolder = async (): Promise<string | null> => {
    if (!driveAccessToken) return null;
    if (folderId) return folderId;
    const listed = await listSiWargaDriveFiles(driveAccessToken);
    setFolderId(listed.folderId);
    setFiles(listed.files);
    return listed.folderId;
  };

  const handleCreateJsonBackup = async () => {
    if (!driveAccessToken) return;
    setBusyAction('json');
    setErrorMsg(null);
    try {
      const targetFolderId = await ensureFolder();
      if (!targetFolderId) return;
      const filename = `SI-WARGA-05_Backup_${getTimestampSuffix()}.json`;
      const blob = new Blob([JSON.stringify(citizens, null, 2)], {
        type: 'application/json',
      });
      await uploadBlobToDrive(
        driveAccessToken,
        targetFolderId,
        filename,
        'application/json',
        blob
      );
      await refreshDriveState();
      onNotify(
        `Backup JSON lengkap (${citizens.length} KK termasuk foto KTP & KK) berhasil disimpan ke Google Drive!`
      );
    } catch (err) {
      handleDriveError(err, 'Gagal menyimpan backup JSON ke Google Drive');
    } finally {
      setBusyAction(null);
    }
  };

  const handleUploadExcel = async () => {
    if (!driveAccessToken) return;
    setBusyAction('excel');
    setErrorMsg(null);
    try {
      const targetFolderId = await ensureFolder();
      if (!targetFolderId) return;
      const filename = `SI-WARGA-05_DataWarga_${getTimestampSuffix()}.xlsx`;
      const blob = buildCitizensExcelBlob(citizens);
      await uploadBlobToDrive(
        driveAccessToken,
        targetFolderId,
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        blob
      );
      await refreshDriveState();
      onNotify(
        `File Excel (${citizens.length} KK) berhasil diunggah ke Google Drive!`
      );
    } catch (err) {
      handleDriveError(err, 'Gagal mengunggah Excel ke Google Drive');
    } finally {
      setBusyAction(null);
    }
  };

  const handleUploadPdf = async () => {
    if (!driveAccessToken || citizens.length === 0) return;
    setBusyAction('pdf');
    setErrorMsg(null);
    try {
      const targetFolderId = await ensureFolder();
      if (!targetFolderId) return;
      const filename = `SI-WARGA-05_Rekap_KTP_KK_${getTimestampSuffix()}.pdf`;
      const blob = await buildAllCitizensPdfBlob(citizens);
      await uploadBlobToDrive(
        driveAccessToken,
        targetFolderId,
        filename,
        'application/pdf',
        blob
      );
      await refreshDriveState();
      onNotify(
        `Arsip PDF + lampiran KTP & KK (${citizens.length} KK) berhasil diunggah ke Google Drive!`
      );
    } catch (err) {
      handleDriveError(err, 'Gagal mengunggah PDF ke Google Drive');
    } finally {
      setBusyAction(null);
    }
  };

  const handleRestoreBackupFile = async (file: DriveArchiveFile) => {
    if (!driveAccessToken) return;
    setBusyAction(`restore:${file.id}`);
    setErrorMsg(null);
    try {
      const restored = await downloadCitizensBackupFromDrive(
        driveAccessToken,
        file.id
      );
      await onRestoreCitizens(restored);
      onNotify(
        `Berhasil memulihkan ${restored.length} data KK dari Google Drive ("${file.name}")!`
      );
    } catch (err) {
      handleDriveError(err, 'Gagal memulihkan data dari Google Drive');
    } finally {
      setBusyAction(null);
    }
  };

  const handleConfirmedDriveAction = async () => {
    if (!pendingConfirm || !driveAccessToken) return;
    const action = pendingConfirm;
    setPendingConfirm(null);
    setErrorMsg(null);

    if (action.type === 'overwrite') {
      setBusyAction(`overwrite:${action.file.id}`);
      try {
        const targetFolderId = await ensureFolder();
        if (!targetFolderId) return;
        const blob = new Blob([JSON.stringify(citizens, null, 2)], {
          type: 'application/json',
        });
        await uploadBlobToDrive(
          driveAccessToken,
          targetFolderId,
          action.file.name,
          'application/json',
          blob,
          action.file.id
        );
        await refreshDriveState();
        onNotify(
          `File backup "${action.file.name}" di Google Drive berhasil diperbarui (${citizens.length} KK)!`
        );
      } catch (err) {
        handleDriveError(err, 'Gagal memperbarui file di Google Drive');
      } finally {
        setBusyAction(null);
      }
      return;
    }

    if (action.type === 'delete') {
      setBusyAction(`delete:${action.file.id}`);
      try {
        await deleteFileFromDrive(driveAccessToken, action.file.id);
        await refreshDriveState();
        onNotify(`File "${action.file.name}" telah dihapus dari Google Drive.`);
      } catch (err) {
        handleDriveError(err, 'Gagal menghapus file di Google Drive');
      } finally {
        setBusyAction(null);
      }
    }
  };

  const usagePercent =
    quota && quota.limitBytes > 0
      ? Math.min(100, Math.round((quota.usageBytes / quota.limitBytes) * 1000) / 10)
      : 0;
  const remainingBytes = quota
    ? Math.max(0, quota.limitBytes - quota.usageBytes)
    : 0;

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 text-sky-800 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-stone-900">
                Penyimpanan Eksternal Google Drive (15 GB)
              </h4>
              {driveAccessToken ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Terhubung ke Drive</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <span>Perlu Otorisasi Drive</span>
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              Simpan cadangan database JSON (lengkap foto KTP &amp; KK), rekap Excel (.xlsx), dan arsip PDF ke folder khusus{' '}
              <strong className="text-stone-800">
                SI-WARGA 05 RT 05 BLOK E - Arsip &amp; Backup
              </strong>{' '}
              di Google Drive akun RT ({cloudUserEmail || 'rt05perumahanbsi@gmail.com'}).
            </p>
          </div>
        </div>

        {driveAccessToken && (
          <button
            type="button"
            onClick={refreshDriveState}
            disabled={isLoading || busyAction !== null}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl cursor-pointer disabled:opacity-50 min-h-[40px] self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Muat Ulang</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!driveAccessToken ? (
        <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-stone-600 space-y-1">
            <p className="font-bold text-stone-900">
              {cloudUserEmail
                ? `Akun aktif: ${cloudUserEmail} — Sesi Google Drive belum diotorisasi di tab ini.`
                : 'Masuk dengan akun Google Pengurus (mis. rt05perumahanbsi@gmail.com) untuk menggunakan kuota 15 GB Google Drive.'}
            </p>
            <p>
              Token akses Google Drive hanya disimpan sementara di memori browser demi keamanan akun RT dan tidak pernah disimpan permanen di perangkat publik.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onConnectGoogleDrive()}
            className="inline-flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-stone-50 active:bg-stone-100 text-[#1f1f1f] border border-[#747775] rounded-full text-xs sm:text-sm font-medium shadow-xs transition-all cursor-pointer shrink-0 min-h-[44px]"
            style={{ fontFamily: 'Roboto, Arial, sans-serif' }}
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span>Sign in with Google (Hubungkan Drive 15 GB)</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quota Meter */}
          <div className="bg-white border border-stone-200 rounded-xl p-3.5 sm:p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-stone-500">Akun Google Drive Aktif: </span>
                <strong className="text-stone-900">
                  {quota?.userEmail || cloudUserEmail || 'Akun Google Pengurus'}
                </strong>
              </div>
              {quota && (
                <div className="font-mono text-[11px] font-bold text-stone-800">
                  Terpakai {formatBytes(quota.usageBytes)} / {formatBytes(quota.limitBytes)} ({usagePercent}%) · Sisa {formatBytes(remainingBytes)}
                </div>
              )}
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
              <div
                className="h-full bg-sky-600 transition-all duration-300"
                style={{ width: `${Math.max(2, usagePercent)}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCreateJsonBackup}
              disabled={busyAction !== null}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer min-h-[42px]"
            >
              <FileJson className="w-4 h-4 shrink-0" />
              <span>
                {busyAction === 'json'
                  ? 'Mengunggah JSON...'
                  : `Simpan Backup Baru ke Drive (.json · ${citizens.length} KK)`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleUploadExcel}
              disabled={busyAction !== null}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer min-h-[42px]"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>
                {busyAction === 'excel'
                  ? 'Mengunggah Excel...'
                  : 'Upload Excel (.xlsx) ke Drive'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleUploadPdf}
              disabled={busyAction !== null || citizens.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer min-h-[42px]"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>
                {busyAction === 'pdf'
                  ? 'Membuat & Mengunggah PDF...'
                  : 'Upload PDF + KTP/KK ke Drive'}
              </span>
            </button>
          </div>

          {/* Archive File List */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="px-3.5 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs font-bold text-stone-800">
              <div className="flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-sky-700" />
                <span>Daftar Arsip di Google Drive ({files.length} File)</span>
              </div>
              <span className="text-[11px] font-normal text-stone-500">
                Folder: SI-WARGA 05 RT 05 BLOK E - Arsip &amp; Backup
              </span>
            </div>

            {isLoading && files.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500">
                Memuat daftar arsip dari Google Drive...
              </div>
            ) : files.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 space-y-1">
                <UploadCloud className="w-7 h-7 text-stone-300 mx-auto" />
                <p className="font-semibold text-stone-700">
                  Folder arsip Google Drive masih kosong
                </p>
                <p>
                  Klik salah satu tombol di atas untuk menyimpan cadangan JSON, Excel, atau PDF ke Google Drive.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {files.map((file) => {
                  const isJson =
                    file.name.toLowerCase().endsWith('.json') ||
                    file.mimeType === 'application/json';
                  const modifiedStr = new Date(file.modifiedTime).toLocaleString(
                    'id-ID',
                    {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  );

                  return (
                    <div
                      key={file.id}
                      className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-stone-50"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {formatBytes(file.size)} · Diperbarui {modifiedStr}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {isJson && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestoreBackupFile(file)}
                              disabled={busyAction !== null}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-50 rounded-lg cursor-pointer"
                              title="Pulihkan seluruh data warga dari file backup Drive ini"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>
                                {busyAction === `restore:${file.id}`
                                  ? 'Memulihkan...'
                                  : 'Pulihkan'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setPendingConfirm({ type: 'overwrite', file })
                              }
                              disabled={busyAction !== null}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 rounded-lg cursor-pointer"
                              title="Timpa file backup ini dengan data warga saat ini"
                            >
                              <Replace className="w-3 h-3" />
                              <span>
                                {busyAction === `overwrite:${file.id}`
                                  ? 'Menimpa...'
                                  : 'Timpa'}
                              </span>
                            </button>
                          </>
                        )}

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-sky-900 bg-sky-100 hover:bg-sky-200 rounded-lg"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setPendingConfirm({ type: 'delete', file })
                          }
                          disabled={busyAction !== null}
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg cursor-pointer"
                          title="Hapus file ini dari Google Drive"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal before Overwrite or Delete on Google Drive */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                pendingConfirm.type === 'delete'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-stone-900 mb-1">
              {pendingConfirm.type === 'delete'
                ? 'Hapus File dari Google Drive?'
                : 'Timpa File Backup Google Drive?'}
            </h4>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              {pendingConfirm.type === 'delete' ? (
                <>
                  File <strong>&ldquo;{pendingConfirm.file.name}&rdquo;</strong> akan dihapus permanen dari folder arsip Google Drive RT 05 Blok E. Lanjutkan?
                </>
              ) : (
                <>
                  Isi file <strong>&ldquo;{pendingConfirm.file.name}&rdquo;</strong> di Google Drive akan ditimpa dengan data terbaru ({citizens.length} KK beserta foto KTP/KK). Lanjutkan?
                </>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer min-h-[40px]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmedDriveAction}
                className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer min-h-[40px] ${
                  pendingConfirm.type === 'delete'
                    ? 'text-white bg-red-600 hover:bg-red-700'
                    : 'text-stone-950 bg-amber-400 hover:bg-amber-300'
                }`}
              >
                {pendingConfirm.type === 'delete'
                  ? 'Konfirmasi Hapus'
                  : 'Konfirmasi Timpa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
