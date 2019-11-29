export const environment = {
  production: false,
  hmr: true,
  env: {
    refreshTimeoutSecs: 60,
    refs: [ 'master' ],
    gitlabApi: 'https://gitlab.com/api/v4',
    redirecturl: '/home',
    notfound: false,
    blame: false
  }
};
