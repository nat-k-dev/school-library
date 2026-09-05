import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SchoolService } from '../../core/school.service';
import { T } from '../../shared/nl';
import { OnboardingComponent } from './onboarding.component';

const TRIAL_WARNING_DAYS = 14;

/** Signed-in frame: school header, tab navigation, and onboarding when the user has no school yet. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatProgressSpinnerModule, OnboardingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!school.ready()) {
      <div class="min-h-screen flex items-center justify-center"><mat-spinner /></div>
    } @else if (school.school() === null) {
      <app-onboarding />
    } @else {
      <div class="min-h-screen flex flex-col">
        <header class="bg-white shadow-md z-20 md:sticky md:top-0">
          <div class="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
            <img src="/assets/images/logo4.png" alt="" class="h-9 w-9 rounded-xl">
            <span class="font-semibold truncate">{{ school.school()?.name }}</span>
            <span class="grow"></span>
            <a mat-icon-button routerLink="/app/instellingen" [attr.aria-label]="t.nav.settings"><mat-icon>settings</mat-icon></a>
          </div>
          <!-- Phone and tablet: big tap targets, wrapped so every page is visible without sideways scrolling. -->
          <nav class="lg:hidden max-w-3xl mx-auto px-3 pb-3">
            <div class="flex flex-wrap justify-center gap-2">
              @for (item of items; track item.path) {
                <a [routerLink]="item.path" routerLinkActive="active" class="nav-tile">
                  <mat-icon class="text-[26px]! w-[26px]! h-[26px]!">{{ item.icon }}</mat-icon>
                  <span>{{ item.label }}</span>
                </a>
              }
            </div>
          </nav>
          <!-- Desktop: the classic underlined tab row. -->
          <nav class="hidden lg:block max-w-5xl mx-auto px-2">
            <div class="flex justify-center gap-1">
              @for (item of items; track item.path) {
                <a [routerLink]="item.path" routerLinkActive="active" class="tab-link">
                  <mat-icon class="text-[28px]! w-7! h-7!">{{ item.icon }}</mat-icon>{{ item.label }}
                </a>
              }
            </div>
          </nav>
          @if (banner(); as banner) {
            <a routerLink="/app/instellingen" class="block plan-banner no-underline" [class]="'plan-banner ' + banner.kind">{{ banner.text }}</a>
          }
        </header>
        <main class="grow background-stripes">
          <div class="max-w-3xl mx-auto p-4 md:p-8">
            <router-outlet />
          </div>
        </main>
      </div>
    }
  `,
})
export class ShellComponent {
  protected readonly school = inject(SchoolService);
  protected readonly t = T;
  protected readonly items = [
    { path: '/app/uitlenen', icon: 'import_contacts', label: T.nav.borrow },
    { path: '/app/innemen', icon: 'assignment_return', label: T.nav.return },
    { path: '/app/overzicht', icon: 'list_alt', label: T.nav.loans },
    { path: '/app/boeken', icon: 'menu_book', label: T.nav.books },
    { path: '/app/leerlingen', icon: 'groups', label: T.nav.students },
  ];

  /** Trial about to end, or library locked: one line under the tabs. */
  protected readonly banner = computed(() => {
    const plan = this.school.plan();
    if (!plan) return null;
    if (plan.locked) return { kind: 'locked', text: T.plan.bannerLocked };
    if (plan.status === 'trial' && plan.daysLeft !== null && plan.daysLeft <= TRIAL_WARNING_DAYS) {
      return { kind: 'trial', text: T.plan.bannerTrial(plan.daysLeft) };
    }
    return null;
  });
}
