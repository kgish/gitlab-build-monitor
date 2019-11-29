import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';
import { RedirectUrlService } from '../redirect-url/redirect-url.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private redirectUrlService: RedirectUrlService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.loggedIn) {
      return true;
    } else {
      this.redirectUrlService.save(state.url);
      this.authService.login();
    }
  }
}
