import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GalleryService } from '../../core/services/gallery.service';
import { ContactService } from '../../core/services/contact.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly galleryService = inject(GalleryService);
  private readonly contactService = inject(ContactService);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly loading = signal(true);

  protected readonly stats = signal({
    galleryCount: 0,
    submissionsTotal: 0,
    submissionsNew: 0,
  });

  async ngOnInit(): Promise<void> {
    try {
      const [gallery, allSubs, newSubs] = await Promise.all([
        this.galleryService.list(),
        this.contactService.listSubmissions({ page: 0, size: 1 }),
        this.contactService.listSubmissions({ page: 0, size: 1, status: 'NEW' }),
      ]);

      this.stats.set({
        galleryCount: gallery.length,
        submissionsTotal: allSubs.totalElements,
        submissionsNew: newSubs.totalElements,
      });
    } catch (err) {
      console.error('[Dashboard] Greska pri ucitavanju statistike:', err);
    } finally {
      this.loading.set(false);
    }
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dobro jutro';
    if (hour < 18) return 'Dobar dan';
    return 'Dobro veče';
  }
}
