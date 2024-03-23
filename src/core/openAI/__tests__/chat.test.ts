import axios from "axios";
import { Readable } from "stream";
import { EnvEnum } from "../../../utils/request";
import OpenAIChat, { IOpenAIChatProps } from "../chat";

jest.mock("axios");

describe("OpenAIChat", () => {
  let openAIChat: OpenAIChat;

  beforeEach(() => {
    openAIChat = new OpenAIChat();
  });

  describe("chat", () => {
    test("chat should make a POST request and return an IOpenAIChatResponse", async () => {
      const mockResponse = {
        choices: [
          { message: { content: "mock answer" }, finish_reason: "finished" },
        ],
      };

      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const testData: IOpenAIChatProps = {
        messages: [{ role: "user", content: "Hello" }],
        model: "gpt-3.5-turbo",
      };
      const apiKey = "test_api_key";

      const result = await openAIChat.chat(testData, apiKey);

      expect(result).toEqual({
        answer: "mock answer",
        finish_reason: "finished",
      });
    });
  });

  describe("streamChat", () => {
    test("should make a POST request with responseType stream in node environment", async () => {
      const mockStream = new Readable();
      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: mockStream,
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const testData: IOpenAIChatProps = {
        messages: [{ role: "user", content: "Hello" }],
        model: "gpt-3.5-turbo",
        stream: true,
      };
      const apiKey = "test_api_key";

      const result = await openAIChat.streamChat<EnvEnum.node>(
        testData,
        apiKey,
        EnvEnum.node
      );

      expect(result).toBeInstanceOf(Readable);
    });
  });
});
