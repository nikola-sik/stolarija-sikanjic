import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../../core/services/config.service';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';
import { ProcessStepsComponent } from '../../shared/components/process-steps/process-steps.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeroComponent,
    ProcessStepsComponent,
    IconComponent,
  ],
  templateUrl: './services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent {
  private readonly configService = inject(ConfigService);

  protected readonly hero = this.configService.pageHeroes;
  protected readonly services = this.configService.services;
  protected readonly contact = this.configService.contact;
}
