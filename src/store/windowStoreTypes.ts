import { Track } from '@/config/musicConfig';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  w: number;
  h: number;
}

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  accentColor?: string;
  position: WindowPosition;
  size: WindowSize;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export type AppCategory = 'portfolio' | 'utility' | 'system' | 'entertainment';

export interface AppDefinition {
  id: string;
  title: string;
  icon: string;
  accentColor: string;
  description?: string;
  defaultSize?: WindowSize;
  type?: 'iframe' | 'static';
  liveUrl?: string;
  githubUrl?: string;
  category?: AppCategory | AppCategory[];
  isSystemApp?: boolean;
  isPreinstalled?: boolean;
  version?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  appName?: string;
  icon?: string;
}

export interface DesktopShortcutItem {
  id: string;
  appId: string;
  x: number;
  y: number;
}

export type DesktopWidgetType = 'clock' | 'weather' | 'calendar' | 'notes' | 'calculator';

export interface DesktopWidgetConfig {
  id: string;
  type: DesktopWidgetType;
}

export interface WindowStore {
  windows: WindowState[];
  launcherOpen: boolean;
  quickSettingsOpen: boolean;
  soundEnabled: boolean;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  nightLightEnabled: boolean;
  volume: number;
  brightness: number;
  theme: 'dark' | 'light';
  activeWindowId: string | null;
  highestZIndex: number;
  wallpaper: string;
  booted: boolean;
  notification: SystemNotification | null;
  pinnedApps: string[];
  desktopShortcuts: DesktopShortcutItem[];
  desktopWidgets: DesktopWidgetConfig[];
  widgetGalleryOpen: boolean;

  // Accessibility & System Preferences
  language: 'en' | 'id' | string;
  reducedMotion: boolean;
  textScale: 'small' | 'normal' | 'large';
  highContrast: boolean;
  clockFormat: '12h' | '24h';

  // Global Music Player Media State
  mediaTrackIndex: number;
  mediaIsPlaying: boolean;
  mediaCurrentTime: number;
  mediaDuration: number;
  mediaVolume: number;
  mediaIsMuted: boolean;
  mediaIsShuffle: boolean;
  mediaIsRepeat: boolean;
  customTracks: Track[];

  openWindow: (app: AppDefinition, options?: { keepLauncherOpen?: boolean }) => void;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, position: WindowPosition) => void;
  resizeWindow: (id: string, size: WindowSize) => void;
  toggleMaximizeWindow: (id: string) => void;
  toggleMinimizeWindow: (id: string) => void;
  toggleLauncher: (open?: boolean) => void;
  closeLauncher: () => void;
  toggleQuickSettings: (open?: boolean) => void;
  toggleSound: () => void;
  toggleWifi: () => void;
  toggleBluetooth: () => void;
  toggleNightLight: () => void;
  setVolume: (volume: number) => void;
  setBrightness: (brightness: number) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  cycleWallpaper: () => void;
  setWallpaper: (wallpaper: string) => void;
  setBooted: (booted: boolean) => void;
  showNotification: (title: string, message: string, appName?: string, icon?: string) => void;
  clearNotification: () => void;
  togglePinApp: (appId: string) => void;
  reorderPinnedApps: (newOrder: string[]) => void;
  isPinnedApp: (appId: string) => boolean;
  addDesktopShortcut: (appId: string) => void;
  removeDesktopShortcut: (id: string) => void;
  updateDesktopShortcutPos: (id: string, position: { x: number; y: number }) => void;
  toggleWidgetGallery: (open?: boolean) => void;
  addWidget: (type: DesktopWidgetType) => void;
  removeWidget: (id: string) => void;
  reorderWidgets: (newWidgets: DesktopWidgetConfig[]) => void;
  resetWidgets: () => void;
  setLanguage: (language: 'en' | 'id' | string) => void;
  toggleReducedMotion: (enabled?: boolean) => void;
  setTextScale: (scale: 'small' | 'normal' | 'large') => void;
  toggleHighContrast: (enabled?: boolean) => void;
  setClockFormat: (format: '12h' | '24h') => void;
  toggleMediaPlay: (playing?: boolean) => void;
  playNextTrack: () => void;
  playPrevTrack: () => void;
  selectTrack: (index: number) => void;
  setMediaCurrentTime: (time: number) => void;
  setMediaDuration: (duration: number) => void;
  setMediaVolume: (volume: number) => void;
  toggleMediaMute: () => void;
  toggleMediaShuffle: () => void;
  toggleMediaRepeat: () => void;
  addCustomTrack: (track: Track) => void;
  hydrateFromStorage: () => void;
}
