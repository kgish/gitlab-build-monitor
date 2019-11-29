import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: [ './about.component.scss' ]
})
export class AboutComponent implements OnInit {

  title = 'About';
  description = 'For more information about this awesome application, please check out one of the links below.';

  constructor() {
  }

  ngOnInit() {
  }

}
