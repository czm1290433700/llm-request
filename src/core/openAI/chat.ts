import axios from "axios";
import { cloneDeep } from "lodash";
import { Readable } from "stream";
import { EnvEnum } from "../../utils/request";

export interface IOpenAIChatProps {
  messages: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
  model: "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4";
  frequency_penalty?: [-2, 2];
  max_tokens?: number;
  temperature?: [0, 2];
  stop?: string | string[];
  stream?: true;
}

export interface IOpenAIChatResponse {
  answer: string;
  finish_reason: string;
}

export type IOpenAIStreamChatResponse<T> = T extends EnvEnum.node
  ? Readable
  : T extends EnvEnum.web
  ? ReadableStreamDefaultReader<Uint8Array>
  : undefined;

class OpenAIChat {
  private chatApiUrl = "https://api.openai.com/v1/chat/completions";
  constructor() {}

  /**
   * 常规返回的 chat
   * @param data
   * @param api_key
   * @returns
   */
  public async chat(
    data: IOpenAIChatProps,
    api_key: string
  ): Promise<IOpenAIChatResponse> {
    // 非流响应下的请求不需要额外逻辑兼容 web 和 node
    const chatData = cloneDeep(data);
    delete chatData.stream;

    const res = await axios.request({
      method: "post",
      url: this.chatApiUrl,
      headers: {
        Authorization: `Bearer ${api_key}`,
        "Content-Type": "application/json",
      },
      data: chatData,
    });
    return {
      answer: res.data?.choices?.[0]?.message?.content || "",
      finish_reason: res.data?.choices?.[0]?.finish_reason,
    };
  }

  /**
   * 流响应返回的 chat(直接返回流)
   * @param data
   * @param api_key
   */
  public async streamChat<T>(
    data: IOpenAIChatProps,
    api_key: string,
    env: T
  ): Promise<IOpenAIStreamChatResponse<T> | undefined> {
    switch (env) {
      case EnvEnum.node:
        return (
          await axios.request({
            url: this.chatApiUrl,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${api_key}`,
            },
            data,
            responseType: "stream",
          })
        ).data;
      case EnvEnum.web:
        const response = await fetch(this.chatApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${api_key}`,
          },
          body: JSON.stringify(data),
        });
        return response.body?.getReader() as IOpenAIStreamChatResponse<T>;
      default:
        break;
    }
  }

  /**
   * 流响应返回的 chat（不返回流，直接处理)
   * @param data
   * @param api_key
   * @param env
   * @param fn
   */
  public async streamChatCallback(
    data: IOpenAIChatProps,
    api_key: string,
    env: EnvEnum,
    fn: (answer: string) => void
  ): Promise<void> {
    switch (env) {
      case EnvEnum.node:
        const stream = await this.streamChat<EnvEnum.node>(data, api_key, env);
        stream?.on("data", (chunk: Buffer) => {
          const decoder = new TextDecoder("utf-8");
          const chunkString = decoder.decode(chunk);
          const chunks = chunkString
            .split("data:")
            .map((data) => {
              const trimData = data.trim();
              if (trimData === "" || trimData === "[DONE]") {
                return undefined;
              }
              return JSON.parse(trimData);
            })
            .filter((data) => data);

          chunks.forEach((data) => {
            const token = data.choices[0].delta.content;

            if (token !== undefined) {
              // 通过 fn 向外传递流的处理结果
              fn(token);
            }
          });
        });

        stream?.on("end", () => {
          console.log("全部数据读取完毕");
        });
        break;
      case EnvEnum.web:
        const reader = await this.streamChat<EnvEnum.web>(data, api_key, env);
        if (reader) {
          const { done, value } = await reader.read();

          if (done) {
            return reader.releaseLock();
          }
          const decoder = new TextDecoder("utf-8");
          const chunk = decoder.decode(value, { stream: true });
          const chunks = chunk
            .split("data:")
            .map((data) => {
              const trimData = data.trim();
              if (trimData === "") {
                return undefined;
              }
              if (trimData === "[DONE]") {
                return undefined;
              }
              return JSON.parse(data.trim());
            })
            .filter((data) => data);
          chunks.forEach((data) => {
            const token = data.choices[0].delta.content;

            if (token !== undefined) {
              debugger;
              // 通过 fn 向外传递流的处理结果
              fn(token);
            }
          });
        }
        break;
      default:
        break;
    }
  }
}

export default OpenAIChat;
