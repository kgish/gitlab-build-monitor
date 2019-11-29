import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatButtonToggleChange, MatSelectChange } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { Chart } from 'chart.js';

import { environment } from '../../../environments/environment';

import {
  ApiService,
  IPipeline,
  IProject,
  PipelineStatus
} from '../../services';

type ViewMode = 'list' | 'grid';

interface IQueryParams {
  statuses?: string;
  projects?: string;
  view?: ViewMode;
  blame?: boolean;
}

interface IRow {
  id: number;
  name: string;
  description: string;
  status: PipelineStatus | 'notfound';
  web_url: string;
  finished: string;
  blame: string;
  when: string;
  count: number;
  pipelines: number | string;
  avatar_url: string;
}

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: [ './monitor.component.scss' ]
})
export class MonitorComponent implements OnInit, OnDestroy {

  title = 'Monitor';
  description = 'Here is a list of monitored projects.';

  loading = false;
  count = 0;
  countStart = 1;

  subscriptions: Subscription[] = [];
  statuses: PipelineStatus[] = [];

  projects: IRow[] = [];
  filteredProjects: IRow[] = [];
  pipelineStatuses: PipelineStatus[];
  pipelinesPending: boolean;

  timer: number;
  refreshTimeoutSecs: number;
  blame: boolean;

  displayedColumns: string[] = [
    'id',
    'name',
    'status',
    'finished',
    'blame',
    'when',
    'count',
    'pipelines',
    'avatar_url'
  ];

  viewMode: ViewMode = 'list';

  private intervalTimer;

