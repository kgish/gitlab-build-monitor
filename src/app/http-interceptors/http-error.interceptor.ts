import { finalize, tap } from 'rxjs/operators';
import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService, SnackbarService } from '../services';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private snackbarService: SnackbarService,
              private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    let httpErrorResponse: HttpErrorResponse;

    // extend server response observable with logging
    return next.handle(req)
      .pipe(
        tap(
          // Succeeds when there is a response; ignore other events
          event => httpErrorResponse = null,
          // Operation failed; error is an HttpErrorResponse
          error => httpErrorResponse = error
        ),
        // Log when response observable either completes or errors
        finalize(() => {
          if (httpErrorResponse) {
            console.error(`HttpErrorInterceptor intercept() httpErrorResponse=${JSON.stringify(httpErrorResponse)}`);
            const error = httpErrorResponse.error;
            const message = httpErrorResponse.status === 0
              ? 'server is unavailable'
              : `${httpErrorResponse.status} ${httpErrorResponse.statusText}`;
            this.snackbarService.show(`An HTTP error has occurred: ${message}`);
            // If unauthorized error return, force a new login.
            if (httpErrorResponse.status === 401) {
              this.authService.login(true);
            }
          }
        })
      );
  }
}
