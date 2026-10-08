import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TakeEntry, CameraTakeItem, ProductionMeta, Project } from '../types';

const STORAGE_KEY_PROJECTS = '@honglog_projects_v2';
const STORAGE_KEY_ACTIVE_PROJECT = '@honglog_active_project_v2';

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

export function getDefaultCardForCam(cam: string, cards: string[]): string {
  const c = cam.toUpperCase();
  if (c.startsWith('B')) {
    const bCard = cards.find((x) => /^[D-Fd-f]/.test(x) || /^[Bb]/.test(x));
    if (bCard) return bCard;
  } else if (c.startsWith('C')) {
    const cCard = cards.find((x) => /^[G-Ig-i]/.test(x) || /^[Cc]/.test(x));
    if (cCard) return cCard;
  }
  const aCard = cards.find((x) => /^[Aa]/.test(x));
  return aCard || cards[0] || 'A001';
}

export function getNextClipName(card: string, takes: TakeEntry[]): string {
  const normCard = (card || 'A001').trim().toUpperCase();
  let maxIndex = 0;

  for (const t of takes) {
    if ((t.card || '').trim().toUpperCase().includes(normCard) && t.clipName) {
      const clips = t.clipName.split(' ');
      for (const cl of clips) {
        if (cl.toUpperCase().startsWith(normCard)) {
          const match = cl.match(/_(\d+)$/);
          if (match) {
            const n = parseInt(match[1], 10);
            if (n > maxIndex) maxIndex = n;
          }
        }
      }
    }
    if (t.cameras) {
      for (const c of t.cameras) {
        if ((c.card || '').trim().toUpperCase() === normCard && c.clipName) {
          const match = c.clipName.match(/_(\d+)$/);
          if (match) {
            const n = parseInt(match[1], 10);
            if (n > maxIndex) maxIndex = n;
          }
        }
      }
    }
  }

  if (maxIndex === 0) {
    const count = takes.filter(
      (t) =>
        (t.card || '').toUpperCase().includes(normCard) ||
        (t.cameras && t.cameras.some((c) => (c.card || '').toUpperCase().includes(normCard)))
    ).length;
    maxIndex = count;
  }

  const nextNum = maxIndex + 1;
  return `${normCard}_${String(nextNum).padStart(3, '0')}`;
}

export interface FormState {
  slate: number;
  scene: string;
  shot: string;
  take: number;
  isGood: boolean;
  clipName: string;
  camera: string;
  selectedCameras: string[];
  cameraCards: Record<string, string>;
  cameraLenses: Record<string, string>;
  cameraTstops: Record<string, string>;
  card: string;
  lens: string;
  shutter: string;
  iso: string;
  filter: string;
  tstop: string;
  fps: string;
  notes: string;
  soundRoll: string;
}

interface HonglogStore {
  projects: Project[];
  activeProjectId: string | null;
  meta: ProductionMeta;
  takes: TakeEntry[];
  form: FormState;
  isHydrated: boolean;
  selectedDay: number;
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;

  // Project Actions
  hydrate: () => Promise<void>;
  createProject: (name: string) => Promise<string>;
  selectProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Meta & Form
  updateMeta: (partial: Partial<ProductionMeta>) => Promise<void>;
  setForm: (partial: Partial<FormState>) => void;
  toggleCamera: (cam: string) => void;
  setCameraCard: (cam: string, card: string) => void;
  setCameraLens: (cam: string, lens: string) => void;
  setCameraTstop: (cam: string, tstop: string) => void;
  incrementSlate: (delta: number) => void;
  incrementTake: (delta: number) => void;
  addSuffixToScene: (suffix: string) => void;
  addSuffixToShot: (suffix: string) => void;
  stripSuffixScene: () => void;
  toggleGoodTake: () => void;

  // CRUD
  addTake: () => Promise<TakeEntry>;
  updateTake: (id: string, partial: Partial<TakeEntry>) => Promise<void>;
  deleteTake: (id: string) => Promise<void>;
  clearAllTakes: () => Promise<void>;
  setSelectedDay: (day: number) => void;
}

