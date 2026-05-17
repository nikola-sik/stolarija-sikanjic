import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfigService } from '../../core/services/config.service';
import { SettingsService, BusinessContact } from '../../core/services/settings.service';
import { NotificationService } from '../../core/services/notification.service';
import { ApiError } from '../../core/models/api.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

// Jednostavan regex za URL (http/https + domen). Strogu validaciju radi backend.
const URL_PATTERN = /^https?:\/\/.+/i;

@Component({
  selector: 'app-settings-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './settings-admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsAdminComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly configService = inject(ConfigService);
  private readonly notify = inject(NotificationService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly lastUpdated = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    phone: ['', [Validators.maxLength(50)]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    address: ['', [Validators.maxLength(255)]],
    city: ['', [Validators.maxLength(100)]],
    workingHours: ['', [Validators.maxLength(255)]],
    instagramUrl: ['', [Validators.pattern(URL_PATTERN), Validators.maxLength(500)]],
    facebookUrl: ['', [Validators.pattern(URL_PATTERN), Validators.maxLength(500)]],
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.hasError(error);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const contact = await this.settingsService.getContact();
      this.populateForm(contact);
      this.lastUpdated.set(contact.updatedAt);
    } catch (err) {
      this.notify.error('Greška', 'Nije moguće učitati postavke.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.warning('Provjeri polja', 'Neka polja nisu validna.');
      return;
    }

    this.saving.set(true);
    try {
      const value = this.form.getRawValue();
      const updated = await this.settingsService.updateContact({
        phone: value.phone || undefined,
        email: value.email || undefined,
        address: value.address || undefined,
        city: value.city || undefined,
        workingHours: value.workingHours || undefined,
        instagramUrl: value.instagramUrl || undefined,
        facebookUrl: value.facebookUrl || undefined,
      });

      this.populateForm(updated);
      this.lastUpdated.set(updated.updatedAt);

      // Osvježi javnu stranicu - footer, kontakt forma itd. odmah vide nove vrijednosti
      await this.configService.refreshLiveContact();

      this.notify.success('Sačuvano', 'Kontakt podaci su ažurirani.');
    } catch (err) {
      this.notify.error('Greška', this.extractError(err));
      console.error(err);
    } finally {
      this.saving.set(false);
    }
  }

  private populateForm(contact: BusinessContact): void {
    this.form.reset({
      phone: contact.phone || '',
      email: contact.email || '',
      address: contact.address || '',
      city: contact.city || '',
      workingHours: contact.workingHours || '',
      instagramUrl: contact.instagramUrl || '',
      facebookUrl: contact.facebookUrl || '',
    });
  }

  private extractError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'Backend nije dostupan.';
      const apiError = err.error as ApiError | undefined;
      if (apiError?.fieldErrors?.length) {
        return apiError.fieldErrors.map((f) => `${f.field}: ${f.message}`).join('; ');
      }
      return apiError?.message || 'Nepoznata greška.';
    }
    return 'Nepoznata greška.';
  }
}
