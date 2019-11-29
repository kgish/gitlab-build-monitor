import { Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarRef, SimpleSnackBar} from '@angular/material';
import {Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  private snackbarRef: MatSnackBarRef<SimpleSnackBar>;
  private onDismiss$: Subscription;

  constructor(private snackbar: MatSnackBar) { }

  show(
    message: string,
    action: string = 'X',
    duration: number = 5000,
    onDismiss: ((MatSnackBarDismiss) => void) = null,
    onAction: (() => void) = null
  ) {
    this.snackbarRef = this.snackbar.open(message + '.', action, { duration});
    if (onDismiss) {
      this.onDismiss$ = this.snackbarRef.afterDismissed().subscribe( onDismiss );
    }
    if (onAction) {
      this.snackbarRef.onAction().subscribe( onAction );
    }
  }

  remove() {
    if (this.snackbarRef) {
      if (this.onDismiss$) {
        this.onDismiss$.unsubscribe();
      }
      this.snackbarRef.dismiss();
      this.snackbarRef = null;
    }
  }
}
