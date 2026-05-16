import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  durationMs: number;
}

/**
 * Centralni servis za toast notifikacije.
 * Sve admin akcije pozivaju ovaj servis za feedback.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  success(title: string, message?: string, durationMs = 4000): void {
    this.push({ type: 'success', title, message, durationMs });
  }

  error(title: string, message?: string, durationMs = 6000): void {
    this.push({ type: 'error', title, message, durationMs });
  }

  info(title: string, message?: string, durationMs = 4000): void {
    this.push({ type: 'info', title, message, durationMs });
  }

  warning(title: string, message?: string, durationMs = 5000): void {
    this.push({ type: 'warning', title, message, durationMs });
  }

  dismiss(id: string): void {
    this._notifications.update((all) => all.filter((n) => n.id !== id));
  }

  private push(partial: Omit<Notification, 'id'>): void {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const notification: Notification = { id, ...partial };
    this._notifications.update((all) => [...all, notification]);

    if (partial.durationMs > 0) {
      setTimeout(() => this.dismiss(id), partial.durationMs);
    }
  }
}
