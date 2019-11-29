import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';

import { environment } from '../../../environments/environment';

import { IgnoredProjectsDialogComponent, IgnoredProjectsDialogData } from '../../dialogs';

import {
  ApiService,
  IGroup,
  IProject,
} from '../../services';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, OnDestroy {

  title = 'Projects';
  description = 'Select one or more projects by clicking on the table rows and then hitting a button.';

  loading = false;
  count = 0;
  countStart = 1;

  subscriptions: Subscription[] = [];

  projects: IProject[] = [];
  groups: IGroup[] = [];

  notfound: boolean;
  ignoredProjects: IProject[] = [];

  displayedColumns: string[] = [
    'select',
    'id',
    'name',
    'description',
    'avatar_url',
    'last_activity_at',
    'http_url_to_repo'
  ];

  pageSizeOptions = [10, 25, 50, 100];
  dataSource: MatTableDataSource<IProject>;
  selection = new SelectionModel<IProject>(true, []);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private apiService: ApiService,
              private dialog: MatDialog,
              private breakpointObserver: BreakpointObserver,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.notfound = environment.env.notfound;
    this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => this._handleParamsChanged(params)));
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(result => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          this.displayedColumns = ['select', 'name'];
        } else if (result.breakpoints[Breakpoints.Small]) {
          this.displayedColumns = ['select', 'name', 'description', 'avatar_url'];
        } else {
          this.displayedColumns = ['select', 'id', 'name', 'description', 'avatar_url', 'last_activity_at', 'http_url_to_repo'];
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

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clickMonitor() {
    this.router.navigate(['/monitor'], this._buildExtrasMonitor());
  }

  clickTags() {
    this.router.navigate(['/tags'], this._buildExtrasMonitor());
  }

  clickIgnored() {
    const data: IgnoredProjectsDialogData = { projects: this.ignoredProjects };
    this.dialog.open(IgnoredProjectsDialogComponent, { data });
  }

  // Selected groups

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    let result = false;
    if (this.dataSource && this.dataSource.data) {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      result = (numSelected === numRows);
    }
    return result;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
    this.router.navigate(['/projects'], this._buildExtrasProjects());
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: IProject): string {
    let result;
    if (row) {
      result = `${ this.selection.isSelected(row) ? 'deselect' : 'select' } project ${ row.name }`;
    } else {
      result = `${ this.isAllSelected() ? 'select' : 'deselect' } all`;
    }
    return result;
  }

  gotoLink(url: string) {
    window.open(url, '_blank');
  }

  clickRow(row: IProject) {
    this.selection.toggle(row);
    this.router.navigate(['/projects'], this._buildExtrasProjects());
  }

  // private

  private _handleParamsChanged(params) {
    // console.log(`Projects handleParamsChanged() params='${ JSON.stringify(params) }'`);
    if (!this.apiService.initialized || !this.projects.length) {
      // console.log('Projects handleParamsChanged() call groupService init');
      this.loading = true;
      this.apiService.init().subscribe(
        () => {
          const timer = setInterval(() => {
            if (this.apiService.initialized) {
              clearInterval(timer);
              this.loading = false;
              this._initAll(params);
            }
          }, 100);
        },
        error => console.error(error),
        () => {
        });
    } else {
      this._initAll(params);
    }
  }

  private _initAll(params) {
    // console.log(`Projects initAll() params='${ JSON.stringify(params) }'`);
    if (!this.groups.length) {
      this._initGroupsAndProjects(params);
    }
    this._initSelection(params);
  }

  _initSelection(params) {
    // console.log(`Projects _initSelection() params='${ JSON.stringify(params) }'`);
    const projects = params.projects;
    const projectIds: number[] = projects ? projects.split(',').map(projectId => +projectId) : null;
    if (projectIds && projectIds.length) {
      this.projects.forEach(project => {
        if (projectIds.includes(project.id)) {
          if (!this.selection.isSelected(project)) {
            this.selection.toggle(project);
          }
        } else if (this.selection.isSelected(project)) {
          this.selection.toggle(project);
        }
      });
    } else {
      this.projects.forEach(project => {
        if (this.selection.isSelected(project)) {
          this.selection.toggle(project);
        }
      });
    }
  }

  private _initGroupsAndProjects(params): void {
    const groups = params.groups;
    const groupIds: number[] = groups ? groups.split(',').map(groupId => +groupId) : null;
    if (groupIds && groupIds.length) {
      // console.log(`Projects _initGroupsAndProjects() groupIds='${ groupIds.join(',') }'`);
      groupIds.forEach(groupId => {
        const group = this.apiService.getGroupById(groupId);
        if (group) {
          this.groups.push(group);
        }
      });
    } else {
      // console.log('Projects _initGroupsAndProjects() no groupIds');
    }

    let projects: IProject[] = [];
    this.groups.forEach(group => {
      group.projects.forEach(project => projects.push(project));
    });
    projects = projects.sort((a, b) => {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0;
    });

    if (!this.notfound) {
      // Ignore projects without any pipelines
      this.count = projects.length;
      this.countStart = this.count;
      const filteredProjects: IProject[] = [];
      projects.forEach((project, index) => {
        this.apiService.getPipelinesByProjectId(project.id).subscribe(pipelines => {
            if (pipelines && pipelines.length) {
              filteredProjects.push(project);
            } else {
              this.ignoredProjects.push(project);
              // console.log(`Projects _initGroupsAndProjects() filter project='${ project.name }'`);
            }
          },
          error => console.error(error),
          () => {
            if (--this.count === 0) {
              this._setProjects(filteredProjects);
            }
          });
      });
    } else {
      this._setProjects(projects);
    }
  }

  private _setProjects(projects: IProject[]) {
    // console.log(`Projects _setProjects() projectIds='${ projects.map(project => project.id).join(',') }'`);
    this.projects = projects;
    this._setDataSource(projects);
  }

  private _setDataSource(projects: IProject[]) {
    // console.log(`Projects _setDataSource() projectIds='${ projects.map(project => project.id).join(',') }'`);
    this.dataSource = new MatTableDataSource(projects);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private _buildExtrasProjects(): NavigationExtras {
    const groupIds: number[] = this.groups.map(group => group.id);
    const projectIds: number[] = this.selection.selected.map(selected => selected.id);
    // const result = projectIds.length
    //   ? { queryParams: { groups: groupIds.join(','), projects: projectIds.join(',') } }
    //   : { queryParams: { groups: groupIds.join(',') } };
    // console.log(`Projects _buildExtrasProjects() => ${ JSON.stringify(result) }`);
    // return result;
    return projectIds.length
      ? { queryParams: { groups: groupIds.join(','), projects: projectIds.join(',') } }
      : { queryParams: { groups: groupIds.join(',') } };
  }

  private _buildExtrasMonitor(): NavigationExtras {
    const projectIds: number[] = this.selection.selected.map(selected => selected.id);
    // const result = projectIds.length ? { queryParams: { projects: projectIds.join(',') } } : {};
    // console.log(`Projects _buildExtrasMonitor() => ${ JSON.stringify(result) }`);
    // return result;
    return projectIds.length ? { queryParams: { projects: projectIds.join(',') } } : {};
  }
}
