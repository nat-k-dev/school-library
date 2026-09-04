import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { toIsbn13 } from '../isbn';
import { T } from '../nl';

/**
 * Camera barcode scanner that emits a clean ISBN-13 once and then stops.
 *
 * Books carry an EAN-13 barcode which is the ISBN-13, so only that format is
 * decoded. Non-ISBN barcodes (price stickers, library labels) are ignored.
 */
@Component({
  selector: 'app-scanner',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './scanner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScannerComponent implements OnDestroy {
  /** Emits a valid ISBN-13 after a successful scan. */
  readonly scanned = output<string>();

  protected readonly t = T.scanner;
  protected readonly active = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly lastIsbn = signal<string | null>(null);

  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>('video');
  private readonly reader = new BrowserMultiFormatReader(
    new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]]]),
  );
  private controls?: IScannerControls;

  async start(): Promise<void> {
    this.error.set(null);
    this.active.set(true);
    try {
      this.controls = await this.reader.decodeFromVideoDevice(
        undefined,
        this.video().nativeElement,
        (result) => {
          if (!result) return;
          const isbn = toIsbn13(result.getText());
          if (!isbn) return;
          this.lastIsbn.set(isbn);
          navigator.vibrate?.(80);
          this.stop();
          this.scanned.emit(isbn);
        },
      );
    } catch (err) {
      this.active.set(false);
      this.error.set(this.describe(err));
    }
  }

  stop(): void {
    this.controls?.stop();
    this.controls = undefined;
    this.active.set(false);
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private describe(err: unknown): string {
    const name = err instanceof Error ? err.name : '';
    if (name === 'NotAllowedError') return this.t.noPermission;
    if (name === 'NotFoundError') return this.t.noCamera;
    return this.t.failed;
  }
}
