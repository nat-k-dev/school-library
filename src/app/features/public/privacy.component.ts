import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { T } from '../../shared/nl';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f4f7fb] text-[#14305c]">
      <div class="max-w-2xl mx-auto px-5 py-10 flex flex-col gap-4">
        <a routerLink="/" class="text-[#1f4e9c]">← {{ t.appName }}</a>
        <h1 class="m-0 text-3xl font-bold">{{ t.privacy.title }}</h1>
        @for (p of t.privacy.text; track p) {
          <p class="m-0 text-lg text-slate-700">{{ p }}</p>
        }
      </div>
    </div>
  `,
})
export class PrivacyComponent {
  protected readonly t = T;
}
