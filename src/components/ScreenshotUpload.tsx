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
        /* 1. APPLE NEBULA LIQUID GLASS UPLOAD CARD */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer glass-panel rounded-3xl p-7 sm:p-9 flex flex-col items-center justify-center text-center transition-all duration-300 group relative overflow-hidden ${
            isDragging
              ? 'border-purple-400 bg-purple-950/30 shadow-[0_0_40px_rgba(168,85,247,0.35)] scale-[1.01]'
              : 'hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
          }`}
        >
          {/* Subtle cosmic light reflection */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer-sweep" />
          </div>

          <div className="w-14 h-14 rounded-2xl glass-panel-subtle border border-white/15 flex items-center justify-center text-purple-200 group-hover:scale-105 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.2)] mb-3.5">
            <UploadCloud className="w-7 h-7 stroke-[1.8]" />
          </div>

          <h3 className="text-base sm:text-lg font-display font-bold text-white group-hover:text-purple-100 transition tracking-tight mb-1">
            Upload Quotex Screenshot
          </h3>

          <p className="text-xs text-slate-400 font-sans mb-5">
            Supported formats: PNG, JPG or WEBP
          </p>

          <div className="flex items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              className="glass-button-silver px-6 py-2.5 rounded-2xl font-display font-bold text-xs sm:text-sm tracking-wide shadow-lg cursor-pointer"
            >
              Choose File
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowReferenceModal(true);
              }}
              className="px-3.5 py-2.5 rounded-2xl glass-panel-subtle text-slate-400 hover:text-white border border-white/10 transition flex items-center gap-1.5 text-xs font-sans cursor-pointer"
              title="View format guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-300" />
              <span>Guide</span>
            </motion.button>
          </div>
        </div>
      ) : (
        /* 2. LOADED SCREENSHOT PREVIEW CARD */
        <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/15 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-3.5">
            {/* Left: Thumbnail Preview */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-black/80 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center relative shadow-lg">
                <img
                  src={imagePreview}
                  alt="Quotex chart"
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-purple-500/25 animate-pulse" />
                )}
              </div>

              {/* Middle: File & Timer Status */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base sm:text-lg font-display font-bold text-white tracking-tight truncate">
                    {timerStatus?.detectedMarket || 'Quotex Chart'}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="text-xs font-sans">
                  {timerStatus?.isVerifying ? (
                    <span className="text-purple-300 flex items-center gap-1.5 animate-pulse font-medium">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying timer...</span>
                    </span>
                  ) : timerStatus?.isWithin2Minutes ? (
                    <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live verified: {timerStatus.detectedTime}</span>
                    </span>
                  ) : timerStatus?.timerFound ? (
                    <span className="text-rose-400 flex items-center gap-1.5 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>Expired: {timerStatus.detectedTime} (≤2m required)</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Timer not detected</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick actions with motion */}
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="px-3 py-2 rounded-xl glass-panel-subtle hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition disabled:opacity-50 flex items-center gap-1.5 text-xs font-sans cursor-pointer"
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
                className="px-3 py-2 rounded-xl glass-panel-subtle hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition disabled:opacity-50 flex items-center gap-1.5 text-xs font-sans cursor-pointer"
                title="Remove screenshot"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove</span>
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
