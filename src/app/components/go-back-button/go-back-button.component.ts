import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { T } from '../../shared/nl';

@Component({
  selector: 'app-go-back-button',
  imports: [MatIconModule, MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a mat-fab extended routerLink="/" class="flex items-center justify-center">
      <mat-icon>arrow_back_ios</mat-icon>
      <span class="text-xl">{{ label }}</span>
    </a>
  `,
})
export class GoBackButtonComponent {
  protected readonly label = T.nav.back;
}
