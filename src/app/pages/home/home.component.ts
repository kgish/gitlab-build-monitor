import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../../services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.scss' ]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  title = 'Welcome';
  description = 'Do something interesting, if you dare.';

  loggedIn: boolean;
  subscriptions: Subscription[] = [];

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.loggedIn = this.authService.loggedIn;
    this.subscriptions.push(this.authService.loggedInChanged.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    }));
  }

  ngAfterViewInit(): void {
    this.authService.login();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
  }
}
