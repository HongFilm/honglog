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
