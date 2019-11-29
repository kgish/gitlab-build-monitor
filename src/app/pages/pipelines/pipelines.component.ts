import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

import {
  ApiService,
  IPipeline,
  IProject
} from '../../services';

@Component({
  selector: 'app-pipelines-detail',
  templateUrl: './pipelines.component.html',
  styleUrls: [ './pipelines.component.scss' ]
})
export class PipelinesComponent implements OnInit, OnDestroy {

  title = 'Pipelines';
  description = 'Here is a list of pipelines belonging to this project.';

  subscriptions: Subscription[] = [];

  project: IProject;
  pipelines: IPipeline[] = [];

  loading = true;
  count = 0;
  countStart = 1;

  displayedColumns: string[] = [
    'id',
    'status',
    // 'ref',
    // 'sha',
    'tag',
    'user',
    // 'created_at',
    // 'updated_at',
    // 'started_at',
    'finished_at',
    // 'committed_at',
    // 'duration',
    // 'coverage',
    'web_url'
  ];

  pageSizeOptions = [ 10, 25, 50, 100 ];
  dataSource: MatTableDataSource<IPipeline>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private apiService: ApiService,
              private location: Location,
              private breakpointObserver: BreakpointObserver,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.breakpointObserver.observe([ Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge ])
      .subscribe(result => {
        if (result.breakpoints[ Breakpoints.XSmall ]) {
          this.displayedColumns = [ 'status', 'finished_at' ];
        } else if (result.breakpoints[ Breakpoints.Small ]) {
          this.displayedColumns = [ 'status', 'tag', 'user', 'finished_at' ];
        } else {
          this.displayedColumns = [ 'id', 'status', 'tag', 'user', 'finished_at', 'web_url' ];
        }
      });

    // Get project id
    const id = +this.route.snapshot.paramMap.get('id');
    if (id) {
      if (!this.apiService.initialized) {
        // console.log('TagsDetail ngOnInit() call apiService init');
        this.apiService.init()
          .subscribe(
            () => {
              const timer = setInterval(() => {
                if (this.apiService.initialized) {
                  clearInterval(timer);
                  this._setProject(id);
                }
              }, 100);
            },
            error => console.error(error),
            () => {
            });
      } else {
        this._setProject(id);
      }
    } else {
      console.error(`Pipelines ngOnInit() cannot find projectId='${id}'`);
      this.loading = false;
    }
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

  gotoLink(url: string) {
    window.open(url, '_blank');
  }

  clickRow(pipeline: IPipeline) {
    this.router.navigate([ '/pipelines', pipeline.id ]);
  }

  clickBack() {
    this.location.back();
  }

  // Private

  private _setProject(id: number) {
    const project = this.apiService.getProjectById(id);
    if (project) {
      this.project = project;
      this.title = project.name;
      this._getPipelines(project);
    } else {
      console.error(`Pipelines _setProject() cannot find projectId='${id}'`);
      this.loading = false;
    }
  }

  private _getPipelines(project: IProject) {
    this.apiService.getPipelinesByProjectId(project.id).subscribe(
      pipelines => this._setPipelines(pipelines),
      error => {
        console.error(error);
        this.loading = false;
      },
      () => {
      });
  }

  private _setPipelines(pipelines: IPipeline[]) {
    this.count = pipelines.length;
    this.countStart = this.count;
    if (this.count) {
      pipelines.forEach(pipeline => {
        this.apiService.getPipelineById(this.project.id, pipeline.id).subscribe(p => {
          this.pipelines.push(p);
          if (--this.count === 0) {
            this.pipelines = this.pipelines.sort((a, b) => a.finished_at < b.finished_at ? 1 : b.finished_at < a.finished_at ? -1 : 0);
            this._setDataSource(this.pipelines);
          }
        });
      });
    } else {
      this._setDataSource([]);
    }
  }

  private _setDataSource(pipelines: IPipeline[]) {
    this.loading = false;
    this.pipelines = pipelines;
    this.dataSource = new MatTableDataSource(pipelines);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
