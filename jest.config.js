module.exports = {
  preset: "ts-jest", // 预置类型
  testEnvironment: "node", // 设置环境
  testMatch: ["**/__tests__/**/*.+(js|ts)", "**/?(*.)+(test).+(js|ts)"], // 测试文件匹配模式
  clearMocks: true, // 是否清除每个测试前的mocks
  resetMocks: false, // 是否在每次测试前自动重置模拟函数
  coverageDirectory: "coverage", // 覆盖率报告目录
  transform: {
    // ts需要额外编译
    "^.+\\.(js|ts)$": "ts-jest",
  },
  // 模块文件的扩展名
  moduleFileExtensions: ["js", "ts"],
  modulePathIgnorePatterns: ["<rootDir>/src/demos/"],
};
