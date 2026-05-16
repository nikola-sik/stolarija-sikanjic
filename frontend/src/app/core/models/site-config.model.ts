/**
 * Centralni model konfiguracije aplikacije.
 * Sve što je specifično za radnju ide u src/assets/config/site.config.json
 * i mora odgovarati ovom interface-u.
 */

export interface SiteConfig {
  business: BusinessInfo;
  contact: ContactInfo;
  theme: ThemeConfig;
  hero: HeroSection;
  pageHeroes: PageHeroes;
  about: AboutSection;
  process: ProcessSection;
  services: ServiceItem[];
  galleryCategories: GalleryCategory[];
  galleryPlaceholders: GalleryPlaceholder[];
  seo: SeoMeta;
  navigation: NavLink[];
}

export interface BusinessInfo {
  name: string;
  shortName: string;
  tagline: string;
  industry: string;
  foundedYear?: number;
  logo?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  city: string;
  workingHours: string;
  social: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  mapEmbedUrl?: string;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    textDark: string;
    textLight: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface HeroSection {
  title: string;
  subtitle: string;
  description: string;
  primaryCta: { label: string; link: string };
  secondaryCta: { label: string; link: string };
  backgroundImage?: string;
}

export interface PageHero {
  label: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
}

export interface PageHeroes {
  about: PageHero;
  services: PageHero;
  gallery: PageHero;
  contact: PageHero;
}

export interface AboutSection {
  title: string;
  subtitle: string;
  paragraphs: string[];
  highlights: { label: string; value: string }[];
  image?: string;
}

export interface ProcessStep {
  number: string;
  icon: string;
  title: string;
  description: string;
}

export interface ProcessSection {
  title: string;
  subtitle: string;
  steps: ProcessStep[];
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: string;
  image?: string;
  featured?: boolean;
}

export interface GalleryCategory {
  id: string;
  label: string;
}

export interface GalleryPlaceholder {
  id: string;
  category: string;
  title: string;
  gradient: string;
  aspect: string;
  image?: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface NavLink {
  label: string;
  path: string;
  exact?: boolean;
}
