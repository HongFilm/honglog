export type TakeStatus = 'PRINT' | 'HOLD' | 'NG';

export interface CameraTakeItem {
  camera: string;
  card: string;
  clipName?: string;
  lens?: string;
  tstop?: string;
  shutter?: string;
  iso?: string;
  filter?: string;
  fps?: string;
}

export interface TakeEntry {
  id: string;
  slate: number;
  scene: string;
  shot: string;
  take: number;
  isGood: boolean; // true = PRINT
  status?: TakeStatus; // 'PRINT' | 'HOLD' | 'NG'
  clipName: string;
  camera: string;
  card: string;
  lens: string;
  shutter: string;
  iso: string;
  filter: string;
  tstop: string;
  fps: string;
  notes: string;
  timestamp: number;
  day: number;
  intExt?: 'INT' | 'EXT'; // Interior / Exterior
  dayNight?: 'DAY' | 'NIGHT'; // Day / Night lighting
  cameras?: CameraTakeItem[]; // For multi-camera support
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  meta: ProductionMeta;
  takes: TakeEntry[];
}

export interface ProductionMeta {
  production: string;
  prodNumber: string;
  director: string;
  dop: string;
  firstAc: string;
  secondAc: string;
  mediaId: string;
  cameraId: string;
  fileFormat: string;
  aspectRatio: string;
  lut: string;
  projectFps: string;
  cameras: string[];
  cards: string[];
  lenses: string[];
  shutters: string[];
  filters: string[];
  isos: string[];
}

// Shared theme colors extracted from logo.jpeg (Red/White/Black)
export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceRaised: string;
  surfaceHover: string;
  border: string;
  borderLight: string;
  accent: string;
  accentDim: string;
  accentGlow: string;
  accentWash: string;
  textPrimary: string;
  textSecondary: string;
  textFaint: string;
  good: string;
  danger: string;
  fontDisplay: string;
  fontMono: string;
  fontUI: string;
};

export const THEME: ThemeColors = {
  bg: '#0E0E12',
  surface: '#14151B',
  surfaceRaised: '#1C1D24',
  surfaceHover: '#252528',
  border: '#2C2C36',
  borderLight: '#3D3D49',
  accent: '#E53935',
  accentDim: '#C62828',
  accentGlow: 'rgba(229, 57, 53, 0.22)',
  accentWash: 'rgba(229, 57, 53, 0.12)',
  textPrimary: '#F7F8FA',
  textSecondary: '#9E9EA7',
  textFaint: '#636370',
  good: '#00BB7F',
  danger: '#E53935',
  fontDisplay: 'DM Sans',
  fontMono: 'DM Mono',
  fontUI: 'DM Sans',
} as const;

export const LIGHT_THEME: ThemeColors = {
  bg: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceRaised: '#F0F0F3',
  surfaceHover: '#E6E6EA',
  border: '#D8D8DC',
  borderLight: '#C4C4C8',
  accent: '#E53935',
  accentDim: '#C62828',
  accentGlow: 'rgba(229, 57, 53, 0.15)',
  accentWash: 'rgba(229, 57, 53, 0.08)',
  textPrimary: '#101010',
  textSecondary: '#55555C',
  textFaint: '#888890',
  good: '#00BB7F',
  danger: '#E53935',
  fontDisplay: 'DM Sans',
  fontMono: 'DM Mono',
  fontUI: 'DM Sans',
} as const;
