module.exports = {
  testEnvironment: 'jsdom',
  transform: { '\\.[cm]?js$': 'babel-jest' },
  transformIgnorePatterns: ['/node_modules/(?!@antoniocorraliza/foundry-utils/)'],
};
