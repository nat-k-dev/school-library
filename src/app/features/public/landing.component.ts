import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { T } from '../../shared/nl';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  private readonly auth = inject(AuthService);
  protected readonly t = T;
  protected readonly signedIn = computed(() => !!this.auth.user());
}
