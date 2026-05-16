import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { GalleryService } from '../../core/services/gallery.service';
import { ConfigService } from '../../core/services/config.service';
import { NotificationService } from '../../core/services/notification.service';
import { GalleryItem, ApiError } from '../../core/models/api.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

type FormMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-gallery-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './gallery-admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryAdminComponent implements OnInit {
  private readonly galleryService = inject(GalleryService);
  private readonly configService = inject(ConfigService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(true);
  protected readonly items = signal<GalleryItem[]>([]);
  protected readonly categories = this.configService.galleryCategories;
  protected readonly activeFilter = signal('sve');

  protected readonly formMode = signal<FormMode>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly dragActive = signal(false);
  protected readonly submitting = signal(false);

  protected readonly filteredItems = computed(() => {
    const filter = this.activeFilter();
    return filter === 'sve'
      ? this.items()
      : this.items().filter((it) => it.category === filter);
  });

  // Forma za create/edit
  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    category: ['kuhinje', Validators.required],
    displayOrder: [0, [Validators.min(0)]],
    featured: [false],
  });

  // Kategorije za select (bez "sve")
  protected get formCategories() {
    return this.categories().filter((c) => c.id !== 'sve');
  }

  async ngOnInit(): Promise<void> {
    await this.loadItems();
  }

  async loadItems(): Promise<void> {
    this.loading.set(true);
    try {
      const items = await this.galleryService.list();
      this.items.set(items);
    } catch (err) {
      this.notify.error('Greška', 'Nije moguće učitati galeriju.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  setFilter(id: string): void {
    this.activeFilter.set(id);
  }

  // ==================== Forma open/close ====================
  openCreate(): void {
    this.formMode.set('create');
    this.editingId.set(null);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.form.reset({
      title: '',
      description: '',
      category: 'kuhinje',
      displayOrder: 0,
      featured: false,
    });
  }

  openEdit(item: GalleryItem): void {
    this.formMode.set('edit');
    this.editingId.set(item.id);
    this.selectedFile.set(null);
    this.previewUrl.set(item.imageUrl);
    this.form.reset({
      title: item.title,
      description: item.description || '',
      category: item.category,
      displayOrder: item.displayOrder,
      featured: item.featured,
    });
  }

  closeForm(): void {
    this.formMode.set(null);
    this.editingId.set(null);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.form.reset();
  }

  // ==================== File handling ====================
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.notify.error('Pogrešan tip fajla', 'Dozvoljene su samo slike (JPEG, PNG, WebP, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.notify.error('Fajl je prevelik', 'Maksimalna veličina je 10MB.');
      return;
    }
    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.hasError(error);
  }

  // ==================== Submit ====================
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const mode = this.formMode();
    if (mode === 'create' && !this.selectedFile()) {
      this.notify.error('Slika je obavezna', 'Izaberi sliku prije slanja.');
      return;
    }

    this.submitting.set(true);
    try {
      const value = this.form.getRawValue();

      if (mode === 'create') {
        await this.galleryService.create(value, this.selectedFile()!);
        this.notify.success('Slika dodata', `"${value.title}" je sad u galeriji.`);
      } else if (mode === 'edit') {
        await this.galleryService.update(this.editingId()!, value);
        this.notify.success('Promjene spremljene', `"${value.title}" je ažurirano.`);
      }

      this.closeForm();
      await this.loadItems();
    } catch (err) {
      const message = this.extractError(err);
      this.notify.error('Greška', message);
      console.error(err);
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteItem(item: GalleryItem): Promise<void> {
    if (!confirm(`Sigurno briši "${item.title}"? Ova akcija se ne može poništiti.`)) {
      return;
    }

    try {
      await this.galleryService.delete(item.id);
      this.notify.success('Obrisano', `"${item.title}" je uklonjeno.`);
      await this.loadItems();
    } catch (err) {
      this.notify.error('Greška', this.extractError(err));
    }
  }

  private extractError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'Backend nije dostupan.';
      const apiError = err.error as ApiError | undefined;
      return apiError?.message || 'Nepoznata greška.';
    }
    return 'Nepoznata greška.';
  }
}
