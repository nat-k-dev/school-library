import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { T } from '../../shared/nl';

@Component({
  selector: 'app-homepage',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './homepage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './homepage.component.css',
})
export class HomepageComponent {
  protected readonly t = T.home;
}
