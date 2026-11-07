/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ScreenshotUpload } from './components/ScreenshotUpload';
import { ProcessingAnimation } from './components/ProcessingAnimation';
import { SignalResultCard } from './components/SignalResultCard';
import { MoneyManagementModal } from './components/MoneyManagementModal';
import { TelegramPromoCard } from './components/TelegramPromoCard';
import { Footer } from './components/Footer';
import { PasswordLockModal } from './components/PasswordLockModal';
import { SignalData, TimerVerificationState } from './types/signal';
import { calculateDhakaNextMinute, getLiveDhakaTime, checkDhakaScreenshotExpiration } from './utils/time';
import { validateAndAnalyzeChart } from './utils/chartAnalysis';
import { triggerSignalCompleteVibration } from './utils/haptics';
import { soundEngine } from './utils/audio';
import { extractMarketFromFileName, verifyTimerClientSide } from './utils/quotexDetector';
import { Play, RotateCw, AlertTriangle, Camera, Calculator, ChevronRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  // Password Protected Access State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('candle_mindset_auth') === 'granted';
  });

  // Engine Mode: 'v2' (Local Chart Engine)
  const engineVersion = 'v2' as const;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [entryTimePreview, setEntryTimePreview] = useState<string | undefined>(undefined);

  const [signalResult, setSignalResult] = useState<SignalData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timerStatus, setTimerStatus] = useState<TimerVerificationState | null>(null);
  const [detectedMarket, setDetectedMarket] = useState<string | null>(null);
  const [liveDhakaTime, setLiveDhakaTime] = useState<string>(() => getLiveDhakaTime());
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  const stageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Live timer interval: ticks every 1s and dynamically checks screenshot timer expiration
  useEffect(() => {
    const timer = setInterval(() => {
      const nowDhaka = getLiveDhakaTime();
      setLiveDhakaTime(nowDhaka);

      if (timerStatus?.detectedTime && imagePreview) {
        const check = checkDhakaScreenshotExpiration(timerStatus.detectedTime);
        if (check.isExpired && timerStatus.isWithin2Minutes) {
          setTimerStatus((prev) =>
            prev
              ? {
                  ...prev,
                  isWithin2Minutes: false,
                  diffSeconds: check.diffSeconds,
                  message: `QUOTEX SCREENSHOT EXPIRED: Captured at ${prev.detectedTime}. Current Dhaka time is ${nowDhaka}. Please take a new live screenshot.`,
                }
              : null
          );
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timerStatus, imagePreview]);

  const handleUnlock = () => {
    sessionStorage.setItem('candle_mindset_auth', 'granted');
    setIsAuthenticated(true);
  };

  const handleLock = () => {
    sessionStorage.removeItem('candle_mindset_auth');
    setIsAuthenticated(false);
  };

  // Crisp crop of Quotex top 35% header for razor-sharp OCR recognition
  const createQuotexHeaderCrop = (src: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const cropHeight = Math.round(img.height * 0.35);
        const targetWidth = Math.min(img.width, 1100);
        const scale = targetWidth / img.width;
        canvas.width = targetWidth;
        canvas.height = Math.round(cropHeight * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, img.width, cropHeight, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.90));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  };

  // Fast client-side image downsampler for near-instant OCR verification (< 400ms)
  const downsampleForVerification = (src: string, maxDim = 850): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (img.width <= maxDim && img.height <= maxDim) {
          resolve(src);
          return;
        }
        const scale = Math.min(maxDim / img.width, maxDim / img.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  };

  // Clear or handle image change with instant validation & Quotex 24h timer check
  const handleImageSelected = async (
    dataUrl: string,
    fileName: string,
    mimeType?: string,
    fileLastModified?: number
  ) => {
    setImagePreview(dataUrl);
    setImageFileName(fileName);
    setSignalResult(null);
    setErrorMessage(null);

    // Initial instant detection from file
    const initialMarket = extractMarketFromFileName(fileName);
    if (initialMarket) {
      setDetectedMarket(initialMarket);
    }

    const clientTimer = verifyTimerClientSide(fileName, fileLastModified);

    // 1. Instant Quotex chart format validation
    const check = await validateAndAnalyzeChart(dataUrl, fileName, initialMarket);
    if (!check.isValidChart) {
      setErrorMessage(
        check.errorMessage ||
          'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.'
      );
      setTimerStatus(null);
      return;
    }

    // 2. Set verifying state
    setTimerStatus({
      isVerifying: true,
      timerFound: false,
      detectedTime: null,
      detectedMarket: initialMarket || undefined,
      isWithin2Minutes: false,
      diffSeconds: null,
    });

    try {
      const [ocrPayload, headerBase64] = await Promise.all([
        downsampleForVerification(dataUrl),
        createQuotexHeaderCrop(dataUrl),
      ]);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const res = await fetch('/api/verify-timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: ocrPayload,
          headerBase64,
          fileName,
          timestamp: Date.now(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const finalMkt = data.detectedMarket || initialMarket || 'USD/BRL (OTC)';
          setDetectedMarket(finalMkt);
          setTimerStatus({
            isVerifying: false,
            timerFound: data.timerFound,
            detectedTime: data.detectedTime || clientTimer.detectedTime,
            detectedMarket: finalMkt,
            isWithin2Minutes: data.isWithin2Minutes,
            diffSeconds: data.diffSeconds,
            referenceDhakaTime: data.referenceDhakaTime,
            message: data.message,
          });

          if (!data.isWithin2Minutes) {
            setErrorMessage(
              data.message ||
                'TRADE SIGNAL BLOCKED: Quotex screenshot is older than 2 minutes. Please take a live screenshot right now and upload within 2 minutes.'
            );
          } else {
            setErrorMessage(null);
          }
          return;
        }
      }
      throw new Error('Server verification unavailable');
    } catch (err) {
      // Robust client-side fallback: ensure app NEVER fails on Render or static hosting
      const fallbackMarket = initialMarket || detectedMarket || 'USD/BRL (OTC)';
      setDetectedMarket(fallbackMarket);
      setTimerStatus({
        isVerifying: false,
        timerFound: true,
        detectedTime: clientTimer.detectedTime,
        detectedMarket: fallbackMarket,
        isWithin2Minutes: clientTimer.isWithin2Minutes,
        diffSeconds: clientTimer.diffSeconds,
        referenceDhakaTime: getLiveDhakaTime(),
        message: clientTimer.message,
      });

      if (!clientTimer.isWithin2Minutes) {
        setErrorMessage(
          clientTimer.message ||
            'TRADE SIGNAL BLOCKED: Quotex screenshot is older than 2 minutes. Please take a live screenshot right now and upload within 2 minutes.'
        );
      } else {
        setErrorMessage(null);
      }
    }
  };

  const handleImageRemoved = () => {
    setImagePreview(null);
    setImageFileName(null);
    setSignalResult(null);
    setErrorMessage(null);
    setTimerStatus(null);
    setDetectedMarket(null);
    setIsAnalyzing(false);
    if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
  };

  const handleRequestNewScreenshot = () => {
    setImagePreview(null);
    setImageFileName(null);
    setSignalResult(null);
    setErrorMessage(null);
    setTimerStatus(null);
    setDetectedMarket(null);
    setIsAnalyzing(false);
    if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Helper to step through the 8 stages smoothly
  const runStageAnimation = (initialTimeDhaka: string): Promise<void> => {
    return new Promise((resolve) => {
      setCurrentStage(1);
      setEntryTimePreview(initialTimeDhaka);

      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);

      let stage = 1;
      stageIntervalRef.current = setInterval(() => {
        stage += 1;
        if (stage <= 8) {
          setCurrentStage(stage);
        }
        if (stage === 8) {
          if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
          setTimeout(() => {
            resolve();
          }, 250);
        }
      }, 180);
    });
  };

  // Execute Analysis with Chosen Engine (v2)
  const executeAnalysis = async () => {
    if (!imagePreview) {
      setErrorMessage('PLEASE UPLOAD A CHART SCREENSHOT.');
      return;
    }

    // Dynamic Quotex timer verification rule against live Dhaka time
    if (timerStatus?.detectedTime) {
      const expiration = checkDhakaScreenshotExpiration(timerStatus.detectedTime);
      if (expiration.isExpired) {
        setSignalResult(null);
        setIsAnalyzing(false);
        setTimerStatus((prev) => (prev ? { ...prev, isWithin2Minutes: false, diffSeconds: expiration.diffSeconds } : null));
        setErrorMessage(
          `TRADE SIGNAL BLOCKED: Quotex screenshot captured at ${timerStatus.detectedTime} has expired. Dhaka time is now ${expiration.currentDhakaTime}. Please take a new live screenshot and upload here.`
        );
        return;
      }
    } else if (timerStatus && !timerStatus.isWithin2Minutes) {
      setSignalResult(null);
      setIsAnalyzing(false);
      setErrorMessage(
        timerStatus.message ||
          'TRADE SIGNAL BLOCKED: Quotex screenshot has expired. Please upload a live screenshot taken within 2 minutes.'
      );
      return;
    }

    setErrorMessage(null);
    setSignalResult(null);
    setIsAnalyzing(true);

    // Capture generation timestamp the exact moment user clicks GENERATE SIGNAL
    const clickTimestamp = Date.now();
    const entryCalc = calculateDhakaNextMinute(clickTimestamp);

    try {
      let finalMarket = detectedMarket || 'USD/BRL (OTC)';
      let finalDirection: 'UP' | 'DOWN' = 'UP';
      let finalConfidence = 91;

      // ============================================
      // AI ENGINE v2: FAST LOCAL CHART ENGINE
      // ============================================
      const [localAnalysis] = await Promise.all([
        validateAndAnalyzeChart(imagePreview, imageFileName, detectedMarket),
        runStageAnimation(entryCalc.m1String),
      ]);

      if (!localAnalysis.isValidChart) {
        setIsAnalyzing(false);
        setSignalResult(null);
        setErrorMessage(
          localAnalysis.errorMessage ||
            'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.'
        );
        return;
      }

      finalMarket = detectedMarket || localAnalysis.market;
      finalDirection = localAnalysis.direction;
      finalConfidence = localAnalysis.confidence;

      setIsAnalyzing(false);
      setSignalResult({
        market: finalMarket,
        entryTime: entryCalc.formattedTime,
        entryM1Formatted: entryCalc.m1String,
        direction: finalDirection,
        confidence: finalConfidence,
        generationTimestamp: clickTimestamp,
        entryTimestamp: entryCalc.entryTimestamp,
        engineUsed: engineVersion,
        detectedTimer: timerStatus?.detectedTime || undefined,
      });

      // Subtle vibration feedback on mobile when signal generation is complete
      triggerSignalCompleteVibration(finalDirection);

      // Play futuristic audio chime
      if (finalDirection === 'UP') {
        soundEngine.playUpSignal();
      } else {
        soundEngine.playDownSignal();
      }

      // Smooth scroll to the result card
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
      setSignalResult(null);
      setErrorMessage(
        'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.'
      );
    }
  };

  // If not authenticated, render Password Protected Access Screen
  if (!isAuthenticated) {
    return <PasswordLockModal onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-[#030308] text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200 relative overflow-x-hidden">
      {/* Fixed Cosmic Purple Nebula Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/assets/purple_nebula_bg.jpg"
          alt="Cosmic Nebula Background"
          className="w-full h-full object-cover object-center opacity-85 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030308]/70 via-[#030308]/55 to-[#030308]/90 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.18),transparent_65%)]" />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col justify-between py-1">
        <div>
          {/* 1. Header */}
          <Header
            onLock={handleLock}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            liveDhakaTime={liveDhakaTime}
            isAnalyzing={isAnalyzing}
          />

          {/* 2. Hero Section */}
          <div className="w-full max-w-xl mx-auto px-4 pt-3 pb-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight drop-shadow-md">
              Quotex Screenshot Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1">
              Upload your chart and get AI signal
            </p>
          </div>

          <div className="pt-2">
            {/* Screenshot Upload */}
            <ScreenshotUpload
              imagePreview={imagePreview}
              imageFileName={imageFileName}
              timerStatus={timerStatus}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              isAnalyzing={isAnalyzing}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />

            {/* GENERATE SIGNAL Button (Pearl-white & Silver Liquid Glass) */}
            {!signalResult && (
              <div className="w-full max-w-xl mx-auto px-4 mb-3">
                <motion.button
                  whileHover={
                    imagePreview && !isAnalyzing && (!timerStatus || timerStatus.isWithin2Minutes)
                      ? { scale: 1.015 }
                      : undefined
                  }
                  whileTap={
                    imagePreview && !isAnalyzing && (!timerStatus || timerStatus.isWithin2Minutes)
                      ? { scale: 0.985 }
                      : undefined
                  }
                  type="button"
                  onClick={executeAnalysis}
                  disabled={
                    !imagePreview ||
                    isAnalyzing ||
                    !!errorMessage ||
                    timerStatus?.isVerifying ||
                    (timerStatus !== null && !timerStatus.isWithin2Minutes)
                  }
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-display font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-xl relative overflow-hidden ${
                    !imagePreview ||
                    isAnalyzing ||
                    !!errorMessage ||
                    timerStatus?.isVerifying ||
                    (timerStatus !== null && !timerStatus.isWithin2Minutes)
                      ? 'opacity-40 cursor-not-allowed bg-slate-900/60 text-slate-400 border border-white/10'
                      : 'glass-button-silver cursor-pointer'
                  }`}
                >
                  {/* Subtle pearl gleam */}
                  {imagePreview && !isAnalyzing && (!timerStatus || timerStatus.isWithin2Minutes) && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-shimmer-sweep" />
                    </div>
                  )}

                  {isAnalyzing ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-slate-900" />
                      <span>Analyzing Chart...</span>
                    </>
                  ) : timerStatus?.isVerifying ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-slate-900" />
                      <span>Verifying Dhaka Timer...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-slate-950" />
                      <span>Generate Signal</span>
                    </>
                  )}
                </motion.button>

                {imagePreview && timerStatus?.isVerifying && (
                  <p className="text-center text-xs text-purple-300/80 mt-2 font-medium flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    <span>Verifying chart timer with Dhaka live time...</span>
                  </p>
                )}

                {imagePreview && timerStatus && !timerStatus.isVerifying && timerStatus.timerFound && !timerStatus.isWithin2Minutes && (
                  <p className="text-center text-xs text-rose-300/90 mt-2 font-medium">
                    ⚠️ Screenshot expired ({timerStatus.detectedTime}). Please upload a new one.
                  </p>
                )}
              </div>
            )}

            {/* Processing Animation */}
            {isAnalyzing && (
              <ProcessingAnimation
                currentStage={currentStage}
                entryTimePreview={entryTimePreview}
              />
            )}

            {/* Signal Result Card */}
            {signalResult && !isAnalyzing && (
              <SignalResultCard signal={signalResult} />
            )}

            {/* GENERATE AGAIN or EXPIRED Prompt */}
            {signalResult && !isAnalyzing && (
              <div className="w-full max-w-xl mx-auto px-4 mb-3">
                {timerStatus && !timerStatus.isWithin2Minutes ? (
                  <div className="glass-panel rounded-2xl p-4 text-center shadow-xl animate-in fade-in border-rose-500/30">
                    <div className="flex items-center justify-center gap-2 text-rose-300 font-semibold text-sm mb-1 font-display">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Screenshot Expired</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3 font-sans">
                      Timer <span className="text-rose-200 font-bold">{timerStatus.detectedTime}</span> has passed 2 min. Please take a new screenshot.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleRequestNewScreenshot}
                      className="w-full py-3 px-4 rounded-xl font-display font-bold text-xs uppercase bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take New Screenshot</span>
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    onClick={executeAnalysis}
                    disabled={isAnalyzing}
                    className="glass-panel w-full py-3.5 px-5 rounded-2xl font-display font-bold tracking-wide text-sm flex items-center justify-center gap-2.5 transition cursor-pointer text-white hover:text-purple-200 hover:border-purple-400/40 shadow-xl relative overflow-hidden"
                  >
                    <RotateCw className="w-4 h-4 text-purple-300" />
                    <span>Generate Again</span>
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Telegram Link & Footer */}
        <div>
          <TelegramPromoCard />
          <Footer />
        </div>
      </div>

      {/* MONEY MANAGEMENT MODAL */}
      <MoneyManagementModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}
