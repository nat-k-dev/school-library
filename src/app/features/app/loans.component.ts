import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { SchoolService } from '../../core/school.service';
import { LibraryService } from '../../services/library.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { Loan, today } from '../../shared/models';
import { T, formatDate } from '../../shared/nl';

@Component({
  selector: 'app-loans',
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="screen">
      <div class="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 class="screen-title">{{ t.loans.title }}</h1>
          @if (loans(); as all) {
            <p class="m-0 text-sm text-slate-600">
              {{ t.loans.count(all.length) }}@if (overdueCount() > 0) {, <span class="text-red-700 font-medium">{{ t.loans.overdueCount(overdueCount()) }}</span>}
            </p>
          }
        </div>
        <div class="flex items-center gap-2 no-print">
        <button mat-icon-button type="button" (click)="print()" [attr.aria-label]="t.nav.print" [disabled]="visible().length === 0"><mat-icon>print</mat-icon></button>
        <mat-form-field class="w-44" subscriptSizing="dynamic">
          <mat-label>{{ t.fields.group }}</mat-label>
          <mat-select [ngModel]="group()" (ngModelChange)="group.set($event)">
            <mat-option value="">{{ t.loans.allGroups }}</mat-option>
            @for (g of groups(); track g) {
              <mat-option [value]="g">{{ g }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        </div>
      </div>

      @if (!loans()) {
        <div class="flex justify-center py-10"><mat-spinner /></div>
      } @else if (visible().length === 0) {
        <p class="card m-0 text-slate-600">{{ t.loans.empty }}</p>
      } @else {
        <div class="flex flex-col gap-2">
          @for (loan of visible(); track loan.id) {
            <div class="card py-3! flex items-center gap-3" [class.border-red-300]="isOverdue(loan)">
              <div class="grow min-w-0">
                <div class="font-medium truncate">{{ loan.title }}</div>
                <div class="text-sm text-slate-600">{{ loan.studentName }} · {{ t.fields.group }} {{ loan.group }}</div>
                <div class="text-xs" [class.text-red-700]="isOverdue(loan)" [class.text-slate-500]="!isOverdue(loan)">
                  {{ isOverdue(loan) ? t.loans.overdue + ' · ' : '' }}{{ t.loans.dueOn }} {{ date(loan.dueAt) }}
                </div>
              </div>
              <button mat-stroked-button type="button" class="no-print" (click)="returnLoan(loan)" [disabled]="busy() === loan.id">
                {{ t.loans.returnButton }}
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class LoansComponent {
  private readonly library = inject(LibraryService);
  private readonly school = inject(SchoolService);
  private readonly snackBar = inject(SnackBarService);

  protected readonly t = T;
  protected readonly date = formatDate;
  protected readonly loans = this.library.activeLoans;
  protected readonly groups = computed(() => this.school.school()?.groups ?? []);
  protected readonly group = signal('');
  protected readonly busy = signal<string | null>(null);
  private readonly today = today();

  protected readonly visible = computed(() => {
    const group = this.group();
    return (this.loans() ?? [])
      .filter((l) => !group || l.group === group)
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt) || a.studentName.localeCompare(b.studentName, 'nl'));
  });
  protected readonly overdueCount = computed(() => (this.loans() ?? []).filter((l) => this.isOverdue(l)).length);

  protected print(): void {
    window.print();
  }

  protected isOverdue(loan: Loan): boolean {
    return loan.dueAt < this.today;
  }

  protected async returnLoan(loan: Loan): Promise<void> {
    this.busy.set(loan.id);
    try {
      await this.library.returnLoan(loan);
      this.snackBar.success(T.return.done(loan.title, loan.studentName));
    } catch {
      this.snackBar.error(T.return.failed);
    } finally {
      this.busy.set(null);
    }
  }
}
