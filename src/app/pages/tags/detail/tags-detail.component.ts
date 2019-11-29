import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Location } from '@angular/common';

import { ApiService, IProject, ITag } from '../../../services';

interface IRow {
  name: string;
  message: string;
  releaseTagName: string;
  releaseDescription: string;
  commitTitle: string;
  commitCreated: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthoredDate: string;
  commitCommitterName: string;
  commitCommittedDate: string;
}

@Component({
  selector: 'app-tags-detail',
  templateUrl: './tags-detail.component.html',
  styleUrls: ['./tags-detail.component.scss']
})
export class TagsDetailComponent implements OnInit, OnDestroy {

  title = 'Tags';
  description = 'Here is a list of tags belonging to this project.';

  subscriptions: Subscription[] = [];

  project: IProject;
  tags: IRow[] = [];

  loading = true;

  displayedColumns: string[] = [
    'name',
    // 'message',
    // 'releaseTagName',
    // 'releaseDescription',
    'commitTitle',
    'commitCreated',
    'commitMessage',
    'commitAuthorName',
    'commitAuthoredDate',
    'commitCommitterName',
    'commitCommittedDate',
  ];

  pageSizeOptions = [10, 25, 50, 100];
  dataSource: MatTableDataSource<IRow>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private apiService: ApiService,
              private location: Location,
              private breakpointObserver: BreakpointObserver,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(result => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          this.displayedColumns = ['name', 'commitCreated'];
        } else if (result.breakpoints[Breakpoints.Small]) {
          this.displayedColumns = ['name', 'commitTitle', 'commitCreated'];
        } else {
          this.displayedColumns = ['name', 'commitTitle', 'commitCreated', 'commitAuthorName'];
        }
      });
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
            error => { console.error(error); this.loading = false; },
            () => {
            });
      } else {
        this._setProject(id);
      }
    } else {
      console.error('TagsDetail ngOnInit() no projectId');
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

  clickRow(row: ITag) {
    // console.log(row);
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
      this._getTags(project);
    } else {
      console.error(`TagsDetail _setProject() cannot find projectId='${ id }'`);
      this.loading = false;
    }
  }

  private _getTags(project: IProject) {
    this.apiService.getTagsByProjectId(project.id).subscribe(
      tags => this._setTags(tags),
      error => console.error(error),
      () => this.loading = false);
  }

  private _setTags(tags: ITag[]) {
    if (tags && tags.length) {
      tags.forEach(tag => this.tags.push({
        name: tag.name,
        message: tag.message,
        releaseTagName: tag.release ? tag.release.tag_name : '',
        releaseDescription: tag.release ? tag.release.description : '',
        commitTitle: tag.commit.title,
        commitCreated: tag.commit.created_at,
        commitMessage: tag.commit.message,
        commitAuthorName: tag.commit.author_name,
        commitAuthoredDate: tag.commit.authored_date,
        commitCommitterName: tag.commit.committer_name,
        commitCommittedDate: tag.commit.committed_date
      }));
      this._setDataSource(this.tags);
    } else {
      this._setDataSource([]);
    }
  }

  private _setDataSource(tags: IRow[]) {
    this.tags = tags;
    this.dataSource = new MatTableDataSource(tags);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
