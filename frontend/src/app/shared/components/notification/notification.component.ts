import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../icon/icon.component';

/**
 * Toast container - fiksiran u gornjem desnom uglu.
 * Renderuje sve aktivne notifikacije iz NotificationService-a.
 */
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="pointer-events-none fixed right-4 top-4 z-[200] flex w-full max-w-sm flex-col gap-3">
      @for (n of notifications(); track n.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-lg border bg-white p-4 shadow-lg animate-fade-in-up"
          [class.border-green-500]="n.type === 'success'"
          [class.border-red-500]="n.type === 'error'"
          [class.border-blue-500]="n.type === 'info'"
          [class.border-yellow-500]="n.type === 'warning'"
        >
          <div
            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
            [class.bg-green-100]="n.type === 'success'"
            [class.text-green-700]="n.type === 'success'"
            [class.bg-red-100]="n.type === 'error'"
            [class.text-red-700]="n.type === 'error'"
            [class.bg-blue-100]="n.type === 'info'"
            [class.text-blue-700]="n.type === 'info'"
            [class.bg-yellow-100]="n.type === 'warning'"
            [class.text-yellow-700]="n.type === 'warning'"
          >
            @if (n.type === 'success') { <app-icon name="check" [size]="18" /> }
            @else if (n.type === 'error') { <app-icon name="x" [size]="18" /> }
            @else { <app-icon name="star" [size]="18" /> }
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-wood-900">{{ n.title }}</p>
            @if (n.message) {
              <p class="mt-1 text-sm text-wood-700">{{ n.message }}</p>
            }
          </div>
          <button
            (click)="dismiss(n.id)"
            class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-wood-400 transition-colors hover:bg-wood-100 hover:text-wood-700"
            aria-label="Zatvori notifikaciju"
          >
            <app-icon name="x" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  private readonly service = inject(NotificationService);
  protected readonly notifications = this.service.notifications;

  dismiss(id: string): void {
    this.service.dismiss(id);
  }
}
