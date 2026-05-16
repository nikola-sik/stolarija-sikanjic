import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable hero header za podstranice (O nama, Usluge, Galerija, Kontakt).
 * Manji i kompaktniji od glavnog Home hero-a.
 */
@Component({
  selector: 'app-page-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeroComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() backgroundImage?: string;
}
