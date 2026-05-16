import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../core/services/config.service';
import { IconComponent } from '../icon/icon.component';

/**
 * Timeline koraka kako radimo — od konsultacije do montaže.
 * Čita podatke iz `process` polja u site.config.json.
 */
@Component({
  selector: 'app-process-steps',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './process-steps.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessStepsComponent {
  protected readonly process = inject(ConfigService).process;
}
