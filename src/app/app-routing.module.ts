import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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

import { AuthGuard } from './services';

const routes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'groups', component: GroupsComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent },
  { path: 'monitor', component: MonitorComponent, canActivate: [AuthGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
  { path: 'pipelines/:id', component: PipelinesComponent, canActivate: [AuthGuard] },
  { path: 'tags', component: TagsComponent, canActivate: [AuthGuard] },
  { path: 'tags/:id', component: TagsDetailComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
