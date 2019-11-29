import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, delay, expand, map, reduce, tap } from 'rxjs/operators';

import { ICommit, IGroup, IPipeline, IProject, ITag, PipelineStatus } from './api.model';
import { environment } from '../../../environments/environment';

interface ITagData {
  page: number;
  results: Array<ITag>;
  more: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  initialized = false;
  pipelineStatuses: PipelineStatus[] = [ 'running', 'pending', 'success', 'failed', 'canceled', 'skipped' ];

  private groups: IGroup[] = [];
  private projects: IProject[] = [];
  private refs: string[];

  constructor(private http: HttpClient) {
    this.refs = environment.env.refs || [];
  }

  init(): Observable<IGroup[]> {
    if (this.groups.length) {
      // console.log('ApiService init() => of(this.groups)');
      return of(this.groups);
    } else {
      // console.log('ApiService init() http request');
      return this.http.get<IGroup[]>(`${environment.env.gitlabApi}/groups?per_page=100`).pipe(
        tap(groups => {
          groups.forEach(group => {
            this.http.get<IProject[]>(`${environment.env.gitlabApi}/groups/${group.id}/projects?per_page=100`).pipe(
              catchError(error => this.handleError('init projects', error))
            ).subscribe(projects => {
              group.projects = [];
              projects.forEach(project => {
                project.groupId = group.id;
                // console.log(`ApiService init() push projectId='${project.id}'`);
                group.projects.push(project);
                this.projects.push(project);
              });
              // console.log(`ApiService init() push groupId='${group.id}'`);
              this.groups.push(group);
              if (this.groups.length === groups.length) {
                // console.log('ApiService init() call http.get() initialized');
                this.initialized = true;
              }
            });
          });
        }),
        catchError(error => this.handleError('init groups', error))
      );
    }
  }

  getGroups(): IGroup[] {
    return [ ...this.groups ];
  }

  getGroupById(groupId: number): IGroup {
    const found = this.groups.find(group => group.id === groupId);
    if (!found) {
      console.error(`ApiService getGroupById() Cannot find group with id='${groupId}'`);
    }
    return found;
  }

  getProjectById(projectId: number): IProject {
    const found = this.projects.find(project => project.id === projectId);
    if (!found) {
      console.error(`ApiService getProjectById() Cannot find project with id='${projectId}'`);
    }
    return found;
  }

  getProjectsByGroupId(groupId: number): IProject {
    const found = this.projects.find(project => project.groupId === groupId);
    if (!found) {
      console.error(`ApiService getProjectsByGroupId() Cannot find any projects with groupId='${groupId}'`);
    }
    return found;
  }

  getTagsByProjectId(projectId: number): Observable<ITag[]> {
    return new Observable(observer => {
      const url = `${environment.env.gitlabApi}/projects/${projectId}/repository/tags`;
      const perPage = 100;
      this.getPageTag(url, 1, perPage).pipe(
        // tap(console.log),
        expand((data: ITagData) => {
          return data.more ? this.getPageTag(url, data.page, perPage) : EMPTY;
        }),
        reduce((acc: ITag[], data: ITagData) => {
          return data.results ? acc.concat(data.results) : acc;
        }, [])
      )
        .subscribe(data => {
          observer.next(data);
          observer.complete();
        });
    });
  }

  private getPageTag(url: string, page: number, perPage: number): Observable<ITagData> {
    url = `${url}?page=${page}&per_page=${perPage}`;
    // console.log(`getPage() url='${url}'`);
    return this.http.get<ITag[]>(`${url}?page=${page}&per_page=${perPage}`).pipe(
      // tap(console.log),
      map((results: ITag[]) => {
          return {
            page: page + 1,
            results: results && results.length ? results : null,
            more: results && results.length === perPage
          };
        }
      ),
      catchError(error => this.handleError('getPageTag', error))
    );
  }

  getCommitsByProjectId(projectId: number): Observable<ICommit[]> {
    return this.http.get<ICommit[]>(`${environment.env.gitlabApi}/projects/${projectId}/repository/commits`).pipe(
      catchError(error => this.handleError('getCommitsByProjectId', error))
    );
  }

  getPipelinesByProjectId(projectId: number): Observable<IPipeline[]> {
    const url = `${environment.env.gitlabApi}/projects/${projectId}/pipelines?per_page=1000`;
    return this.http.get<IPipeline[]>(url).pipe(
      // Filter out pipelines where pipeline ref not part of allowed refs.
      map(pipelines => pipelines.filter(pipeline => this.refs.includes(pipeline.ref))),
      catchError(error => this.handleError('getPipelinesByProjectId', error))
    );
  }

  getPipelineById(projectId: number, pipelineId: number): Observable<IPipeline> {
    const url = `${environment.env.gitlabApi}/projects/${projectId}/pipelines/${pipelineId}`;
    return this.http.get<IPipeline>(url).pipe(
      delay(250),
      catchError(error => this.handleError('getPipelineById', error))
    );
  }

  private handleError(fn: string, error: any) {
    console.error(`ApiService ${fn} error='${JSON.stringify(error)}'`);
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${error.status}: ${error.statusText}, ${error.message || ''}`;
    }
    console.error(`ApiService ${fn} throwError('${errorMessage}')`);
    return throwError(errorMessage);
  }

}
