import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../../core/services/config.service';
import { GalleryService } from '../../core/services/gallery.service';
import { GalleryItem } from '../../core/models/api.model';
import { GalleryPlaceholder } from '../../core/models/site-config.model';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

/**
 * Galerija - prikazuje stvarne stavke iz backend-a.
 * Ako backend nije dostupan, fallback na placeholder kartice iz config-a.
 *
 * Lightbox prikazuje punu sliku (ili gradient ako je placeholder).
 */
@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeroComponent, IconComponent],
  templateUrl: './gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent implements OnInit {
  private readonly configService = inject(ConfigService);
  private readonly galleryService = inject(GalleryService);

  protected readonly hero = this.configService.pageHeroes;
  protected readonly categories = this.configService.galleryCategories;
  protected readonly contact = this.configService.contact;
  protected readonly placeholders = this.configService.galleryPlaceholders;

  protected readonly activeCategory = signal('sve');
  protected readonly lightboxItem = signal<GalleryItem | GalleryPlaceholder | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly items = signal<GalleryItem[]>([]);

  protected readonly filteredItems = computed(() => {
    const cat = this.activeCategory();
    const all = this.items();
    if (cat === 'sve') return all;
    return all.filter((item) => item.category === cat);
  });

  protected readonly filteredPlaceholders = computed(() => {
    const cat = this.activeCategory();
    const all = this.placeholders();
    if (cat === 'sve') return all;
    return all.filter((item) => item.category === cat);
  });

  /** True ako koristimo placeholder-e (backend nije dostupan ili je baza prazna). */
  protected readonly usingPlaceholders = computed(
    () => this.loadError() || this.items().length === 0,
  );

  async ngOnInit(): Promise<void> {
    try {
      const items = await this.galleryService.list();
      this.items.set(items);
      this.loadError.set(false);
    } catch (err) {
      console.warn('[Gallery] Backend nije dostupan, koristim placeholder-e:', err);
      this.loadError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  setCategory(id: string): void {
    this.activeCategory.set(id);
  }

  openLightbox(item: GalleryItem | GalleryPlaceholder): void {
    this.lightboxItem.set(item);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxItem.set(null);
    document.body.style.overflow = '';
  }

  /** Type guard - razlika između stvarne stavke i placeholder-a */
  protected isPlaceholder(item: GalleryItem | GalleryPlaceholder): item is GalleryPlaceholder {
    return 'gradient' in item;
  }
}
