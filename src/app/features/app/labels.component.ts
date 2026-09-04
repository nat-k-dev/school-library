import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, computed, inject, signal, viewChildren } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import JsBarcode from 'jsbarcode';
import { SchoolService } from '../../core/school.service';
import { LibraryService } from '../../services/library.service';
import { isInternalCode } from '../../shared/isbn';
import { T } from '../../shared/nl';

/**
 * Printable barcode labels for books that got a school-internal code.
 * Laid out for 3 × 8 label sheets (Avery L7160, 63.5 × 38.1 mm).
 */
@Component({
  selector: 'app-labels',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './labels.component.html',
  styles: `
    .sheet { display: grid; grid-template-columns: repeat(3, 63.5mm); grid-auto-rows: 38.1mm; gap: 0 2.5mm; justify-content: start; width: max-content; }
    .label { padding: 2mm 3mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; border: 1px dashed #ddd; }
    .label .title { font-size: 9pt; line-height: 1.15; max-height: 2.3em; overflow: hidden; }
    .label .school { font-size: 7pt; color: #555; }
    .label svg { width: 100%; height: 14mm; }
    @media print {
      @page { size: A4; margin: 15.1mm 7.2mm; }
      .sheet { justify-content: center; width: auto; }
      .label { border: none; }
    }
  `,
})
export class LabelsComponent {
  private readonly library = inject(LibraryService);
  private readonly school = inject(SchoolService);
  private readonly barcodes = viewChildren<ElementRef<SVGSVGElement>>('barcode');

  protected readonly t = T;
  protected readonly schoolName = computed(() => this.school.school()?.name ?? '');
  protected readonly loaded = computed(() => this.library.titles() !== undefined);
  protected readonly titles = computed(() =>
    (this.library.titles() ?? []).filter((t) => isInternalCode(t.isbn)).sort((a, b) => a.isbn.localeCompare(b.isbn)),
  );
  protected readonly selected = signal<Set<string>>(new Set());
  protected readonly chosen = computed(() => this.titles().filter((t) => this.selected().has(t.isbn)));

  constructor() {
    afterRenderEffect(() => {
      for (const ref of this.barcodes()) {
        const svg = ref.nativeElement;
        JsBarcode(svg, svg.dataset['code'] ?? '', { format: 'EAN13', displayValue: true, fontSize: 12, height: 40, width: 1.6, margin: 0 });
      }
    });
  }

  protected toggle(isbn: string): void {
    const next = new Set(this.selected());
    if (next.has(isbn)) next.delete(isbn);
    else next.add(isbn);
    this.selected.set(next);
  }

  protected selectAll(): void {
    this.selected.set(new Set(this.titles().map((t) => t.isbn)));
  }

  protected selectNone(): void {
    this.selected.set(new Set());
  }

  protected print(): void {
    window.print();
  }
}
