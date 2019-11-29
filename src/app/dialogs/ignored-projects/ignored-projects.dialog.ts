import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IProject } from '../../services/api';

export interface IgnoredProjectsDialogData {
  projects: IProject[];
}

@Component({
  selector: 'app-ignored-projects-dialog',
  templateUrl: 'ignored-projects.dialog.html',
})
export class IgnoredProjectsDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<IgnoredProjectsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IgnoredProjectsDialogData) {
  }

}
