export const environment = {
  production: true,
  hmr: false,
  env: {
    refreshTimeoutSecs: 60,
    refs: [ 'master' ],
    gitlabApi: 'https://gitlab.com/api/v4',
    redirecturl: '/gitlab-build-monitor/home',
    notfound: false,
    blame: false
  }
};
