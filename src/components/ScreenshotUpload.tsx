import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, HelpCircle, X, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { TimerVerificationState } from '../types/signal';

interface ScreenshotUploadProps {
  imagePreview: string | null;
  imageFileName: string | null;
  timerStatus?: TimerVerificationState | null;
  onImageSelected: (dataUrl: string, fileName: string, mimeType: string) => void;
  onImageRemoved: () => void;
  onRecheckTimer?: () => void;
  isAnalyzing: boolean;
  errorMessage: string | null;
  onClearError: () => void;
}

export const ScreenshotUpload: React.FC<ScreenshotUploadProps> = ({
  imagePreview,
  imageFileName,
  timerStatus,
  onImageSelected,
  onImageRemoved,
  onRecheckTimer,
  isAnalyzing,
  errorMessage,
  onClearError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);

  const referenceImagePath = '/assets/aistudio/Screenshot_2026-11-06-17-39-05-35_40deb401b9ffe8e1df2f1cc5ba480b12_dd0f56a4.jpg';

  const processFile = (file: File) => {
    onClearError();
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('INVALID IMAGE FORMAT. Please upload a PNG or JPG file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageSelected(dataUrl, file.name, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAnalyzing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isAnalyzing) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUseReference = () => {
    onClearError();
    setShowReferenceModal(false);
    onImageSelected(referenceImagePath, 'Quotex_USD_INR_Reference.jpg', 'image/jpeg');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isAnalyzing}
      />

      {!imagePreview ? (
        /* 1. LIQUID GLASS UPLOAD ZONE */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer liquid-glass-card rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-300 group relative overflow-hidden ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-[1.01]'
              : 'hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]'
          }`}
        >
          {/* Subtle light shimmer sweep */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer-sweep" />
          </div>

          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] mb-2.5">
            <UploadCloud className="w-6 h-6 stroke-[2.2]" />
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-cyan-300 transition font-terminal tracking-wide text-glow-white mb-0.5">
            Upload Quotex Screenshot
          </h3>

          <p className="text-xs text-slate-400 font-terminal mb-3.5">
            M1 chart with candlesticks (≤2m live)
          </p>

          <div className="flex items-center gap-2">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-terminal font-bold text-xs uppercase shadow-md transition"
            >
              Browse
            </motion.span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowReferenceModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/80 transition flex items-center gap-1 text-xs font-terminal cursor-pointer"
              title="View format guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Guide</span>
            </motion.button>
          </div>
        </div>
      ) : (
        /* 2. LIQUID GLASS LOADED SCREENSHOT PREVIEW */
        <div className="liquid-glass-card rounded-2xl p-3.5 sm:p-4 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Thumbnail Preview */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl bg-black border border-cyan-500/40 overflow-hidden shrink-0 flex items-center justify-center relative shadow-md">
                <img
                  src={imagePreview}
                  alt="Quotex chart"
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-cyan-500/25 animate-pulse" />
                )}
              </div>

              {/* Middle: File & Timer Status */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm sm:text-base font-black text-cyan-300 font-terminal tracking-wider text-glow-cyan truncate">
                    {timerStatus?.detectedMarket || 'QUOTEX OTC'}
                  </span>
                </div>

                {/* Simple High-Contrast Timer Status */}
                <div className="font-terminal text-xs">
                  {timerStatus?.isVerifying ? (
                    <span className="text-cyan-300 flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>Checking timer...</span>
                    </span>
                  ) : timerStatus?.isWithin2Minutes ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Timer: {timerStatus.detectedTime} (Live ✅)</span>
                    </span>
                  ) : timerStatus?.timerFound ? (
                    <span className="text-rose-400 flex items-center gap-1 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>Expired: {timerStatus.detectedTime} ❌</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Timer not detected</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick actions with motion */}
            <div className="flex items-center gap-1.5 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 border border-slate-700/80 transition disabled:opacity-50 flex items-center gap-1 text-xs font-terminal cursor-pointer shadow-md"
                title="Replace screenshot"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Change</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={onImageRemoved}
                disabled={isAnalyzing}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 hover:text-white border border-rose-500/40 transition disabled:opacity-50 flex items-center gap-1 text-xs font-terminal cursor-pointer shadow-md"
                title="Remove screenshot"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Inline error indicator if any */}
      {errorMessage && (
        <div className="mt-2.5 p-3 rounded-xl bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-terminal font-semibold leading-relaxed">
            {errorMessage}
          </span>
        </div>
      )}

      {/* Reference Format Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="liquid-glass-card rounded-2xl max-w-sm w-full p-5 border border-cyan-500/40 shadow-2xl relative">
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={() => setShowReferenceModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>

            <h3 className="text-sm font-bold text-white font-terminal uppercase tracking-wider mb-1 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Required Screenshot Format</span>
            </h3>
            <p className="text-xs text-slate-400 font-terminal mb-3">
              Must include 1-minute candlesticks and live timer.
            </p>

            <div className="rounded-xl overflow-hidden border border-slate-700 bg-black/80 max-h-72 flex items-center justify-center mb-3.5">
              <img
                src={referenceImagePath}
                alt="Quotex format"
                className="max-h-72 object-contain"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleUseReference}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider font-terminal shadow-lg cursor-pointer"
            >
              Load Example Screenshot
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};
