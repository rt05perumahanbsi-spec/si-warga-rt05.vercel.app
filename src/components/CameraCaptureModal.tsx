import React from 'react';
import {
  Camera,
  Check,
  RefreshCw,
  RotateCcw,
  SwitchCamera,
  X,
  AlertTriangle,
} from 'lucide-react';
import { compressDataUrl, compressImageFile } from '../utils/storageHelper';

interface CameraCaptureModalProps {
  isOpen: boolean;
  docType: 'ktp' | 'kk';
  onClose: () => void;
  onCapture: (compressedDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  docType,
  onClose,
  onCapture,
}) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = React.useState<'environment' | 'user'>('environment');
  const [capturedPreview, setCapturedPreview] = React.useState<string>('');
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [isStarting, setIsStarting] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const stopStream = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = React.useCallback(
    async (mode: 'environment' | 'user') => {
      stopStream();
      setCameraError(null);
      setIsStarting(true);

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError(
          'Browser tidak mendukung kamera langsung. Gunakan tombol "Buka Kamera HP / Pilih Foto" di bawah.'
        );
        setIsStarting(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1600 },
            height: { ideal: 1200 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch {
        setCameraError(
          'Izin kamera tidak tersedia atau diblokir browser. Anda tetap bisa menjepret langsung lewat tombol Kamera HP di bawah.'
        );
      } finally {
        setIsStarting(false);
      }
    },
    [stopStream]
  );

  React.useEffect(() => {
    if (!isOpen) {
      stopStream();
      setCapturedPreview('');
      setCameraError(null);
      return;
    }
    if (!capturedPreview) {
      startCamera(facingMode);
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, capturedPreview, startCamera, stopStream]);

  if (!isOpen) return null;

  const title = docType === 'ktp' ? 'Ambil Foto KTP Kepala Keluarga' : 'Ambil Foto Kartu Keluarga (KK)';

  const handleTakeSnapshot = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const compressed = await compressDataUrl(
        rawDataUrl,
        docType === 'kk' ? 1500 : 1400,
        docType === 'kk' ? 0.84 : 0.82
      );
      stopStream();
      setCapturedPreview(compressed);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNativeCameraFallback = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsProcessing(true);
    try {
      const compressed = await compressImageFile(
        file,
        docType === 'kk' ? 1500 : 1400,
        docType === 'kk' ? 0.84 : 0.82
      );
      stopStream();
      setCapturedPreview(compressed);
    } catch {
      setCameraError('Gagal memproses hasil foto kamera.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!capturedPreview) return;
    onCapture(capturedPreview);
    setCapturedPreview('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col">
        {/* Header */}
        <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">
                Kamera Langsung SI-WARGA 05
              </div>
              <h3 className="text-xs sm:text-sm font-bold">{title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg cursor-pointer"
            aria-label="Tutup kamera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Preview */}
        <div className="p-4 space-y-3 bg-stone-50">
          <div className="relative w-full aspect-[4/3] bg-stone-900 rounded-xl overflow-hidden border border-stone-300 flex items-center justify-center">
            {capturedPreview ? (
              <img
                src={capturedPreview}
                alt="Hasil foto kamera"
                className="w-full h-full object-contain bg-stone-950"
              />
            ) : cameraError ? (
              <div className="p-5 text-center text-stone-200 space-y-3 max-w-sm">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-xs leading-relaxed text-stone-300">{cameraError}</p>
                <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer min-h-[42px]">
                  <Camera className="w-4 h-4" />
                  <span>Buka Kamera HP / Pilih Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleNativeCameraFallback}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-cover"
                />
                {/* Document Alignment Guide Overlay */}
                <div className="pointer-events-none absolute inset-4 sm:inset-6 border-2 border-dashed border-amber-400/80 rounded-xl flex items-end justify-center pb-2">
                  <span className="px-2.5 py-0.5 rounded bg-stone-950/70 text-[10px] font-semibold text-amber-300">
                    Posisikan dokumen {docType === 'ktp' ? 'KTP' : 'Kartu Keluarga'} di dalam bingkai
                  </span>
                </div>
                {isStarting && (
                  <div className="absolute inset-0 bg-stone-950/60 flex items-center justify-center text-xs text-white font-semibold">
                    Mengaktifkan kamera...
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          {capturedPreview ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setCapturedPreview('')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl cursor-pointer min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Foto Ulang</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs cursor-pointer min-h-[44px]"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Foto Ini</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              {!cameraError && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                    }
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl cursor-pointer min-h-[44px]"
                    title="Ganti kamera depan / belakang"
                  >
                    <SwitchCamera className="w-4 h-4" />
                    <span>Putar Kamera</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTakeSnapshot}
                    disabled={isStarting || isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-xl shadow-md cursor-pointer min-h-[44px] active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isProcessing ? 'Memproses...' : 'Jepret Foto Sekarang'}</span>
                  </button>
                </>
              )}

              <label
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl cursor-pointer min-h-[44px]"
                title="Buka aplikasi kamera bawaan HP"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kamera HP</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleNativeCameraFallback}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
