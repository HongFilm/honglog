export interface TakeEntry {
  id: string;
  slate: number;
  scene: string;
  shot: string;
  take: number;
  isGood: boolean;
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
  bg: '#000000',
  surface: '#111111',
  surfaceRaised: '#1A1A1A',
  surfaceHover: '#222222',
  border: '#2C2C2C',
  borderLight: '#3D3D3D',
  accent: '#FF3838',
  accentDim: '#D62828',
  accentGlow: 'rgba(255, 56, 56, 0.25)',
  accentWash: 'rgba(255, 56, 56, 0.12)',
  textPrimary: '#FFFFFF',
  textSecondary: '#9E9E9E',
  textFaint: '#636363',
  good: '#4ADE80',
  danger: '#FF6B6B',
  fontDisplay: 'Oswald',
  fontMono: 'Courier',
  fontUI: 'Inter',
} as const;

export const LIGHT_THEME: ThemeColors = {
  bg: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceRaised: '#F0F0F0',
  surfaceHover: '#E5E5E5',
  border: '#D4D4D4',
  borderLight: '#C0C0C0',
  accent: '#FF3838',
  accentDim: '#D62828',
  accentGlow: 'rgba(255, 56, 56, 0.15)',
  accentWash: 'rgba(255, 56, 56, 0.08)',
  textPrimary: '#000000',
  textSecondary: '#4A4A4A',
  textFaint: '#8A8A8A',
  good: '#22C55E',
  danger: '#EF4444',
  fontDisplay: 'Oswald',
  fontMono: 'Courier',
  fontUI: 'Inter',
} as const;
