import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatPaginator, MatRadioChange, MatSort, MatTableDataSource } from '@angular/material';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

import { ApiService, IProject } from '../../services/api';

interface IRow {
  id: number;
  name: string;
  description: string;
  latest: string;
  when: string;
  commits: number | string;
  tags: number | string;
}

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: [ './tags.component.scss' ]
})
export class TagsComponent implements OnInit, OnDestroy {

  title = 'Tags';
  description = 'Here is a list of all tagged projects, click a row to view details.';

  loading = false;

  subscriptions: Subscription[] = [];

  projects: IRow[] = [];

  displayedColumns: string[] = [
    'id',
    'name',
    // 'description',
    'latest',
    'when',
    'commits',
    'tags'
  ];

  pageSizeOptions = [ 10, 25, 50, 100 ];
  dataSource: MatTableDataSource<IRow>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private apiService: ApiService,
              private location: Location,
              private router: Router,
              private breakpointObserver: BreakpointObserver,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => this._handleParamsChanged(params)));
    this.breakpointObserver.observe([ Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge ])
      .subscribe(result => {
        if (result.breakpoints[ Breakpoints.XSmall ]) {
          this.displayedColumns = [ 'name', 'latest' ];
        } else if (result.breakpoints[ Breakpoints.Small ]) {
          this.displayedColumns = [ 'name', /* 'description', */ 'latest', 'when', 'commits' ];
        } else {
          this.displayedColumns = [ 'id', 'name', /* 'description', */ 'latest', 'when', 'commits', 'tags' ];
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

  clickRow(row: IProject) {
    this.router.navigate(['tags', row.id]);
  }

  clickBack() {
    this.location.back();
  }

  changeRadio(event: MatRadioChange) {
    const value = event.value;
    if (value === 'all') {
      this._setDataSource(this.projects);
    } else if (value === 'ready') {
      this._setDataSource(this.projects.filter(project => project.latest !== '' && project.commits === 0));
    } else if (value === 'untagged') {
      this._setDataSource(this.projects.filter(project => project.latest === ''));
    } else if (value === 'pending') {
      this._setDataSource(this.projects.filter(project => project.commits));
    } else {
      console.error(`changeRadio() unknown value='${value}'`);
    }
  }

  // private

  private _handleParamsChanged(params) {
    // console.log(`Tags handleParamsChanged() params='${ JSON.stringify(params) }'`);
    if (!this.apiService.initialized || !this.projects.length) {
      // console.log('Tags handleParamsChanged() call groupService init');
      this.loading = true;
      this.apiService.init().subscribe(
        () => {
          const timer = setInterval(() => {
            if (this.apiService.initialized) {
              clearInterval(timer);
              this.loading = false;
              this._initProjects(params);
            }
          }, 100);
        },
        error => console.error(error),
        () => {
        });
    } else {
      this._initProjects(params);
    }
  }

  private _initProjects(params): void {
    const projects = params.projects;
    const projectIds: number[] = projects ? projects.split(',').map(projectId => +projectId) : null;
    if (projectIds && projectIds.length) {
      // console.log(`Tags _initProjects() projectIds='${projectIds.join(',')}'`);
      projectIds.forEach(projectId => {
        const project = this.apiService.getProjectById(projectId);
        if (project) {
          this.projects.push({
            id: project.id,
            name: project.name,
            description: project.description,
            latest: null,
            when: null,
            commits: null,
            tags: null
          });
        }
      });
    } else {
      // console.log('Tags _initProjects() no projectIds');
    }
    this.projects = this.projects.sort((a, b) => {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0;
    });
    this._setDataSource(this.projects);
    this.projects.forEach(project => {
      const getTags = this.apiService.getTagsByProjectId(project.id);
      const getCommits = this.apiService.getCommitsByProjectId(project.id);
      forkJoin([ getTags, getCommits ]).subscribe(results => {
        const tags = results[ 0 ] || [];
        const commits = results[ 1 ] || [];
        project.tags = tags.length || '';
        project.commits = '';
        if (tags.length) {
          project.latest = tags[ 0 ].name;
          project.when = tags[ 0 ].commit ? tags[ 0 ].commit.created_at : '';
        } else {
          project.latest = '';
          project.when = '';
        }
        if (tags.length && commits.length) {
          const latestTagCommitId = tags[ 0 ].commit.id;
          let commitsSinceTag = -1;
          commits.forEach((commit, index) => {
            if (commitsSinceTag === -1 && latestTagCommitId === commit.id) {
              commitsSinceTag = index;
            }
          });
          project.commits = commitsSinceTag !== -1 ? commitsSinceTag : '';
        }
      });
    });
  }

  private _setDataSource(projects: IRow[]) {
    // console.log(`Tags _setDataSource() projectIds='${projects.map(project => project.id).join(',')}'`);
    this.dataSource = new MatTableDataSource(projects);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
