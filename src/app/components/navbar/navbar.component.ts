import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  AuthService,
} from '../../services';

interface IUrl {
  name: string;
  caption: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: [ './navbar.component.scss' ]
})
export class NavbarComponent implements OnInit, OnDestroy {

  @Input() title: string;

  loggedIn = false;
  subscriptions: Subscription[] = [];

  private urls: IUrl[] = [
    { name: '/home', caption: 'Home' },
    { name: '/about', caption: 'About' },
    { name: '/projects', caption: 'Projects' },
    { name: '/monitor', caption: 'Monitor' },
    { name: '/pipelines', caption: 'Pipelines' },
    { name: '/groups', caption: 'Groups' },
    { name: '/tags', caption: 'Tags' },
  ];

  caption: string;

  constructor(private authService: AuthService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.loggedIn = this.authService.loggedIn;
    this.subscriptions.push(this.authService.loggedInChanged.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    }));
    this.route.fragment.subscribe(fragment => {
      this.authService.finalize(fragment);
    });

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        const found: IUrl = this.urls.find(url => val.urlAfterRedirects.startsWith(url.name));
        this.caption = found ? found.caption : '';
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
  }

  clickRefresh() {
    this.authService.removeToken();
    this.router.navigate(['/home']);
  }

  clickAbout() {
    this.router.navigate(['/about']);
  }
}
