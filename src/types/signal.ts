export type SignalDirection = 'UP' | 'DOWN';

export interface TimerVerificationState {
  isVerifying: boolean;
  timerFound: boolean;
  detectedTime: string | null;
  detectedMarket?: string;
  isWithin2Minutes: boolean;
  diffSeconds: number | null;
  referenceDhakaTime?: string;
  message?: string;
}

export interface SignalData {
  market: string;
  entryTime: string;
  entryM1Formatted: string;
  direction: SignalDirection;
  confidence: number;
  generationTimestamp: number;
  entryTimestamp: number;
  engineUsed?: 'v2' | 'v2.1';
  detectedTimer?: string;
  candlestickPattern?: string;
  marketStructure?: string;
  reasoning?: string;
}

export type AnalysisStage =
  | 'INITIALIZING'
  | 'SCANNING_CHART'
  | 'IDENTIFYING_MARKET'
  | 'ANALYZING_CANDLESTICKS'
  | 'ANALYZING_STRUCTURE'
  | 'PROCESSING_PRICE_ACTION'
  | 'CALCULATING_ENTRY_TIME'
  | 'FINALIZING_SIGNAL';

export interface StageInfo {
  number: string;
  label: string;
  description: string;
}

export const SIGNAL_STAGES: Record<number, StageInfo> = {
  1: {
    number: 'STAGE 01',
    label: 'STAGE 01: INITIALIZING SIGNAL ENGINE',
    description: 'Calibrating Quotex chart scanning engine',
  },
  2: {
    number: 'STAGE 02',
    label: 'STAGE 02: SCANNING CHART SCREENSHOT',
    description: 'Scanning candlestick structure and price levels',
  },
  3: {
    number: 'STAGE 03',
    label: 'STAGE 03: IDENTIFYING MARKET ASSET',
    description: 'Detecting trading instrument name from screenshot',
  },
  4: {
    number: 'STAGE 04',
    label: 'STAGE 04: ANALYZING CANDLESTICK PATTERNS',
    description: 'Evaluating bodies, wicks, and rejection geometry',
  },
  5: {
    number: 'STAGE 05',
    label: 'STAGE 05: ANALYZING MARKET STRUCTURE',
    description: 'Inspecting support and resistance boundaries',
  },
  6: {
    number: 'STAGE 06',
    label: 'STAGE 06: PROCESSING PRICE ACTION',
    description: 'Measuring buyer absorption vs seller pressure',
  },
  7: {
    number: 'STAGE 07',
    label: 'STAGE 07: CALCULATING ENTRY TIME',
    description: 'Computing exact M1 next-minute boundary in Asia/Dhaka (UTC+6)',
  },
  8: {
    number: 'STAGE 08',
    label: 'STAGE 08: FINALIZING SIGNAL',
    description: 'Locking final UP/DOWN signal for next candle',
  },
};
