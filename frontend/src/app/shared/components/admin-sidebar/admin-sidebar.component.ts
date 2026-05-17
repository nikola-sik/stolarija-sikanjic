import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfigService } from '../../../core/services/config.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './admin-sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly configService = inject(ConfigService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly business = this.configService.business;
  protected readonly mobileOpen = signal(false);

  protected readonly menuItems = [
    { label: 'Dashboard', path: '/admin', icon: 'layout-panel-left', exact: true },
    { label: 'Galerija', path: '/admin/galerija', icon: 'package' },
    { label: 'Upiti', path: '/admin/upiti', icon: 'mail' },
    { label: 'Postavke', path: '/admin/postavke', icon: 'wrench' },
  ];

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  async logout(): Promise<void> {
    this.authService.logout();
    this.notify.info('Odjavljeni ste');
    await this.router.navigate(['/']);
  }
}
