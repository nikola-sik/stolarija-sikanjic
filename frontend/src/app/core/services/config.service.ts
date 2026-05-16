import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SiteConfig } from '../models/site-config.model';

/**
 * Učitava i drži centralnu konfiguraciju aplikacije iz site.config.json.
 * Učitavanje se desi prije pokretanja Angular aplikacije
 * (vidi APP_INITIALIZER u app.config.ts).
 *
 * Za novog klijenta — promijeni samo src/assets/config/site.config.json.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _config = signal<SiteConfig | null>(null);

  /** Direktan pristup config-u (signal). Vraća null prije nego se učita. */
  readonly config = this._config.asReadonly();

  /** Specifična polja - lakše za korištenje u templates-ima */
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
   * Učitava konfiguraciju iz JSON fajla i postavlja CSS varijable za temu.
   * Pozove se automatski iz APP_INITIALIZER-a.
   */
  async loadConfig(): Promise<void> {
    try {
      const config = await firstValueFrom(
        this.http.get<SiteConfig>('/assets/config/site.config.json'),
      );
      this._config.set(config);
      this.applyTheme(config);
    } catch (err) {
      console.error('[ConfigService] Greska pri ucitavanju config-a:', err);
    }
  }

  /**
   * Primjenjuje boje i fontove iz config-a na CSS varijable.
   * Omogućava da se tema mijenja samo kroz JSON.
   */
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
