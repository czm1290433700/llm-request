import OpenAIAudio, {
  IOpenAISpeechProps,
  IOpenAITransitionProps,
} from "./core/openAI/audio";
import OpenAIChat, { IOpenAIChatProps } from "./core/openAI/chat";
import BaseRequest from "./utils/request";

export enum AudioEnum {
  Speech = "1",
  Transition = "2",
}

export type IOpenAIAudioReq<T> = T extends AudioEnum.Speech
  ? IOpenAISpeechProps
  : IOpenAITransitionProps;

class LLMRequest extends BaseRequest {
  constructor(api_key: string) {
    super(api_key);
  }

  public setApiKey(api_key: string) {
    super.setApiKey(api_key);
  }

  /**
   * openAI语音相关能力，支持文本转语音，语音转英文
   * @param data
   * @param audioType
   * @returns
   */
  public async openAIAudio<T>(data: IOpenAIAudioReq<T>, audioType: T) {
    const openAIAudioEntity = new OpenAIAudio();
    switch (audioType) {
      case AudioEnum.Speech:
        return await openAIAudioEntity.speech(
          data as IOpenAISpeechProps,
          super.getApiKey(),
          super.getEnv()
        );
      case AudioEnum.Transition:
        return await openAIAudioEntity.transition(
          data as IOpenAITransitionProps,
          super.getApiKey()
        );
      default:
        return;
    }
  }

  /**
   * 常规调用 openAI Chat系列模型拿到结果
   * @param data
   * @returns
   */
  public async openAIChat(data: IOpenAIChatProps) {
    const { stream = false } = data;
    const api_key = super.getApiKey();
    const openAIChatEntity = new OpenAIChat();

    if (stream) {
      return await openAIChatEntity.streamChat(data, api_key, super.getEnv());
    } else {
      return await openAIChatEntity.chat(data, api_key);
    }
  }

  /**
   * 支持对流响应的 openAI Chat系列模型结果直接回调给具体 token 的处理函数
   * @param data
   * @param fn
   */
  public async openAIStreamChatCallback(
    data: IOpenAIChatProps,
    fn: (token: string) => void
  ) {
    const { stream = false } = data;
    if (!stream) {
      throw new Error(
        "openAIStreamChatCallback方法只有在流响应场景下才可以使用"
      );
    }
    const openAIChatEntity = new OpenAIChat();
    await openAIChatEntity.streamChatCallback(
      data,
      super.getApiKey(),
      super.getEnv(),
      fn
    );
  }
}

export default LLMRequest;
