export enum EnvEnum {
  unknown = 0,
  node = 1,
  web = 2,
}

interface IRequest {
  getApiKey: () => string;
  setApiKey: (api_key: string) => void;
  getEnv: () => EnvEnum;
}

class BaseRequest implements IRequest {
  private api_key: string;
  private env: EnvEnum = EnvEnum.unknown;

  constructor(api_key: string) {
    this.setApiKey(api_key);
    // 初始化环境参数
    if (typeof window !== "undefined") {
      this.env = EnvEnum.web;
    } else if (
      typeof process !== "undefined" &&
      typeof process.version === "string"
    ) {
      this.env = EnvEnum.node;
    }
  }

  public setApiKey(api_key) {
    this.api_key = api_key;
  }

  public getApiKey() {
    return this.api_key;
  }

  public getEnv() {
    return this.env;
  }
}

export default BaseRequest;
