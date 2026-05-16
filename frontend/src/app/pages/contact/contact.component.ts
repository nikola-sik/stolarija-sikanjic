import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfigService } from '../../core/services/config.service';
import { ContactService } from '../../core/services/contact.service';
import { ApiError } from '../../core/models/api.model';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeroComponent, IconComponent],
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly configService = inject(ConfigService);
  private readonly contactService = inject(ContactService);
  private readonly fb = inject(FormBuilder);

  protected readonly hero = this.configService.pageHeroes;
  protected readonly contact = this.configService.contact;
  protected readonly business = this.configService.business;

  protected readonly state = signal<SubmissionState>('idle');
  protected readonly errorMessage = signal<string>('');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    topic: [''],
    message: ['', [Validators.required, Validators.minLength(10)]],
    consent: [false, [Validators.requiredTrue]],
  });

  protected readonly topics = [
    { value: '', label: 'Odaberi temu (opcionalno)' },
    { value: 'kuhinje', label: 'Kuhinje po mjeri' },
    { value: 'plakari', label: 'Plakari i garderoberi' },
    { value: 'vrata', label: 'Vrata' },
    { value: 'spavace-sobe', label: 'Spavaće sobe' },
    { value: 'stepenice', label: 'Stepenice' },
    { value: 'restauracija', label: 'Restauracija namještaja' },
    { value: 'drugo', label: 'Nešto drugo' },
  ];

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.hasError(error);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.state.set('submitting');
    this.errorMessage.set('');

    try {
      const value = this.form.getRawValue();
      await this.contactService.submit({
        name: value.name,
        email: value.email,
        phone: value.phone || undefined,
        topic: value.topic || undefined,
        message: value.message,
        consent: value.consent,
      });

      this.state.set('success');
      this.form.reset();
    } catch (err) {
      console.error('[ContactForm] Greska:', err);
      this.errorMessage.set(this.extractErrorMessage(err));
      this.state.set('error');
    }
  }

  resetForm(): void {
    this.state.set('idle');
    this.errorMessage.set('');
    this.form.reset();
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'Backend nije dostupan. Provjerite konekciju ili nas pozovite telefonom.';
      }
      const apiError = err.error as ApiError | undefined;
      return apiError?.message || 'Došlo je do greške prilikom slanja.';
    }
    return 'Došlo je do greške prilikom slanja.';
  }
}
