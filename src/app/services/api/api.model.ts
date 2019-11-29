export interface IUser {
  name: string;
  username: string;
  id: number;
  state: string;
  avatar_url: string;
  web_url: string;
}

export interface IGroup {
  id: number;
  name: string;
  description: string;
  path: string;
  visibility: string;
  lfs_enabled: boolean;
  avatar_url: string;
  web_url: string;
  request_access_enabled: boolean;
  full_name: string;
  full_path: string;
  file_template_project_id: number;
  parent_id: number;
  projects: IProject[];
}

export interface IProject {
  id: number;
  name: string;
  groupId: number;
  status: PipelineStatus;
  description: string;
  avatar_url: string;
  http_url_to_repo: string;
  last_activity_at: string;
}

export type PipelineStatus = 'running' | 'pending' | 'success' | 'failed' | 'canceled' | 'skipped';

export interface IPipeline {
  id: number;
  status: PipelineStatus;
  ref: string;
  sha: string;
  before_sha: string;
  tag: boolean;
  yaml_errors: any;
  user: IUser;
  created_at: string;
  updated_at: string;
  started_at: string;
  finished_at: string;
  committed_at: string;
  duration: string;
  coverage: string;
  web_url: string;
}

export interface ICommit {
  id: string;
  short_id: string;
  title: string;
  created_at: string;
  parent_ids: string[];
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committer_name: string;
  committer_email: string;
  committed_date: string;
}

export interface IRelease {
  tag_name: string;
  description: string;
}

export interface ITag {
  commit: ICommit;
  release: IRelease;
  name: string;
  target: string;
  message: string;
}
