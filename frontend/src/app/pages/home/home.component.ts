import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../../core/services/config.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly configService = inject(ConfigService);

  protected readonly business = this.configService.business;
  protected readonly hero = this.configService.hero;
  protected readonly about = this.configService.about;
  protected readonly contact = this.configService.contact;
  protected readonly featuredServices = this.configService.featuredServices;
  protected readonly allServices = this.configService.services;
}
