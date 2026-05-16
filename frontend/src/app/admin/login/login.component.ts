import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ConfigService } from '../../core/services/config.service';
import { NotificationService } from '../../core/services/notification.service';
import { ApiError } from '../../core/models/api.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly configService = inject(ConfigService);

  protected readonly business = this.configService.business;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string>('');
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.hasError(error);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    try {
      const { username, password } = this.form.getRawValue();
      const response = await this.authService.login({ username, password });

      this.notify.success(
        'Dobrodošli',
        `Ulogovani ste kao ${response.user.username}`,
      );

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/admin';
      await this.router.navigateByUrl(returnUrl);
    } catch (err) {
      const message = this.extractErrorMessage(err);
      this.errorMessage.set(message);
    } finally {
      this.submitting.set(false);
    }
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'Backend nije dostupan. Provjerite da je server pokrenut.';
      }
      const apiError = err.error as ApiError | undefined;
      return apiError?.message || 'Greška pri prijavi.';
    }
    return 'Greška pri prijavi.';
  }
}
