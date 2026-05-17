import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SiteConfig, ContactInfo } from '../models/site-config.model';
import { SettingsService, BusinessContact } from './settings.service';

/**
 * Učitava i drži centralnu konfiguraciju aplikacije.
 *
 * Statički dio (boje, fontovi, usluge, hero text...) dolazi iz
 * src/assets/config/site.config.json. Mijenja se Git push-om.
 *
 * Dinamički kontakt podaci (adresa, telefon, email, instagram) dolaze
 * iz backend-a (/api/v1/settings) i admin ih mijenja kroz UI.
 * Statički kontakt u JSON fajlu služi kao fallback ako backend nije dostupan.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly settingsService = inject(SettingsService);

  private readonly _config = signal<SiteConfig | null>(null);

  readonly config = this._config.asReadonly();

  // Specifična polja - lakše za korištenje u templates-ima
  readonly business = computed(() => this._config()?.business);
  readonly contact = computed(() => this._config()?.contact);
  readonly hero = computed(() => this._config()?.hero);
  readonly pageHeroes = computed(() => this._config()?.pageHeroes);
  readonly about = computed(() => this._config()?.about);
  readonly process = computed(() => this._config()?.process);
  readonly services = computed(() => this._config()?.services ?? []);
  readonly galleryCategories = computed(() => this._config()?.galleryCategories ?? []);
  readonly galleryPlaceholders = computed(() => this._config()?.galleryPlaceholders ?? []);
  readonly navigation = computed(() => this._config()?.navigation ?? []);
  readonly featuredServices = computed(() =>
    (this._config()?.services ?? []).filter((s) => s.featured),
  );

  /**
   * Učitava sve — JSON config + dinamičke postavke iz backend-a.
   * Pozove se iz APP_INITIALIZER-a.
   */
  async loadConfig(): Promise<void> {
    try {
      const config = await firstValueFrom(
        this.http.get<SiteConfig>('/assets/config/site.config.json'),
      );
      this._config.set(config);
      this.applyTheme(config);
    } catch (err) {
      console.error('[ConfigService] Greska pri ucitavanju static config-a:', err);
      return;
    }

    // Pokušaj povući live kontakt iz backend-a (non-blocking)
    await this.refreshLiveContact();
  }

  /**
   * Učitava kontakt podatke sa backend-a i merge-uje preko statičkih.
   * Pozove se nakon update-a u admin panelu da se promjene odmah vide svuda.
   */
  async refreshLiveContact(): Promise<void> {
    try {
      const live = await this.settingsService.getContact();
      this._config.update((cfg) => (cfg ? this.mergeContact(cfg, live) : cfg));
    } catch (err) {
      console.warn('[ConfigService] Live kontakt nije dostupan, koristim static fallback.');
    }
  }

  private mergeContact(cfg: SiteConfig, live: BusinessContact): SiteConfig {
    const merged: ContactInfo = {
      phone: live.phone || cfg.contact.phone,
      email: live.email || cfg.contact.email,
      address: live.address || cfg.contact.address,
      city: live.city || cfg.contact.city,
      workingHours: live.workingHours || cfg.contact.workingHours,
      social: {
        ...cfg.contact.social,
        instagram: live.instagramUrl || cfg.contact.social.instagram,
        facebook: live.facebookUrl || cfg.contact.social.facebook,
      },
      mapEmbedUrl: cfg.contact.mapEmbedUrl,
    };
    return { ...cfg, contact: merged };
  }

  private applyTheme(config: SiteConfig): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const root = document.documentElement;
    const { colors, fonts } = config.theme;

    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-text-dark', colors.textDark);
    root.style.setProperty('--color-text-light', colors.textLight);

    root.style.setProperty('--font-heading', fonts.heading);
    root.style.setProperty('--font-body', fonts.body);
  }
}
