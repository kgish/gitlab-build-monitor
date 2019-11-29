import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// --- COMPONENTS --- //
import {
  NavbarComponent,
  PageHeaderComponent,
  ProgressBarComponent
} from './components';

// --- PAGES --- //
import {
  AboutComponent,
  GroupsComponent,
  HomeComponent,
  MonitorComponent,
  NotFoundComponent,
  PipelinesComponent,
  ProjectsComponent,
  TagsComponent,
  TagsDetailComponent
} from './pages';

// --- MODULES --- //
import {
  MaterialModule
} from './modules';

// --- PIPES --- //
import {
  CapitalizePipe,
  FromNowPipe
} from './pipes';

// --- INTERCEPTORS --- //
import {
  HttpErrorInterceptor,
  TokenInterceptor
} from './http-interceptors';

// --- GUARDS --- //
import {
  AuthGuard,
} from './services';

// --- DIALOGS -- //
import {
  IgnoredProjectsDialogComponent
} from './dialogs';

@NgModule({
  declarations: [
    AboutComponent,
    AppComponent,
    CapitalizePipe,
    FromNowPipe,
    GroupsComponent,
    HomeComponent,
    IgnoredProjectsDialogComponent,
    MonitorComponent,
    NavbarComponent,
    NotFoundComponent,
    PageHeaderComponent,
    PipelinesComponent,
    ProgressBarComponent,
    ProjectsComponent,
    TagsComponent,
    TagsDetailComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    MaterialModule
  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }
  ],
  entryComponents: [
    IgnoredProjectsDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
