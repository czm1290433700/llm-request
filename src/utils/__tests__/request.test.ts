import BaseRequest, { EnvEnum } from "../request";

describe("BaseRequest", () => {
  let baseRequest: BaseRequest;

  describe("api_key", () => {
    beforeEach(() => {
      baseRequest = new BaseRequest("test_api_key");
    });

    test("should initialize with provided api key", () => {
      expect(baseRequest.getApiKey()).toBe("test_api_key");
    });

    test("should set and get the api key correctly", () => {
      const newApiKey = "new_test_api_key";
      baseRequest.setApiKey(newApiKey);
      expect(baseRequest.getApiKey()).toBe(newApiKey);
    });
  });

  describe("getEnv()", () => {
    test("should return EnvEnum.web in browser environment", () => {
      // 在 Jest 测试环境下模拟浏览器环境
      // @ts-ignore
      global.window = {};
      // @ts-ignore
      delete global.window.process;
      baseRequest = new BaseRequest("test_api_key");
      expect(baseRequest.getEnv()).toBe(EnvEnum.web);
    });

    test("should return EnvEnum.node in Node.js environment", () => {
      // @ts-ignore
      global.window = undefined;
      Object.defineProperty(global, "process", {
        value: {
          version: "mock-version-string",
        },
      });
      baseRequest = new BaseRequest("test_api_key");
      expect(baseRequest.getEnv()).toBe(EnvEnum.node);
    });

    test("should return EnvEnum.unknown in an unknown environment", () => {
      // 模拟一个既没有 window 也没有 process 的环境
      // @ts-ignore
      global.window = undefined;
      // @ts-ignore
      delete global.process;
      baseRequest = new BaseRequest("test_api_key");
      expect(baseRequest.getEnv()).toBe(EnvEnum.unknown);
    });
  });
});
