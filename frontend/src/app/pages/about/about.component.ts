import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../../core/services/config.service';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';
import { ProcessStepsComponent } from '../../shared/components/process-steps/process-steps.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeroComponent,
    ProcessStepsComponent,
    IconComponent,
  ],
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly configService = inject(ConfigService);

  protected readonly hero = this.configService.pageHeroes;
  protected readonly business = this.configService.business;
  protected readonly about = this.configService.about;
  protected readonly contact = this.configService.contact;

  protected readonly values = [
    {
      icon: 'award',
      title: 'Kvalitet bez kompromisa',
      description: 'Provjereni materijali, tradicionalne tehnike, moderni alati. Svaki spoj je važan.',
    },
    {
      icon: 'heart',
      title: 'Posvećenost zanatu',
      description: 'Volimo ono što radimo. To se vidi u svakom komadu koji izađe iz radionice.',
    },
    {
      icon: 'sparkles',
      title: 'Pažnja prema detalju',
      description: 'Ono što čini razliku između običnog i pravog namještaja — sitnice koje primjećujete tek nakon godina.',
    },
    {
      icon: 'check-circle',
      title: 'Riječ je riječ',
      description: 'Dogovoreni rok je rok isporuke. Dogovorena cijena je cijena na fakturi. Bez iznenađenja.',
    },
  ];
}
