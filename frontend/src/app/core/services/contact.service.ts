import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContactRequest, ContactResponse, Page } from '../models/api.model';

export type SubmissionStatus = 'NEW' | 'READ' | 'RESOLVED' | 'ARCHIVED';

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  topic: string | null;
  message: string;
  status: SubmissionStatus;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly publicUrl = `${environment.apiBaseUrl}/contact`;
  private readonly adminUrl = `${environment.apiBaseUrl}/admin/contact-submissions`;

  // ============= PUBLIC =============
  async submit(request: ContactRequest): Promise<ContactResponse> {
    return firstValueFrom(this.http.post<ContactResponse>(this.publicUrl, request));
  }

  // ============= ADMIN =============
  async listSubmissions(options?: {
    status?: SubmissionStatus;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<Page<ContactSubmission>> {
    let params = new HttpParams();
    if (options?.status) params = params.set('status', options.status);
    if (options?.page !== undefined) params = params.set('page', String(options.page));
    if (options?.size !== undefined) params = params.set('size', String(options.size));
    if (options?.sort) params = params.set('sort', options.sort);

    return firstValueFrom(this.http.get<Page<ContactSubmission>>(this.adminUrl, { params }));
  }

  async updateStatus(id: number, status: SubmissionStatus): Promise<ContactSubmission> {
    return firstValueFrom(
      this.http.patch<ContactSubmission>(`${this.adminUrl}/${id}/status`, { status }),
    );
  }

  async deleteSubmission(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.adminUrl}/${id}`));
  }
}
