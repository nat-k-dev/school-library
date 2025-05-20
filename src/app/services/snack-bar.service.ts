import { inject, Injectable, NgZone } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  private _snackBar = inject(MatSnackBar);

  constructor(private zone: NgZone) { }

  showMessage(message: string, action: string) {
    this.zone.run(() => {
      this._snackBar.open(message, action, {
        duration: 6000,
      });
    });
  }
}
