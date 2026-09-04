import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LibraryService } from '../../services/library.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { Loan } from '../../shared/models';
import { T, formatDate } from '../../shared/nl';
import { IsbnInputComponent } from './isbn-input.component';

@Component({
  selector: 'app-return',
  imports: [IsbnInputComponent, MatButtonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="screen">
      <h1 class="screen-title">{{ t.return.title }}</h1>
      <section class="card flex flex-col gap-3 relative">
        <h2 class="m-0 text-base font-medium text-slate-600">{{ t.return.step1 }}</h2>
        <app-isbn-input [buttonLabel]="t.return.button" [disabled]="busy()" (isbn)="onIsbn($event)" />

        @if (choices().length > 1) {
          <p class="m-0 mt-2">{{ t.return.chooseLoan }}</p>
          <div class="flex flex-col gap-2">
            @for (loan of choices(); track loan.id) {
              <button type="button" class="student-button" (click)="finish(loan)" [disabled]="busy()">
                <div class="font-medium">{{ loan.studentName }} · {{ t.fields.group }} {{ loan.group }}</div>
                <div class="text-xs text-slate-500">{{ t.loans.since }} {{ date(loan.borrowedAt) }}</div>
              </button>
            }
          </div>
        }

        @if (busy()) {
          <div class="busy-overlay"><mat-spinner /></div>
        }
      </section>
    </div>
  `,
})
export class ReturnComponent {
  private readonly library = inject(LibraryService);
  private readonly snackBar = inject(SnackBarService);
  private readonly isbnInput = viewChild.required(IsbnInputComponent);

  protected readonly t = T;
  protected readonly date = formatDate;
  protected readonly busy = signal(false);
  protected readonly choices = signal<Loan[]>([]);

  protected async onIsbn(isbn: string): Promise<void> {
    this.busy.set(true);
    this.choices.set([]);
    try {
      const loans = await this.library.activeLoansForIsbn(isbn);
      if (loans.length === 0) {
        this.snackBar.error(T.return.notOnLoan);
      } else if (loans.length === 1) {
        await this.finish(loans[0]);
      } else {
        this.choices.set(loans);
      }
    } catch {
      this.snackBar.error(T.return.failed);
    } finally {
      this.busy.set(false);
    }
  }

  protected async finish(loan: Loan): Promise<void> {
    this.busy.set(true);
    try {
      await this.library.returnLoan(loan);
      this.snackBar.success(T.return.done(loan.title, loan.studentName));
      this.choices.set([]);
      this.isbnInput().reset();
    } catch {
      this.snackBar.error(T.return.failed);
    } finally {
      this.busy.set(false);
    }
  }
}
