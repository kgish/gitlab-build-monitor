/**
 * Created by skoppe on 17/01/18.
 */
const scanner = require('sonarqube-scanner');

scanner({
  serverUrl: 'https://alm.coin.nl',
  options: {
    'sonar.sources': 'src',
    'sonar.exclusions': '*.spec.ts,*.js,src/node/**',
    'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info'
  }
}, () => {
});
