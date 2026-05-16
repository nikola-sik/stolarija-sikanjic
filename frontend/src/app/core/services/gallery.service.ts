import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GalleryItem } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/gallery`;

  async list(options?: { category?: string; featured?: boolean }): Promise<GalleryItem[]> {
    let params = new HttpParams();
    if (options?.category && options.category !== 'sve') {
      params = params.set('category', options.category);
    }
    if (options?.featured !== undefined) {
      params = params.set('featured', String(options.featured));
    }
    return firstValueFrom(this.http.get<GalleryItem[]>(this.baseUrl, { params }));
  }

  async getById(id: number): Promise<GalleryItem> {
    return firstValueFrom(this.http.get<GalleryItem>(`${this.baseUrl}/${id}`));
  }

  /**
   * Admin: kreiraj novu stavku sa slikom (multipart).
   */
  async create(
    metadata: { title: string; description?: string; category: string; displayOrder?: number; featured?: boolean },
    image: File,
  ): Promise<GalleryItem> {
    const formData = new FormData();
    formData.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
    );
    formData.append('image', image);

    return firstValueFrom(
      this.http.post<GalleryItem>(`${environment.apiBaseUrl}/admin/gallery`, formData),
    );
  }

  async update(id: number, metadata: Partial<{ title: string; description: string; category: string; displayOrder: number; featured: boolean }>): Promise<GalleryItem> {
    return firstValueFrom(
      this.http.put<GalleryItem>(`${environment.apiBaseUrl}/admin/gallery/${id}`, metadata),
    );
  }

  async delete(id: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${environment.apiBaseUrl}/admin/gallery/${id}`),
    );
  }
}
