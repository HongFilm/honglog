import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TakeEntry, ProductionMeta, Project } from '../types';

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
  projects: Project[];
  activeProjectId: string | null;
  meta: ProductionMeta; // derived from active project
  takes: TakeEntry[]; // derived from active project
  form: FormState;
  isHydrated: boolean;
  selectedDay: number;

  // Project Actions
  hydrate: () => Promise<void>;
  createProject: (name: string) => Promise<string>;
  selectProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Meta & Form
  updateMeta: (partial: Partial<ProductionMeta>) => Promise<void>;
  setForm: (partial: Partial<FormState>) => void;
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

const createInitialForm = (meta: ProductionMeta): FormState => ({
  slate: 1,
  scene: '1',
  shot: '1',
  take: 1,
  isGood: false,
  clipName: `${meta.cards[0] || 'A001'}_001`,
  camera: meta.cameras[0] || 'A',
  card: meta.cards[0] || 'A001',
  lens: meta.lenses[2] || '35',
  shutter: meta.shutters[0] || '180°',
  iso: meta.isos[3] || '800',
  filter: meta.filters[0] || 'Clear',
  tstop: '2.8',
  fps: meta.projectFps || '24',
  notes: '',
});

export const useHonglogStore = create<HonglogStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  meta: defaultMeta,
  takes: [],
  isHydrated: false,
  selectedDay: 1,

  form: createInitialForm(defaultMeta),

  hydrate: async () => {
    try {
      const [savedProjects, savedActiveId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_PROJECTS),
        AsyncStorage.getItem(STORAGE_KEY_ACTIVE_PROJECT),
      ]);

      let projects: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
      let activeId = savedActiveId;

      // Migration/Init: create default project if empty
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

      // Ensure activeId exists
      const activeProject = projects.find((p) => p.id === activeId) || projects[0];
      activeId = activeProject.id;

      set({
        projects,
        activeProjectId: activeId,
        meta: activeProject.meta,
        takes: activeProject.takes,
        isHydrated: true,
        form: createInitialForm(activeProject.meta),
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
      form: createInitialForm(newProject.meta),
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
      form: createInitialForm(proj.meta),
    });

    await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT, id);
  },

  deleteProject: async (id: string) => {
    const updated = get().projects.filter((p) => p.id !== id);
    if (updated.length === 0) {
      // Create default if all deleted
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
    const { form, takes, selectedDay, activeProjectId, projects } = get();
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
    
    // RULE 4: Increment SLATE on save, reset take to 1
    const nextSlate = form.slate + 1;
    const nextTake = 1;
    
    // Generate next clip name based on selected card
    const cardPrefix = form.card || 'A001';
    // Count existing takes for this card to determine next number
    const cardTakes = newTakes.filter(t => t.card === cardPrefix).length;
    const nextClipNum = String(cardTakes + 1).padStart(3, '0');

    const updatedForm = {
      ...form,
      slate: nextSlate,
      take: nextTake,
      isGood: false,
      notes: '',
      clipName: `${cardPrefix}_${nextClipNum}`,
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
}));
