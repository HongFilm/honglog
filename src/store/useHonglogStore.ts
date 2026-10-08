import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TakeEntry, ProductionMeta } from '../types';

const STORAGE_KEY_TAKES = '@honglog_takes_v1';
const STORAGE_KEY_META = '@honglog_meta_v1';

export const defaultMeta: ProductionMeta = {
  production: 'Hong Films Project',
  prodNumber: '01',
  director: '',
  dop: '',
  firstAc: '',
  secondAc: '',
  mediaId: 'A01',
  cameraId: 'CAM-A',
  fileFormat: 'ProRes 422 HQ',
  aspectRatio: '1.85:1',
  lut: 'Rec.709',
  projectFps: '24',
  cameras: ['A (FX6)', 'B (FX3)', 'C (A7CII)'],
  cards: ['A001', 'B001', 'C001', 'D001'],
  lenses: ['18', '24', '35', '50', '75', '125'],
  shutters: ['180°', '1/48', '1/50', '1/96', '1/100'],
  filters: ['Clear', 'ND3', 'ND6', 'ND9', 'Diffusion 1/4'],
  isos: ['100', '200', '400', '800', '1600', '3200', '6400'],
};

interface FormState {
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
}

interface HonglogStore {
  meta: ProductionMeta;
  takes: TakeEntry[];
  form: FormState;
  isHydrated: boolean;
  selectedDay: number;

  // Actions
  hydrate: () => Promise<void>;
  updateMeta: (partial: Partial<ProductionMeta>) => Promise<void>;
  setForm: (partial: Partial<FormState>) => void;
  incrementSlate: (delta: number) => void;
  incrementTake: (delta: number) => void;
  addSuffixToScene: (suffix: string) => void;
  addSuffixToShot: (suffix: string) => void;
  stripSuffixScene: () => void;
  toggleGoodTake: () => void;
  addTake: () => Promise<TakeEntry>;
  deleteTake: (id: string) => Promise<void>;
  updateTake: (id: string, partial: Partial<TakeEntry>) => Promise<void>;
  clearAllTakes: () => Promise<void>;
  setSelectedDay: (day: number) => void;
}

export const useHonglogStore = create<HonglogStore>((set, get) => ({
  meta: defaultMeta,
  takes: [],
  isHydrated: false,
  selectedDay: 1,

  form: {
    slate: 1,
    scene: '1',
    shot: '1',
    take: 1,
    isGood: false,
    clipName: 'A001_001',
    camera: 'A (FX6)',
    card: 'A001',
    lens: '35',
    shutter: '180°',
    iso: '800',
    filter: 'Clear',
    tstop: '2.8',
    fps: '24',
    notes: '',
  },

  hydrate: async () => {
    try {
      const [savedTakes, savedMeta] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_TAKES),
        AsyncStorage.getItem(STORAGE_KEY_META),
      ]);

      const parsedTakes: TakeEntry[] = savedTakes ? JSON.parse(savedTakes) : [];
      const parsedMeta: ProductionMeta = savedMeta ? { ...defaultMeta, ...JSON.parse(savedMeta) } : defaultMeta;

      set({
        takes: parsedTakes,
        meta: parsedMeta,
        isHydrated: true,
      });

      // Update form defaults from meta if available
      if (parsedMeta.cameras.length > 0) {
        set((state) => ({
          form: {
            ...state.form,
            camera: parsedMeta.cameras[0],
            card: parsedMeta.cards[0] || 'A001',
            lens: parsedMeta.lenses[2] || '35',
            fps: parsedMeta.projectFps || '24',
          },
        }));
      }
    } catch (e) {
      console.warn('Failed to load store from storage', e);
      set({ isHydrated: true });
    }
  },

  updateMeta: async (partial) => {
    const updated = { ...get().meta, ...partial };
    set({ meta: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_META, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  },

  setForm: (partial) => {
    set((state) => ({ form: { ...state.form, ...partial } }));
  },

  incrementSlate: (delta) => {
    set((state) => ({
      form: { ...state.form, slate: Math.max(1, state.form.slate + delta) },
    }));
  },

  incrementTake: (delta) => {
    set((state) => ({
      form: { ...state.form, take: Math.max(1, state.form.take + delta) },
    }));
  },

  addSuffixToScene: (suffix) => {
    set((state) => {
      const current = state.form.scene.replace(/[^0-9]/g, '');
      return { form: { ...state.form, scene: (current || '1') + suffix } };
    });
  },

  addSuffixToShot: (suffix) => {
    set((state) => {
      const current = state.form.shot.replace(/[^0-9]/g, '');
      return { form: { ...state.form, shot: (current || '1') + suffix } };
    });
  },

  stripSuffixScene: () => {
    set((state) => ({
      form: { ...state.form, scene: state.form.scene.replace(/[^0-9]/g, '') || '1' },
    }));
  },

  toggleGoodTake: () => {
    set((state) => ({
      form: { ...state.form, isGood: !state.form.isGood },
    }));
  },

  addTake: async () => {
    const { form, takes, selectedDay } = get();
    const newEntry: TakeEntry = {
      id: 'take_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      slate: form.slate,
      scene: form.scene,
      shot: form.shot,
      take: form.take,
      isGood: form.isGood,
      clipName: form.clipName,
      camera: form.camera,
      card: form.card,
      lens: form.lens,
      shutter: form.shutter,
      iso: form.iso,
      filter: form.filter,
      tstop: form.tstop,
      fps: form.fps,
      notes: form.notes,
      timestamp: Date.now(),
      day: selectedDay,
    };

    const newTakes = [newEntry, ...takes];
    // Automatically increment take for the next recording
    const nextTake = form.take + 1;
    const nextClipNum = String(newTakes.length + 1).padStart(3, '0');
    const cardPrefix = form.card || 'A001';

    set((state) => ({
      takes: newTakes,
      form: {
        ...state.form,
        take: nextTake,
        isGood: false,
        notes: '',
        clipName: `${cardPrefix}_${nextClipNum}`,
      },
    }));

    try {
      await AsyncStorage.setItem(STORAGE_KEY_TAKES, JSON.stringify(newTakes));
    } catch (e) {
      console.error(e);
    }

    return newEntry;
  },

  deleteTake: async (id) => {
    const updated = get().takes.filter((t) => t.id !== id);
    set({ takes: updated });
    await AsyncStorage.setItem(STORAGE_KEY_TAKES, JSON.stringify(updated));
  },

  updateTake: async (id, partial) => {
    const updated = get().takes.map((t) => (t.id === id ? { ...t, ...partial } : t));
    set({ takes: updated });
    await AsyncStorage.setItem(STORAGE_KEY_TAKES, JSON.stringify(updated));
  },

  clearAllTakes: async () => {
    set({ takes: [] });
    await AsyncStorage.removeItem(STORAGE_KEY_TAKES);
  },

  setSelectedDay: (day) => {
    set({ selectedDay: day });
  },
}));
