import { Injectable, NgZone, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { T } from '../shared/nl';

@Injectable({ providedIn: 'root' })
export class SnackBarService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly zone = inject(NgZone);

  success(message: string): void {
    this.show(`✅ ${message}`);
  }

  error(message: string): void {
    this.show(`❌ ${message}`);
  }

  private show(message: string): void {
    this.zone.run(() => this.snackBar.open(message, T.common.close, { duration: 6000 }));
  }
}
