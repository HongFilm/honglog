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
export const THEME = {
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

export type ThemeColors = typeof THEME;
