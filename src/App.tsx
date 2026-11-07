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

  // Clear or handle image change with instant validation & Quotex 24h timer check
  const handleImageSelected = async (dataUrl: string, fileName: string) => {
    setImagePreview(dataUrl);
    setImageFileName(fileName);
    setSignalResult(null);
    setErrorMessage(null);
    setDetectedMarket(null);

    // 1. Instant Quotex chart format validation
    const check = await validateAndAnalyzeChart(dataUrl, fileName);
    if (!check.isValidChart) {
      setErrorMessage(
        check.errorMessage ||
          'TRADE SIGNAL CANNOT BE GIVEN. PLEASE UPLOAD A VALID QUOTEX CHART SCREENSHOT LIKE THE REQUIRED FORMAT.'
      );
      setTimerStatus(null);
      return;
    }

    // 2. Quotex 24-Hour Timer & Market Asset validation
    setTimerStatus({
      isVerifying: true,
      timerFound: false,
      detectedTime: null,
      detectedMarket: undefined,
      isWithin2Minutes: false,
      diffSeconds: null,
    });

    try {
      const res = await fetch('/api/verify-timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          fileName,
          timestamp: Date.now(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTimerStatus({
          isVerifying: false,
          timerFound: data.timerFound,
          detectedTime: data.detectedTime,
          detectedMarket: data.detectedMarket,
          isWithin2Minutes: data.isWithin2Minutes,
          diffSeconds: data.diffSeconds,
          referenceDhakaTime: data.referenceDhakaTime,
          message: data.message,
        });

        if (data.detectedMarket) {
          setDetectedMarket(data.detectedMarket);
        }

        if (!data.isWithin2Minutes) {
          setErrorMessage(
            data.message ||
              'TRADE SIGNAL BLOCKED: Quotex screenshot is older than 2 minutes. Please take a live screenshot right now and upload within 2 minutes.'
          );
        } else {
          setErrorMessage(null);
        }
      } else {
        setTimerStatus({
          isVerifying: false,
          timerFound: false,
          detectedTime: null,
          isWithin2Minutes: false,
          diffSeconds: null,
          message: data.message,
        });
        setErrorMessage(data.message || 'Could not verify Quotex screenshot timer.');
      }
    } catch (err) {
      console.warn('Failed to verify screenshot timer:', err);
      setTimerStatus(null);
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
      let finalMarket = detectedMarket || 'USD/INR';
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
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Dynamic ambient dark glow effects with floating animations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-cyan-600/10 via-indigo-600/5 to-transparent blur-[120px] rounded-full animate-float-1" />
        <div className="absolute top-[35%] -left-32 w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full animate-float-2" />
        <div className="absolute top-[60%] -right-32 w-80 h-80 bg-cyan-600/10 blur-[100px] rounded-full animate-float-1" />
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col justify-between py-1">
        <div>
          {/* 1. Sleek Minimal Header */}
          <Header
            onLock={handleLock}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            liveDhakaTime={liveDhakaTime}
            isAnalyzing={isAnalyzing}
          />

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

            {/* GENERATE SIGNAL Button */}
            {!signalResult && (
              <div className="w-full max-w-xl mx-auto px-4 mb-3">
                <motion.button
                  whileHover={
                    imagePreview && !isAnalyzing && (!timerStatus || timerStatus.isWithin2Minutes)
                      ? { scale: 1.02 }
                      : undefined
                  }
                  whileTap={
                    imagePreview && !isAnalyzing && (!timerStatus || timerStatus.isWithin2Minutes)
                      ? { scale: 0.95 }
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
                  className={`w-full py-3.5 px-6 rounded-2xl font-black tracking-wider uppercase font-terminal text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-300 shadow-xl relative overflow-hidden ${
                    !imagePreview ||
                    isAnalyzing ||
                    !!errorMessage ||
                    timerStatus?.isVerifying ||
                    (timerStatus !== null && !timerStatus.isWithin2Minutes)
                      ? 'bg-slate-900/60 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 text-white border border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.45)] cursor-pointer text-glow-white'
                  }`}
                >
                  {/* Shimmer sweep beam */}
                  {imagePreview && !isAnalyzing && (!timerStatus || timerStatus.isWithin2Minutes) && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 animate-shimmer-sweep" />
                    </div>
                  )}

                  {isAnalyzing ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-cyan-200" />
                      <span>ANALYZING...</span>
                    </>
                  ) : timerStatus?.isVerifying ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-cyan-200" />
                      <span>CHECKING TIMER...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-white" />
                      <span>GENERATE SIGNAL</span>
                    </>
                  )}
                </motion.button>

                {imagePreview && timerStatus && !timerStatus.isWithin2Minutes && (
                  <p className="text-center text-xs font-terminal text-rose-400 mt-1 font-semibold">
                    ⚠️ Screenshot expired ({timerStatus.detectedTime || 'Old'}). Please upload a new one.
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
                  <div className="rounded-2xl p-4 bg-rose-950/80 border border-rose-500/60 text-center font-terminal shadow-xl animate-in fade-in">
                    <div className="flex items-center justify-center gap-2 text-rose-300 font-bold text-sm uppercase mb-1">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Screenshot Expired</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">
                      Timer <span className="text-rose-200 font-bold">{timerStatus.detectedTime}</span> has passed 2 min. Please take a new screenshot.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleRequestNewScreenshot}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                      <span>TAKE NEW SCREENSHOT</span>
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={executeAnalysis}
                    disabled={isAnalyzing}
                    className="w-full py-3 px-5 rounded-2xl font-bold tracking-wider uppercase font-terminal text-sm flex items-center justify-center gap-2 transition cursor-pointer bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent skew-x-12 animate-shimmer-sweep" />
                    </div>
                    <RotateCw className="w-4 h-4 relative z-10 text-cyan-400" />
                    <span className="relative z-10 text-glow-cyan">GENERATE AGAIN</span>
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Compact Telegram Link & Footer */}
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
