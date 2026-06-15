import { create } from 'zustand';
import type { EffectSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants/defaultSettings';

interface SettingsState extends EffectSettings {
  inputText: string;
  updateSettings: (settings: Partial<EffectSettings>) => void;
  resetSettings: () => void;
  updateSetting: <K extends keyof EffectSettings>(key: K, value: EffectSettings[K]) => void;
  setInputText: (text: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DEFAULT_SETTINGS,
  inputText: DEFAULT_SETTINGS.text,
  updateSettings: (settings) =>
    set((state) => ({
      ...state,
      ...settings,
      inputText: settings.text !== undefined ? settings.text : state.inputText,
    })),
  resetSettings: () =>
    set({ ...DEFAULT_SETTINGS, inputText: DEFAULT_SETTINGS.text }),
  updateSetting: (key, value) =>
    set((state) => {
      const next: Partial<SettingsState> = { [key]: value };
      if (key === 'text') next.inputText = value as string;
      return { ...state, ...next };
    }),
  setInputText: (text) => set({ inputText: text }),
}));
