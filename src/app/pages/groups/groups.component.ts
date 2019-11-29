import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';

import {
  IGroup,
  ApiService,
} from '../../services';

interface IRow {
  id: number;
  name: string;
  description: string;
  projects: number;
  avatar_url: string;
  web_url: string;
}

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: [ './groups.component.scss' ]
})
export class GroupsComponent implements OnInit, OnDestroy {

  title = 'Groups';
  description = 'Select one or more groups by clicking on the table rows and then hitting the projects button.';

  subscriptions: Subscription[] = [];
  groups: IRow[] = [];

  loading = false;

  displayedColumns: string[] = [
    'select',
    'id',
    'name',
    'description',
    'projects',
    'avatar_url',
    'web_url'
  ];

  pageSizeOptions = [ 10, 25, 50, 100 ];
  dataSource: MatTableDataSource<IRow>;
  selection = new SelectionModel<IRow>(true, []);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private apiService: ApiService,
              private breakpointObserver: BreakpointObserver,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => this._handleParamsChanged(params)));
    this.breakpointObserver.observe([ Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge ])
      .subscribe(result => {
        if (result.breakpoints[ Breakpoints.XSmall ]) {
          this.displayedColumns = [ 'select', 'name' ];
        } else if (result.breakpoints[ Breakpoints.Small ]) {
          this.displayedColumns = [ 'select', 'name', 'description', 'projects' ];
        } else {
          this.displayedColumns = [ 'select', 'id', 'name', 'description', 'projects', 'avatar_url', 'web_url' ];
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

  clickProjects() {
    this.router.navigate([ '/projects' ], this._buildExtrasProject());
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
    this.router.navigate([ '/groups' ], this._buildExtrasGroup());
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: IRow): string {
    let result;
    if (row) {
      result = `${this.selection.isSelected(row) ? 'deselect' : 'select'} group ${row.name}`;
    } else {
      result = `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return result;
  }

  gotoLink(url: string) {
    window.open(url, '_blank');
  }

  clickRow(row: IRow) {
    this.selection.toggle(row);
    this.router.navigate([ '/groups' ], this._buildExtrasGroup());
  }

  // private

  private _handleParamsChanged(params) {
    // console.log(`Groups handleParamsChanged() params='${ JSON.stringify(params) }'`);
    if (!this.apiService.initialized || !this.groups.length) {
      if (!this.apiService.initialized) {
        // console.log('Groups initialize api');
        this.loading = true;
        this.apiService.init().subscribe(
          groups => {
            const timer = setInterval(() => {
              if (this.apiService.initialized) {
                clearInterval(timer);
                this.loading = false;
                this._setGroups(groups);
                this._handleParamsChangedGroups(params.groups);
              }
            }, 100);
          },
          error => console.error(error),
          () => {
          });
      } else {
        // console.log('Groups api already initialized');
        this._setGroups(this.apiService.getGroups());
      }
    } else {
      // console.log('Groups api and groups already initialized');
      this._handleParamsChangedGroups(params.groups);
    }
  }

  private _handleParamsChangedGroups(groups: string) {
    const groupIds: number[] = groups ? groups.split(',').map(groupId => +groupId) : null;
    if (groupIds && groupIds.length) {
      // console.log(`Groups handleParamsChangedGroups() groupIds='${ groupIds.join(',') }'`);
      this.groups.forEach(group => {
        if (groupIds.includes(group.id)) {
          if (!this.selection.isSelected(group)) {
            this.selection.toggle(group);
          }
        } else if (this.selection.isSelected(group)) {
          this.selection.toggle(group);
        }
      });
    } else {
      // console.log('Groups handleParamsChangedGroups() no groupIds');
      this.groups.forEach(group => {
        if (this.selection.isSelected(group)) {
          this.selection.toggle(group);
        }
      });
    }
  }

  private _setGroups(groups: IGroup[]) {
    // console.log(`Groups _setGroups() groupIds='${ groups.map(group => group.id).join(',') }'`);
    groups = groups.sort((a, b) => {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0;
    });

    this.groups = [];
    groups.forEach(group => {
      this.groups.push({
        ...group,
        projects: group.projects.length
      });
    });

    this.dataSource = new MatTableDataSource(this.groups);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private _buildExtrasGroup(): NavigationExtras {
    // console.log('Groups _buildExtrasGroup()');
    return this._buildExtras();
  }

  private _buildExtrasProject(): NavigationExtras {
    // console.log('Groups _buildExtrasProjects()');
    return this._buildExtras();
  }

  private _buildExtras(): NavigationExtras {
    const groupIds: number[] = this.selection.selected.map(selected => selected.id);
    // const result = groupIds.length ? { queryParams: { groups: groupIds.join(',') } } : {};
    // console.log(`Groups _buildExtras() => ${ JSON.stringify(result) }`);
    // return result;
    return groupIds.length ? { queryParams: { groups: groupIds.join(',') } } : {};
  }
}
