import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BusinessContact {
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  workingHours: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  updatedAt: string;
}

export interface UpdateBusinessContactRequest {
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  workingHours?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

/**
 * Klijent za /api/v1/settings i /api/v1/admin/settings endpoint-e.
 * Koristi se iz ConfigService-a (za public read) i iz admin postavke stranice.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly publicUrl = `${environment.apiBaseUrl}/settings`;
  private readonly adminUrl = `${environment.apiBaseUrl}/admin/settings`;

  async getContact(): Promise<BusinessContact> {
    return firstValueFrom(this.http.get<BusinessContact>(this.publicUrl));
  }

  async updateContact(request: UpdateBusinessContactRequest): Promise<BusinessContact> {
    return firstValueFrom(this.http.put<BusinessContact>(this.adminUrl, request));
  }
}
