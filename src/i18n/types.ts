export type Language = "en" | "id" | string;

export interface LanguageMeta {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export interface AppTranslationItem {
  title: string;
  description: string;
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  project: string;
  current: boolean;
  tools: string[];
  points: string[];
}

export interface EducationItem {
  period: string;
  degree: string;
  institution: string;
  description: string;
}

export interface TrainingItem {
  title: string;
  provider: string;
  period: string;
  type: string;
}

export interface AccomplishmentItem {
  title: string;
  description: string;
}

export interface PortfolioProjectItem {
  id: string;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  highlights: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  appId?: string;
  gradient: string;
  category: string;
}

export interface TranslationSchema {
  common: {
    ok: string;
    cancel: string;
    save: string;
    close: string;
    delete: string;
    edit: string;
    back: string;
    reset: string;
    search: string;
    loading: string;
    copied: string;
    open: string;
    install: string;
    installed: string;
    uninstall: string;
    version: string;
    developer: string;
    status: string;
    enabled: string;
    disabled: string;
    default: string;
    all: string;
    send: string;
    success: string;
    error: string;
  };
  shelf: {
    launcherTooltip: string;
    quickSettingsTooltip: string;
    clockTooltip: string;
    batteryTooltip: string;
    runningApps: string;
    closeApp: string;
  };
  launcher: {
    searchPlaceholder: string;
    allCategories: string;
    portfolio: string;
    utility: string;
    system: string;
    entertainment: string;
    pinnedApps: string;
    allApps: string;
    noResults: string;
    openApp: string;
    pinToShelf: string;
    unpinFromShelf: string;
    addDesktopShortcut: string;
    uninstallApp: string;
    viewInAppStore: string;
  };
  quickSettings: {
    title: string;
    wifi: string;
    wifiConnected: string;
    wifiDisconnected: string;
    bluetooth: string;
    bluetoothOn: string;
    bluetoothOff: string;
    nightLight: string;
    nightLightOn: string;
    nightLightOff: string;
    theme: string;
    themeDark: string;
    themeLight: string;
    sound: string;
    soundMuted: string;
    soundUnmuted: string;
    reducedMotion: string;
    reducedMotionOn: string;
    reducedMotionOff: string;
    brightness: string;
    volume: string;
    openSettings: string;
    closeAllWindows: string;
  };
  contextMenu: {
    changeWallpaper: string;
    widgetGallery: string;
    closeAllWindows: string;
    openAbout: string;
    openSettings: string;
    openTerminal: string;
    newNote: string;
  };
  widgetGallery: {
    title: string;
    subtitle: string;
    activeWidgets: string;
    addWidget: string;
    removeWidget: string;
    clockTitle: string;
    clockDesc: string;
    weatherTitle: string;
    weatherDesc: string;
    calendarTitle: string;
    calendarDesc: string;
    notesTitle: string;
    notesDesc: string;
    calcTitle: string;
    calcDesc: string;
    sysMonTitle: string;
    sysMonDesc: string;
  };
  widgets: {
    manageGallery: string;
    removeThisWidget: string;
    notAddedYet: string;
    clock: {
      openTooltip: string;
    };
    calendar: {
      openTooltip: string;
    };
    weather: {
      openTooltip: string;
    };
    notes: {
      openTooltip: string;
      placeholder: string;
    };
    calculator: {
      openTooltip: string;
      openApp: string;
    };
    systemMonitor: {
      openTooltip: string;
      statusOptimal: string;
      ramLabel: string;
      batteryLabel: string;
      charging: string;
    };
  };
  notifications: {
    now: string;
    dismiss: string;
    appInstalledTitle: string;
    appInstalledDesc: string;
    appUninstalledTitle: string;
    appUninstalledDesc: string;
    pinnedTitle: string;
    unpinnedTitle: string;
    pinnedDesc: string;
    unpinnedDesc: string;
    shortcutExistsTitle: string;
    shortcutExistsDesc: string;
    shortcutCreatedTitle: string;
    shortcutCreatedDesc: string;
    shortcutRemovedTitle: string;
    shortcutRemovedDesc: string;
    widgetAddedTitle: string;
    widgetAddedDesc: string;
    widgetRemovedTitle: string;
    widgetRemovedDesc: string;
    wallpaperUpdatedTitle: string;
    wallpaperUpdatedDesc: string;
    invalidUrlTitle: string;
    invalidUrlDesc: string;
    musicAddedTitle: string;
    musicAddedDesc: string;
    dataClearedTitle: string;
    dataClearedDesc: string;
  };
  settings: {
    appTitle: string;
    appSubtitle: string;
    tabAppearance: string;
    tabSound: string;
    tabSystem: string;
    tabApps: string;
    tabAbout: string;
    languageSectionTitle: string;
    languageSectionSubtitle: string;
    appearance: {
      title: string;
      subtitle: string;
      themeMode: string;
      themeDark: string;
      themeLight: string;
      themeAuto: string;
      themeAutoDesc: string;
      themeAutoActive: string;
      wallpaper: string;
      wallpaperAll: string;
      wallpaperFractal: string;
      wallpaperClassic: string;
      wallpaperFractalBadge: string;
      wallpaperClassicBadge: string;
      textScale: string;
      textSmall: string;
      textNormal: string;
      textLarge: string;
      highContrast: string;
      highContrastDesc: string;
    };
    sound: {
      title: string;
      subtitle: string;
      masterVolume: string;
      soundEffects: string;
      soundEffectsDesc: string;
      testSound: string;
    };
    system: {
      title: string;
      subtitle: string;
      timeFormat: string;
      time12h: string;
      time24h: string;
      reducedMotionTitle: string;
      reducedMotionDesc: string;
      activeWidgetsTitle: string;
      noActiveWidgets: string;
      openWidgetGallery: string;
      remove: string;
    };
    apps: {
      title: string;
      subtitle: string;
      systemApps: string;
      userApps: string;
      storageUsed: string;
      launch: string;
    };
    about: {
      title: string;
      subtitle: string;
      osVersion: string;
      osBuild: string;
      uiEngine: string;
      responsive: string;
      responsiveDesc: string;
      security: string;
      securityDesc: string;
      resetButton: string;
      resetConfirmTitle: string;
      resetConfirmDesc: string;
    };
  };
  aboutApp: {
    heroRole: string;
    heroSubtitle: string;
    downloadCv: string;
    contactMe: string;
    tabOverview: string;
    tabPortfolio: string;
    tabExperience: string;
    tabSkills: string;
    tabEducation: string;
    tabAccomplishments: string;
    portfolioSectionTitle: string;
    portfolioSectionSubtitle: string;
    portfolioLaunchSonOs: string;
    portfolioLiveDemo: string;
    portfolioSourceCode: string;
    portfolioCurrentSystem: string;
    portfolioExploreApps: string;
    portfolioProjects: PortfolioProjectItem[];
    bioTitle: string;
    bioParagraph1: string;
    bioParagraph2: string;
    personalDetails: string;
    fullNameLabel: string;
    fullNameValue: string;
    birthPlaceDateLabel: string;
    birthPlaceDateValue: string;
    genderLabel: string;
    genderValue: string;
    religionLabel: string;
    religionValue: string;
    healthLabel: string;
    healthValue: string;
    languagesLabel: string;
    languagesValue: string;
    objectiveLabel: string;
    objectiveValue: string;
    domicileLabel: string;
    domicileValue: string;
    educationLabel: string;
    educationValue: string;
    specializationLabel: string;
    specializationValue: string;
    experienceTotalLabel: string;
    experienceTotalValue: string;
    careerFocusTitle: string;
    careerFocus1: string;
    careerFocus2: string;
    careerFocus3: string;
    expSectionTitle: string;
    expSectionSubtitle: string;
    currentlyActive: string;
    projectLabel: string;
    skillsSectionTitle: string;
    skillsSectionSubtitle: string;
    skillCategoryFrontend: string;
    skillCategoryBackend: string;
    skillCategoryTools: string;
    skillCategorySoft: string;
    eduSectionTitle: string;
    eduSectionSubtitle: string;
    trainingSectionTitle: string;
    accomplishmentsSectionTitle: string;
    accomplishmentsSectionSubtitle: string;
    footerCv: string;
    experiences: ExperienceItem[];
    educations: EducationItem[];
    trainings: TrainingItem[];
    accomplishments: AccomplishmentItem[];
  };
  contactApp: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendWhatsApp: string;
    sendEmail: string;
    successMessage: string;
    footerNote: string;
  };
  appStoreApp: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    categoryAll: string;
    categoryPortfolio: string;
    categoryUtility: string;
    categorySystem: string;
    categoryEntertainment: string;
    installed: string;
    install: string;
    uninstall: string;
    open: string;
    noResults: string;
    appCount: string;
  };
  fileManagerApp: {
    title: string;
    newFolder: string;
    uploadFile: string;
    emptyFolder: string;
    itemsCount: string;
    deleteConfirm: string;
  };
  terminalApp: {
    welcome: string;
    helpHeader: string;
    commandNotFound: string;
    helpCmd: string;
    aboutCmd: string;
    contactCmd: string;
    appsCmd: string;
    clearCmd: string;
    themeCmd: string;
    langCmd: string;
    settingsCmd: string;
    dateCmd: string;
    weatherCmd: string;
  };
  apps: Record<string, AppTranslationItem>;
}
