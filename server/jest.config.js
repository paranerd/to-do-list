// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    verbose: true,
    testEnvironment: 'node',
    testTimeout: 10000,
    coveragePathIgnorePatterns: ['/node_modules/'],
  };
  
  module.exports = config;
