import axios from "axios";
import { EnvEnum } from "../../utils/request";
import { ReadStream } from "fs";
import FormData from "form-data";

export interface IOpenAISpeechProps {
  model: "tts-1" | "tts-1-hd";
  input: string;
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm";
  speed?: number;
}

export type IOpenAITransitionProps =
  | {
      file: ReadStream | File;
      model: "whisper-1";
      prompt?: string;
      response_format?: "json" | "text" | "srt" | "verbose_json" | "vtt";
      temperature?: number;
    }
  | FormData;

export type IOpenAISpeechResponse<T> = T extends EnvEnum.node
  ? Buffer
  : T extends EnvEnum.web
  ? string
  : undefined;

class OpenAIAudio {
  private speechApiUrl = "https://api.openai.com/v1/audio/speech";
  private transitionUrl = "https://api.openai.com/v1/audio/translations";

  constructor() {}

  /**
   * 文本转语音
   * @param data
   * @param env
   */
  public async speech<T>(
    data: IOpenAISpeechProps,
    api_key: string,
    env: T
  ): Promise<IOpenAISpeechResponse<T> | undefined> {
    switch (env) {
      case EnvEnum.node:
        const bufferRes = await axios.request({
          url: this.speechApiUrl,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${api_key}`,
          },
          data,
          responseType: "arraybuffer",
        });
        return Buffer.from(bufferRes.data) as IOpenAISpeechResponse<T>;
      case EnvEnum.web:
        const blobRes = await axios.request({
          url: this.speechApiUrl,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${api_key}`,
          },
          data,
          responseType: "blob",
        });
        const blob = new Blob([blobRes.data]);
        return window.URL.createObjectURL(blob) as IOpenAISpeechResponse<T>;
      default:
        break;
    }
  }

  /**
   * 语音转英文
   * @param data
   * @param api_key
   */
  public async transition(
    data: IOpenAITransitionProps,
    api_key: string
  ): Promise<string> {
    return (
      await axios.request({
        url: this.transitionUrl,
        method: "POST",
        headers: {
          Authorization: `Bearer ${api_key}`,
        },
        data,
      })
    ).data;
  }
}

export default OpenAIAudio;
