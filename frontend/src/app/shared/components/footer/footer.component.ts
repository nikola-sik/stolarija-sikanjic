import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../../../core/services/config.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private readonly configService = inject(ConfigService);

  protected readonly business = this.configService.business;
  protected readonly contact = this.configService.contact;
  protected readonly navigation = this.configService.navigation;
  protected readonly currentYear = new Date().getFullYear();
}
