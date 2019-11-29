import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit {

  @Input() loading: boolean;
  @Input() text: string;
  @Input() count: number;
  @Input() countStart: number;
  @Input() text2: string;

  constructor() { }

  ngOnInit() {
    if (!this.text || !this.text.trim().length) {
      this.text = 'Loading';
    }
  }

}
