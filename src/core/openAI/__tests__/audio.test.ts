import axios from "axios";
import * as FormData from "form-data";
import * as fs from "fs";
import { EnvEnum } from "../../../utils/request";
import OpenAIAudio, {
  IOpenAISpeechProps,
  IOpenAITransitionProps,
} from "../audio";

const MOCK_API_KEY = "mock-api-key";
const MOCK_SPEECH_DATA: IOpenAISpeechProps = {
  model: "tts-1",
  input: "Hello World!",
  voice: "alloy",
};
jest.mock("axios");

describe("OpenAIAudio", () => {
  let openAIAudio: OpenAIAudio;

  beforeEach(() => {
    openAIAudio = new OpenAIAudio();
    // 对axios.post进行模拟
    (axios.request as jest.Mock).mockResolvedValue({ data: "mock-data" });

    global.Blob = jest.fn().mockImplementation((parts, options) => {
      return {
        size: 0,
        type: "",
      };
    });

    global.File = jest.fn().mockImplementation((name, data) => {
      return {
        name,
        lastModified: Date.now(),
        size: data.length || 0,
      };
    });

    // @ts-ignore
    global.window = {};
    // @ts-ignore
    window.URL = {};
    window.URL.createObjectURL = jest.fn(() => {
      return "";
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("speech()", () => {
    it("should return Buffer in node environment", async () => {
      // 模拟Node环境下的responseType: 'arraybuffer'
      const mockBufferRes = Buffer.from("mock-buffer");
      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: mockBufferRes,
      });

      const result = await openAIAudio.speech(
        MOCK_SPEECH_DATA,
        MOCK_API_KEY,
        EnvEnum.node
      );

      expect(result).toEqual(mockBufferRes);
      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://api.openai.com/v1/audio/speech",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MOCK_API_KEY}`,
          },
          data: MOCK_SPEECH_DATA,
          responseType: "arraybuffer",
        })
      );
    });

    it("should return string url in web environment", async () => {
      const mockBlob = new Blob(["mock-blob"]);
      (axios.request as jest.Mock).mockResolvedValueOnce({ data: mockBlob });

      const result = await openAIAudio.speech(
        MOCK_SPEECH_DATA,
        MOCK_API_KEY,
        EnvEnum.web
      );

      expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(typeof result).toBe("string"); // 结果类型应为字符串
    });
  });

  describe("transition()", () => {
    it("should make the correct API call and return the response data in node environment", async () => {
      const expectedResult = { text: "mock-transition-result" };
      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: expectedResult,
      });

      const MOCK_TRANSITION_DATA = new FormData();
      MOCK_TRANSITION_DATA.append(
        "file",
        fs.createReadStream("./download.mp3")
      );
      MOCK_TRANSITION_DATA.append("model", "whisper-1");

      const result = await openAIAudio.transition(
        MOCK_TRANSITION_DATA,
        MOCK_API_KEY
      );

      expect(result).toEqual(expectedResult.text);
      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://api.openai.com/v1/audio/translations",
          method: "POST",
          headers: {
            Authorization: `Bearer ${MOCK_API_KEY}`,
          },
          data: MOCK_TRANSITION_DATA,
        })
      );
    });

    it("should make the correct API call and return the response data in web environment", async () => {
      const MOCK_TRANSITION_DATA: IOpenAITransitionProps = {
        // @ts-ignore
        file: new File(["mock-file"], "mock-file.mp3"),
        model: "whisper-1",
      };
      const expectedResult = { text: "mock-transition-result" };
      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: expectedResult,
      });

      const result = await openAIAudio.transition(
        MOCK_TRANSITION_DATA,
        MOCK_API_KEY
      );

      expect(result).toEqual(expectedResult.text);
      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://api.openai.com/v1/audio/translations",
          method: "POST",
          headers: {
            Authorization: `Bearer ${MOCK_API_KEY}`,
          },
          data: MOCK_TRANSITION_DATA,
        })
      );
    });
  });
});
