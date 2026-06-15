import { create } from 'zustand';
import type { Draft, EffectSettings } from '../types';

const STORAGE_KEY = 'typewriter-drafts';

interface DraftState {
  drafts: Draft[];
  loadDrafts: () => void;
  saveDraft: (name: string, settings: EffectSettings) => Draft;
  updateDraft: (id: string, settings: EffectSettings) => void;
  renameDraft: (id: string, name: string) => void;
  deleteDraft: (id: string) => void;
  getDraft: (id: string) => Draft | undefined;
}

const readFromStorage = (): Draft[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeToStorage = (drafts: Draft[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // ignore storage errors
  }
};

const generateId = () =>
  `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useDraftStore = create<DraftState>((set, get) => ({
  drafts: [],

  loadDrafts: () => {
    set({ drafts: readFromStorage() });
  },

  saveDraft: (name, settings) => {
    const now = Date.now();
    const draft: Draft = {
      id: generateId(),
      name: name.trim() || `草稿 ${new Date(now).toLocaleString('zh-CN')}`,
      settings: { ...settings },
      createdAt: now,
      updatedAt: now,
    };
    const drafts = [draft, ...get().drafts];
    set({ drafts });
    writeToStorage(drafts);
    return draft;
  },

  updateDraft: (id, settings) => {
    const drafts = get().drafts.map((d) =>
      d.id === id
        ? { ...d, settings: { ...settings }, updatedAt: Date.now() }
        : d
    );
    set({ drafts });
    writeToStorage(drafts);
  },

  renameDraft: (id, name) => {
    const drafts = get().drafts.map((d) =>
      d.id === id
        ? { ...d, name: name.trim() || d.name, updatedAt: Date.now() }
        : d
    );
    set({ drafts });
    writeToStorage(drafts);
  },

  deleteDraft: (id) => {
    const drafts = get().drafts.filter((d) => d.id !== id);
    set({ drafts });
    writeToStorage(drafts);
  },

  getDraft: (id) => get().drafts.find((d) => d.id === id),
}));
