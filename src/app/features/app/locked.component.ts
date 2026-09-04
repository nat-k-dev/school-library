import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { T } from '../../shared/nl';

/** Replaces a write action while the school's subscription is not in order. */
@Component({
  selector: 'app-locked',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card flex flex-col gap-2 border-red-200!">
      <h2 class="m-0 text-lg font-semibold flex items-center gap-2"><mat-icon class="text-red-700">lock</mat-icon>{{ t.plan.lockedTitle }}</h2>
      <p class="m-0 text-slate-700">{{ t.plan.lockedText }}</p>
      <a mat-flat-button routerLink="/app/instellingen" class="self-start">{{ t.nav.settings }}</a>
    </section>
  `,
})
export class LockedComponent {
  protected readonly t = T;
}