const createInitialForm = (meta: ProductionMeta, existingTakes: TakeEntry[] = []): FormState => {
  const initialCam = meta.cameras[0] || 'A (FX6)';
  const initialCard = meta.cards[0] || 'A001';
  const cameraCards: Record<string, string> = {};
  const cameraLenses: Record<string, string> = {};
  const cameraTstops: Record<string, string> = {};

  meta.cameras.forEach((cam, idx) => {
    cameraCards[cam] = getDefaultCardForCam(cam, meta.cards);
    // Assign reasonable default lenses across cameras (e.g. Cam A = 35/50, Cam B = 85)
    cameraLenses[cam] = meta.lenses[idx % meta.lenses.length] || '35';
    cameraTstops[cam] = '2.8';
  });

  return {
    slate: 1,
    scene: '1',
    shot: '1',
    take: 1,
    isGood: false,
    clipName: getNextClipName(initialCard, existingTakes),
    camera: initialCam,
    selectedCameras: [initialCam],
    cameraCards,
    cameraLenses,
    cameraTstops,
    card: initialCard,
    lens: cameraLenses[initialCam] || '35',
    shutter: meta.shutters[0] || '180°',
    iso: meta.isos[3] || '800',
    filter: meta.filters[0] || 'Clear',
    tstop: '2.8',
    fps: meta.projectFps || '24',
    notes: '',
    soundRoll: 'SR01',
  };
};