  pageSizeOptions = [ 10, 25, 50, 100 ];
  dataSource: MatTableDataSource<IRow>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSelectChange, { static: true }) select: MatSelectChange;

  pieChart: Chart;

  constructor(private apiService: ApiService,
              private breakpointObserver: BreakpointObserver,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this._initTimer();
    this.pipelineStatuses = this.apiService.pipelineStatuses;
    this.blame = environment.env.blame;
    this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => this._handleParamsChanged(params)));
    this.breakpointObserver.observe([ Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge ])
      .subscribe(result => {
        if (result.breakpoints[ Breakpoints.XSmall ]) {
          this.displayedColumns = [ 'name', 'status' ];
        } else if (result.breakpoints[ Breakpoints.Small ]) {
          this.displayedColumns = [ 'name', 'status', 'finished', 'blame', 'when', 'pipelines' ];
        } else {
          this.displayedColumns = [ 'id', 'name', 'status', 'finished', 'blame', 'when', 'count', 'pipelines', 'avatar_url' ];
        }
        if (!this.blame && this.displayedColumns.includes('blame')) {
          this.displayedColumns = this.displayedColumns.filter(col => ![ 'blame', 'when', 'count' ].includes(col));
        }
      });
  }

  ngOnDestroy(): void {
    // console.log('Monitor onDestroy()');
    this._clearTimer();
    this.subscriptions.forEach(subscription => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleViewMode(event: MatButtonToggleChange) {
    this.viewMode = event.value as ViewMode;
    this.router.navigate([ '/monitor' ], this._buildExtras());
  }

  onStatusChange(event: MatSelectChange) {
    this.statuses = event.value;
    this.router.navigate([ '/monitor' ], this._buildExtras());
  }

  gotoLink(url: string) {
    window.open(url, '_blank');
  }

  clickRow(project: IProject) {
    this.router.navigate([ '/pipelines', project.id ]);
  }

  // private

  private _initTimer() {
    // console.log('Monitor _initTimer()');
    this.refreshTimeoutSecs = environment.env.refreshTimeoutSecs || 60;
    this.timer = this.refreshTimeoutSecs;
    this._clearTimer();
    this.intervalTimer = setInterval(() => {
      if (--this.timer === 0) {
        this._setPipelines(this.projects);
        this.timer = this.refreshTimeoutSecs;
      }
    }, 1000);
  }

  private _clearTimer() {
    if (this.intervalTimer) {
      // console.log('Monitor _clearTimer() clear');
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    } else {
      // console.log('Monitor _clearTimer() not set');
    }
  }

  private _handleParamsChanged(params) {
    // console.log(`Monitor handleParamsChanged() params='${JSON.stringify(params)}'`);

    if (params.blame) {
      this.blame = true;
    }

    if (!this.apiService.initialized) {
      // console.log('Monitor handleParamsChanged() call apiService init');
      this.loading = true;
      this.apiService.init()
        .subscribe(
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
    // console.log(`Monitor _initAll() params='${JSON.stringify(params)}'`);
    if (!this.projects.length) {
      const projectsParam = params.projects;
      const projectIds: number[] = projectsParam ? projectsParam.split(',').map(projectId => +projectId) : null;
      const projects: IProject[] = [];
      if (projectIds && projectIds.length) {
        projectIds.forEach(projectId => {
          const project = this.apiService.getProjectById(projectId);
          if (project) {
            projects.push(project);
          }
        });
        this._setProjects(projects);
      } else {
        // console.log('Monitor _initAll() no projectIds');
      }
    }

    if (params.statuses) {
      this.statuses = params.statuses.split(',');
      this._filterStatuses(this.statuses);
    } else {
      this._filterStatuses(null);
    }

    if (params.view && [ 'list', 'grid' ].includes(params.view)) {
      this.viewMode = params.view;
      // console.log(`Monitor _initAll() viewMode='${this.viewMode}'`);
    }

    if (params.blame) {
      this.blame = true;
    }
  }

  private _setProjects(projects: IProject[]) {
    // console.log(`Monitor _setProjects() projectIds='${projects.map(project => project.id).join(',')}'`);
    projects = projects.sort((a, b) => {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0;
    });
    projects.forEach(project => {
      this.projects.push({
        id: project.id,
        name: project.name,
        description: project.description,
        status: null,
        web_url: null,
        finished: null,
        blame: null,
        when: null,
        count: null,
        pipelines: null,
        avatar_url: project.avatar_url
      });
    });
    this._setPipelines(this.projects);
    this._setDataSource(this.projects);
  }

  private _setPipelines(projects: IRow[]) {
    // console.log(`Monitor _setPipelines() projectIds='${projects.map(project => project.id).join(',')}'`);
    this.countStart = projects.length;
    this.count = this.countStart;
    if (this.countStart) {
      this.pipelinesPending = true;
    }
    projects.forEach(project => {
      this.apiService.getPipelinesByProjectId(project.id)
        .subscribe(pipelines => {
            pipelines = pipelines || [];
            if (pipelines.length) {
              project.pipelines = pipelines.length;
              project.status = pipelines[ 0 ].status;
              project.web_url = pipelines[ 0 ].web_url;
              this.apiService.getPipelineById(project.id, pipelines[ 0 ].id)
                .subscribe(pipeline => project.finished = pipeline.finished_at);
            } else {
              project.status = 'notfound';
              project.pipelines = '';
            }
            if (project.status === 'failed' && (environment.env.blame || this.blame)) {
              // Scan back in time and find first broken if possible.
              // console.log('Monitor _setPipelines search blame pipeline');
              let found: IPipeline = null;
              let count: number;
              pipelines.forEach((pipeline, index) => {
                if (!found) {
                  if (pipeline.status === 'success') {
                    found = pipelines[ index - 1 ];
                    count = index;
                    // console.log(`Monitor _setPipelines found blame pipeline='${JSON.stringify(found)}'`);
                  }
                }
              });
              if (found) {
                this.apiService.getPipelineById(project.id, found.id)
                  .subscribe(pipeline => {
                      project.blame = pipeline.user ? pipeline.user.name || pipeline.user.username : 'unknown';
                      project.when = pipeline.finished_at;
                      project.count = count;
                      // console.log(`Monitor _setPipelines blame='${project.blame}' when='${project.blame}' count='${project.count}'`);
                    },
                    error => console.error(error),
                    () => {
                    }
                  );
              } else {
                project.blame = '';
                // console.log('Monitor _setPipelines cannot find blame pipeline');
              }
            } else {
              project.blame = '';
              project.when = '';
              project.count = 0;
            }
          },
          error => console.error(error),
          () => {
            if (--this.count === 0) {
              this.pipelinesPending = false;
              this._filterStatuses(this.statuses);
              this._setPieChart(this.projects);
            }
          }
        );
    });
  }

  private _setDataSource(projects: IRow[]) {
    // console.log(`Monitor _setDataSource() projectIds='${projects.map(project => project.id).join(',')}'`);
    this.description = `Total projects: ${this.filteredProjects.length}/${this.projects.length}`;
    if (this.viewMode === 'list') {
      this.description = `${this.description}, click row to view project pipelines.`;
    }
    this.dataSource = new MatTableDataSource(projects);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private _setPieChart(projects: IRow[]) {
    const projectStatusCounts: { status: PipelineStatus, color: string, count: number }[] = [
      { status: 'success', color: '#1aaa55', count: 0 },
      { status: 'failed', color: '#db3b21', count: 0 },
      { status: 'running', color: '#418cd8', count: 0 },
      { status: 'pending', color: '#ff6af1', count: 0 },
      { status: 'canceled', color: '#ff8134', count: 0 },
      { status: 'skipped', color: 'rgba(0,0,0,0.51)', count: 0 }
    ];
    projects.forEach(project => {
      const found = projectStatusCounts.find(j => j.status === project.status);
      if (found) {
        found.count++;
      } else {
        console.error(`Monitor _setPieChart() cannot find project.status='${project.status}'`);
      }
    });

    this.pieChart = new Chart('pieChart', {
      type: 'pie',
      data: {
        datasets: [ {
          data: projectStatusCounts.map(j => j.count),
          backgroundColor: projectStatusCounts.map(j => j.color)
        } ],
        labels: projectStatusCounts.map(
          j => {
            return `${j.count} ${j.status[ 0 ].toUpperCase() + j.status.slice(1)} (${Math.round(((j.count * 100) / projects.length))}%)`;
          })
      },
      options: {
        responsive: true,
        legend: {
          position: 'right'
        }
      }
    });
  }

  private _buildExtras(): NavigationExtras {
    const projectIds: number[] = this.projects.map(project => project.id);
    const queryParams: IQueryParams = {};

    if (this.statuses.length) {
      queryParams.statuses = this.statuses.join(',');
    }

    if (projectIds.length) {
      queryParams.projects = projectIds.join(',');
    }

    queryParams.view = this.viewMode;

    if (this.blame) {
      queryParams.blame = true;
    }

    // const result = projectIds.length || this.statuses.length ? { queryParams } : {};
    // console.log(`Monitor _buildExtras() result='${JSON.stringify(result)}'`);
    // return result;
    return projectIds.length || this.statuses.length ? { queryParams } : {};
  }

  private _filterStatuses(statuses) {
    if (statuses && statuses.length) {
      // console.log(`Monitor _filterStatuses() statuses='${statuses.join(',')}'`);
      this.filteredProjects = this.projects.filter(project => statuses.includes(project.status));
    } else {
      // console.log('Monitor _filterStatuses() no statuses');
      this.filteredProjects = this.projects;
    }

    // console.log(`Monitor _filterStatuses() filtered projectIds='${this.filteredProjects.map(project => project.id).join(',')}'`);
    this._setDataSource(this.filteredProjects);
  }
}
