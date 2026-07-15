export type Locale = 'es' | 'en';

export type WorkIndustry = 'web2' | 'saas' | 'web3';
export type WorkService = 'branding' | 'ux' | 'ads' | 'dev';

export interface SiteContent {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    home: string;
    services: string;
    works: string;
    studio: string;
    contact: string;
  };
  locale: {
    switchToEn: string;
    switchToEs: string;
    labelEn: string;
    labelEs: string;
  };
  theme: {
    light: string;
    dark: string;
    ariaLight: string;
    ariaDark: string;
    titleLight: string;
    titleDark: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    lead: string;
    leadSecondary?: string;
    ctaWorks: string;
    ctaContact: string;
  };
  services: {
    eyebrow: string;
    badge: string;
    title: string;
    titleHighlight: string;
    ventajaLabel: string;
    specialties: string;
    items: {
      number: string;
      title: string;
      shortTitle?: string;
      description: string;
      tags: string[];
      accent: 'orange' | 'blue';
    }[];
  };
  industries: {
    eyebrow: string;
    badge: string;
    title: string;
    titleLine2: string;
    titleHighlight: string;
    lead: string;
    sectors: string;
    typicalServices: string;
    uniqueAdvantage: string;
    layers: {
      id: string;
      badge: string;
      title: string;
      description: string;
      accent: 'orange' | 'blue' | 'mix';
      sectors: string[];
      services: string[];
      ventaja?: boolean;
      tabLabel: string;
      panelTitle: string;
      folderTab: string;
    }[];
  };
  methodology: {
    eyebrow: string;
    badge: string;
    title: string;
    titleHighlight: string;
    lead: string;
    toolsLabel: string;
    steps: {
      number: string;
      title: string;
      description: string;
      tools: string[];
    }[];
  };
  works: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    lead: string;
    filterIndustry: string;
    filterService: string;
    filterIndustryAria: string;
    filterServiceAria: string;
    industryFilters: { id: 'all' | WorkIndustry; label: string }[];
    serviceFilters: { id: 'all' | WorkService; label: string }[];
    industryLabels: Record<WorkIndustry, string>;
    serviceLabels: Record<WorkService, string>;
    comingSoon: string;
    viewProject: string;
    inDevelopment: string;
    items: {
      title: string;
      client: string;
      year: string;
      description: string;
      industries: WorkIndustry[];
      services: WorkService[];
      accent: 'orange' | 'blue';
      live: boolean;
    }[];
  };
  investment: {
    eyebrow: string;
    badge: string;
    title: string;
    lead: string;
    cta: string;
    idealForLabel: string;
    plans: {
      id: 'local' | 'branding360' | 'ecosystem';
      name: string;
      description: string;
      idealFor: string;
      price: string;
      priceNote: string;
    }[];
  };
  contact: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    titleAfter: string;
    lead: string;
    formIntro: string;
    formIntroEmail: string;
    name: string;
    email: string;
    budget: string;
    message: string;
    selectPlaceholder: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    submit: string;
    success: string;
    directEmail: string;
    social: string;
    location: string;
    mailSubject: string;
    mailBodyName: string;
    mailBodyEmail: string;
    mailBodyBudget: string;
    budgetOptions: string[];
  };
  site: {
    tagline: string;
    ventaja: string;
    ventajaEmergente: string;
    contact: {
      email: string;
      whatsapp: string;
      linkedin: string;
      instagram: string;
      location: string;
      timezone: string;
    };
  };
  footer: {
    letsTalk: string;
    localTime: string;
    social: string;
    cta: string;
    backToTop: string;
    rights: string;
    wordmarkLabel: string;
    navAria: string;
  };
}
