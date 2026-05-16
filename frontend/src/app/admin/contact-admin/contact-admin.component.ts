import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ContactService,
  ContactSubmission,
  SubmissionStatus,
} from '../../core/services/contact.service';
import { NotificationService } from '../../core/services/notification.service';
import { ApiError, Page } from '../../core/models/api.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface StatusFilter {
  value: SubmissionStatus | 'ALL';
  label: string;
  badge: string;
}

@Component({
  selector: 'app-contact-admin',
  standalone: true,
  imports: [CommonModule, DatePipe, IconComponent],
  templateUrl: './contact-admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactAdminComponent implements OnInit {
  private readonly contactService = inject(ContactService);
  private readonly notify = inject(NotificationService);

  protected readonly loading = signal(true);
  protected readonly page = signal<Page<ContactSubmission> | null>(null);
  protected readonly activeFilter = signal<SubmissionStatus | 'ALL'>('ALL');
  protected readonly currentPage = signal(0);
  protected readonly expandedId = signal<number | null>(null);

  protected readonly filters: StatusFilter[] = [
    { value: 'ALL', label: 'Svi', badge: 'bg-wood-700 text-wood-50' },
    { value: 'NEW', label: 'Novi', badge: 'bg-forest-600 text-wood-50' },
    { value: 'READ', label: 'Pročitani', badge: 'bg-blue-600 text-wood-50' },
    { value: 'RESOLVED', label: 'Riješeni', badge: 'bg-green-600 text-wood-50' },
    { value: 'ARCHIVED', label: 'Arhivirani', badge: 'bg-wood-400 text-wood-50' },
  ];

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const filter = this.activeFilter();
      const result = await this.contactService.listSubmissions({
        status: filter === 'ALL' ? undefined : filter,
        page: this.currentPage(),
        size: 20,
        sort: 'createdAt,desc',
      });
      this.page.set(result);
    } catch (err) {
      this.notify.error('Greška', 'Nije moguće učitati upite.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  async setFilter(status: SubmissionStatus | 'ALL'): Promise<void> {
    this.activeFilter.set(status);
    this.currentPage.set(0);
    await this.load();
  }

  async changePage(newPage: number): Promise<void> {
    this.currentPage.set(newPage);
    await this.load();
  }

  toggleExpand(id: number, currentStatus: SubmissionStatus): void {
    const wasExpanded = this.expandedId() === id;
    this.expandedId.set(wasExpanded ? null : id);

    // Auto-mark kao READ kad se prvi put otvori NEW upit
    if (!wasExpanded && currentStatus === 'NEW') {
      this.updateStatus(id, 'READ', true);
    }
  }

  async updateStatus(id: number, newStatus: SubmissionStatus, silent = false): Promise<void> {
    try {
      await this.contactService.updateStatus(id, newStatus);
      if (!silent) {
        this.notify.success('Status promijenjen', `Upit je sada: ${newStatus}`);
      }
      await this.load();
    } catch (err) {
      this.notify.error('Greška', this.extractError(err));
    }
  }

  async deleteSubmission(item: ContactSubmission): Promise<void> {
    if (!confirm(`Sigurno briši upit od "${item.name}"? Ova akcija se ne može poništiti.`)) {
      return;
    }
    try {
      await this.contactService.deleteSubmission(item.id);
      this.notify.success('Obrisano', 'Upit je uklonjen.');
      await this.load();
    } catch (err) {
      this.notify.error('Greška', this.extractError(err));
    }
  }

  statusBadgeClass(status: SubmissionStatus): string {
    const filter = this.filters.find((f) => f.value === status);
    return filter?.badge || 'bg-wood-300 text-wood-700';
  }

  private extractError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const apiError = err.error as ApiError | undefined;
      return apiError?.message || 'Nepoznata greška.';
    }
    return 'Nepoznata greška.';
  }
}
