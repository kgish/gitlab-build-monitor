import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { authConfig } from './auth.config';
import { RedirectUrlService } from '../redirect-url/redirect-url.service';

const TOKEN_KEY = 'token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loggedIn: boolean;
  loggedInChanged = new Subject<boolean>();

  constructor(private router: Router,
              private redirectUrlService: RedirectUrlService) {
    this.loggedIn = !!localStorage.getItem(TOKEN_KEY);
  }

  login(force: boolean = false) {
    if (force || !localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = authConfig.issuer +
        `?client_id=${ authConfig.clientId }` +
        `&redirect_uri=${ authConfig.redirectUri }` +
        '&response_type=token';
    }
  }

  finalize(fragment: string) {
    if (!localStorage.getItem(TOKEN_KEY)) {
      if (fragment) {
        fragment.split('&').forEach(kv => {
          const [k, v] = kv.split('=');
          if (k === 'access_token') {
            const redirectUrl = this.redirectUrlService.get();
            // console.log(`AuthService finalize() redirectUrl='${ redirectUrl }'`);
            localStorage.setItem(TOKEN_KEY, v);
            this.loggedIn = true;
            this.loggedInChanged.next(this.loggedIn);
            this.router.navigateByUrl(redirectUrl || '');
          }
        });
      }
    }
  }

  logout() {
    if (localStorage.getItem(TOKEN_KEY)) {
      this.loggedIn = false;
      localStorage.removeItem('token');
      this.loggedInChanged.next(this.loggedIn);
      this.router.navigate(['/home']);
    }
  }

  getToken(): string {
    return localStorage.getItem(TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}
