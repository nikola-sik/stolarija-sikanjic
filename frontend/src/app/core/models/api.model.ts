/**
 * TypeScript reprezentacije DTO-ova koje backend vraća.
 * Polja moraju da prate Java DTO-ove iz com.businessshowcase.*.dto.
 */

export interface AdminUser {
  id: number;
  username: string;
  role: 'ADMIN' | 'EDITOR';
  enabled: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AdminUser;
}

export interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  category: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  displayOrder: number;
  featured: boolean;
  createdAt: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
  consent: boolean;
}

export interface ContactResponse {
  id: number;
  message: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: { field: string; message: string; rejectedValue: unknown }[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