export const useHonglogStore = create<HonglogStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  meta: defaultMeta,
  takes: [],
  isHydrated: false,
  selectedDay: 1,
  isDarkMode: true,

  form: createInitialForm(defaultMeta),

  hydrate: async () => {
    try {
      const [savedProjects, savedActiveId, savedTheme] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_PROJECTS),
        AsyncStorage.getItem(STORAGE_KEY_ACTIVE_PROJECT),
        AsyncStorage.getItem('@honglog_theme'),
      ]);

      let projects: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
      let activeId = savedActiveId;
      const isDark = savedTheme ? savedTheme === 'dark' : true;

      if (projects.length === 0) {
        const defaultProject: Project = {
          id: 'proj_default',
          name: 'Produksi Utama',
          createdAt: Date.now(),
          meta: defaultMeta,
          takes: [],
        };
        projects = [defaultProject];
        activeId = defaultProject.id;
        await AsyncStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
        await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT, activeId);
      }

      const activeProject = projects.find((p) => p.id === activeId) || projects[0];
      activeId = activeProject.id;

      set({
        projects,
        activeProjectId: activeId,
        meta: activeProject.meta,
        takes: activeProject.takes,
        isHydrated: true,
        isDarkMode: isDark,
        form: createInitialForm(activeProject.meta, activeProject.takes),
      });
    } catch (e) {
      console.warn('Failed to load store', e);
      set({ isHydrated: true });
    }
  },

  createProject: async (name: string) => {
    const newProject: Project = {
      id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name || 'Proyek Baru',
      createdAt: Date.now(),
      meta: { ...defaultMeta, production: name },
      takes: [],
    };

    const updatedProjects = [...get().projects, newProject];
    set({
      projects: updatedProjects,
      activeProjectId: newProject.id,
      meta: newProject.meta,
      takes: [],
      form: createInitialForm(newProject.meta, []),
    });

    await AsyncStorage.multiSet([
      [STORAGE_KEY_PROJECTS, JSON.stringify(updatedProjects)],
      [STORAGE_KEY_ACTIVE_PROJECT, newProject.id],
    ]);

    return newProject.id;
  },

  selectProject: async (id: string) => {
    const proj = get().projects.find((p) => p.id === id);
    if (!proj) return;

    set({
      activeProjectId: id,
      meta: proj.meta,
      takes: proj.takes,
      form: createInitialForm(proj.meta, proj.takes),
    });

    await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT, id);
  },

  deleteProject: async (id: string) => {
    const updated = get().projects.filter((p) => p.id !== id);
    if (updated.length === 0) {
      const defaultProject: Project = {
        id: 'proj_default_' + Date.now(),
        name: 'Produksi Utama',
        createdAt: Date.now(),
        meta: defaultMeta,
        takes: [],
      };
      updated.push(defaultProject);
    }

    const newActiveId = get().activeProjectId === id ? updated[0].id : get().activeProjectId || updated[0].id;
    const activeProj = updated.find((p) => p.id === newActiveId)!;

    set({
      projects: updated,
      activeProjectId: newActiveId,
      meta: activeProj.meta,
      takes: activeProj.takes,
      form: createInitialForm(activeProj.meta, activeProj.takes),
    });

    await AsyncStorage.multiSet([
      [STORAGE_KEY_PROJECTS, JSON.stringify(updated)],
      [STORAGE_KEY_ACTIVE_PROJECT, newActiveId],
    ]);
  },

  updateMeta: async (partial) => {
    const updatedMeta = { ...get().meta, ...partial };
    const updatedProjects = get().projects.map((p) =>
      p.id === get().activeProjectId ? { ...p, meta: updatedMeta } : p
    );

    set({ meta: updatedMeta, projects: updatedProjects });
    await AsyncStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updatedProjects));
  },

  setForm: (partial) => {
    set((state) => {
      const newForm = { ...state.form, ...partial };

      // When card changes, automatically calculate next clip name for that card
      if (partial.card !== undefined && partial.card !== state.form.card) {
        newForm.clipName = getNextClipName(partial.card, state.takes);
        if (newForm.camera) {
          newForm.cameraCards = {
            ...newForm.cameraCards,
            [newForm.camera]: partial.card,
          };
        }
      }

      // When primary camera changes, switch to camera's assigned card & clip name
      if (partial.camera !== undefined && partial.camera !== state.form.camera) {
        const assignedCard =
          newForm.cameraCards[partial.camera] || getDefaultCardForCam(partial.camera, state.meta.cards);
        newForm.card = assignedCard;
        newForm.clipName = getNextClipName(assignedCard, state.takes);
      }

      return { form: newForm };
    });
  },

  toggleCamera: (cam: string) => {
    set((state) => {
      const current = state.form.selectedCameras || [state.form.camera];
      let next: string[];
      if (current.includes(cam)) {
        if (current.length > 1) {
          next = current.filter((c) => c !== cam);
        } else {
          next = current;
        }
      } else {
        next = [...current, cam];
      }

      const primaryCam = next[0] || cam;
      const assignedCard =
        state.form.cameraCards[primaryCam] || getDefaultCardForCam(primaryCam, state.meta.cards);

      return {
        form: {
          ...state.form,
          camera: primaryCam,
          selectedCameras: next,
          card: assignedCard,
          clipName: getNextClipName(assignedCard, state.takes),
        },
      };
    });
  },

  setCameraCard: (cam: string, card: string) => {
    set((state) => {
      const updatedCameraCards = { ...state.form.cameraCards, [cam]: card };
      const isPrimary = state.form.camera === cam;
      return {
        form: {
          ...state.form,
          cameraCards: updatedCameraCards,
          ...(isPrimary ? { card, clipName: getNextClipName(card, state.takes) } : {}),
        },
      };
    });
  },

  setCameraLens: (cam: string, lens: string) => {
    set((state) => {
      const updatedLenses = { ...state.form.cameraLenses, [cam]: lens };
      const isPrimary = state.form.camera === cam;
      return {
        form: {
          ...state.form,
          cameraLenses: updatedLenses,
          ...(isPrimary ? { lens } : {}),
        },
      };
    });
  },

  setCameraTstop: (cam: string, tstop: string) => {
    set((state) => {
      const updatedTstops = { ...state.form.cameraTstops, [cam]: tstop };
      const isPrimary = state.form.camera === cam;
      return {
        form: {
          ...state.form,
          cameraTstops: updatedTstops,
          ...(isPrimary ? { tstop } : {}),
        },
      };
    });
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
    const { form, takes, selectedDay, activeProjectId, projects, meta } = get();
    const selectedCams =
      form.selectedCameras && form.selectedCameras.length > 0 ? form.selectedCameras : [form.camera];

    // Build multi-camera items
    const cameraItems: CameraTakeItem[] = selectedCams.map((cam) => {
      const camCard = form.cameraCards[cam] || getDefaultCardForCam(cam, meta.cards);
      const camClip = getNextClipName(camCard, takes);
      const camLens = form.cameraLenses[cam] || form.lens;
      const camTstop = form.cameraTstops[cam] || form.tstop;
      return {
        camera: cam,
        card: camCard,
        clipName: camClip,
        lens: camLens,
        tstop: camTstop,
        shutter: form.shutter,
        iso: form.iso,
        filter: form.filter,
      };
    });

    const isMultiCam = cameraItems.length > 1;
    const primaryCard = isMultiCam ? cameraItems[0].card : form.card;

    const displayCam = isMultiCam
      ? cameraItems.map((c) => c.camera.split(' ')[0]).join(' ')
      : form.camera;
    const displayCard = isMultiCam
      ? cameraItems.map((c) => c.card).join(' ')
      : form.card;
    const displayClip = isMultiCam
      ? cameraItems.map((c) => c.clipName).join(' ')
      : form.clipName;
    const displayLens = isMultiCam
      ? cameraItems.map((c) => (c.lens ? `${c.lens}mm` : '-')).join(' ')
      : form.lens;
    const displayTstop = isMultiCam
      ? cameraItems.map((c) => (c.tstop ? `T${c.tstop}` : '-')).join(' ')
      : form.tstop;

    const newEntry: TakeEntry = {
      id: 'take_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      slate: form.slate,
      scene: form.scene,
      shot: form.shot,
      take: form.take,
      isGood: form.isGood,
      clipName: displayClip,
      camera: displayCam,
      card: displayCard,
      lens: displayLens,
      shutter: form.shutter,
      iso: form.iso,
      filter: form.filter,
      tstop: displayTstop,
      fps: form.fps,
      notes: form.notes,
      soundRoll: form.soundRoll || 'SR01',
      timestamp: Date.now(),
      day: selectedDay,
      cameras: cameraItems,
    };

    const newTakes = [newEntry, ...takes];

    // RULE 4: Increment SLATE on save, reset take to 1
    const nextSlate = form.slate + 1;
    const nextTake = 1;

    // Advance clip name for primary card
    const nextClip = getNextClipName(primaryCard, newTakes);

    const updatedForm: FormState = {
      ...form,
      slate: nextSlate,
      take: nextTake,
      isGood: false,
      notes: '',
      clipName: nextClip,
    };

    const updatedProjects = projects.map((p) =>
      p.id === activeProjectId ? { ...p, takes: newTakes } : p
    );

    set({
      takes: newTakes,
      projects: updatedProjects,
      form: updatedForm,
    });

    await AsyncStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updatedProjects));
    return newEntry;
  },

  updateTake: async (id, partial) => {
    const { takes, activeProjectId, projects } = get();
    const updatedTakes = takes.map((t) => (t.id === id ? { ...t, ...partial } : t));
    const updatedProjects = projects.map((p) =>
      p.id === activeProjectId ? { ...p, takes: updatedTakes } : p
    );

    set({ takes: updatedTakes, projects: updatedProjects });
    await AsyncStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updatedProjects));
  },

  deleteTake: async (id) => {
    const { takes, activeProjectId, projects } = get();
    const updatedTakes = takes.filter((t) => t.id !== id);
    const updatedProjects = projects.map((p) =>
      p.id === activeProjectId ? { ...p, takes: updatedTakes } : p
    );

    set({ takes: updatedTakes, projects: updatedProjects });
    await AsyncStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updatedProjects));
  },

  clearAllTakes: async () => {
    const { activeProjectId, projects } = get();
    const updatedProjects = projects.map((p) =>
      p.id === activeProjectId ? { ...p, takes: [] } : p
    );

    set({ takes: [], projects: updatedProjects });
    await AsyncStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updatedProjects));
  },

  setSelectedDay: (day) => {
    set({ selectedDay: day });
  },

  toggleTheme: async () => {
    const { isDarkMode } = get();
    const newMode = !isDarkMode;
    set({ isDarkMode: newMode });
    await AsyncStorage.setItem('@honglog_theme', newMode ? 'dark' : 'light');
  },
}));
