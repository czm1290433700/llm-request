# llm-request

一个面向大语言模型的 web 和 nodejs 端请求库，目前已支持 openAI 的音频和 chat 相关请求，已提供如下 API。
| 方法名 | 作用 |
| -- | -- |
|openAIAudio|支持音频转文本和文本翻译能力|
|openAIChat|支持常规 chat 和流响应|
|openAIStreamChatCallback|支持通过回调函数的方式直接处理流|

下面提供了一些具体示例

## Node.js 环境调用

### audio 类能力的调用 case

```
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const LLMRequest = require("llm-request").default;

const audioTest = async () => {
  const LLMRequestEntity = new LLMRequest(""); // 换成你的API_KEY
  console.log("开始生成音频");
  const audioBuffer = await LLMRequestEntity.openAIAudio(
    {
      model: "tts-1",
      input: "我正在试用llm-request中的openAIAudio方法生成音频",
      voice: "alloy",
    },
    "1"
  );

  const audioPath = path.resolve(__dirname, "audio.mp3");
  if (audioBuffer) {
    await fs.promises.writeFile(audioPath, audioBuffer);
    console.log("音频生成完成, 开始将音频转英文");

    let data = new FormData();
    data.append("file", fs.createReadStream(audioPath));
    data.append("model", "whisper-1");
    const audioText = await LLMRequestEntity.openAIAudio(data, "2");
    console.log(`音频转英文成功，对应文本结果为：${audioText}`);
  } else {
    console.log("未获取有效音频");
  }
};

audioTest();
```

### chat 类能力的调用 case

```
const LLMRequest = require("llm-request").default;

const chatTest = async () => {
  const LLMRequestEntity = new LLMRequest(""); // 换成你的API_KEY
  console.log("开始测试openAIChat - 常规");
  const chatRes = await LLMRequestEntity.openAIChat({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: "你好",
      },
    ],
  });
  console.log(`常规chat结果为:${JSON.stringify(chatRes)}`);
  // openAIStreamChatCallback 底层调用了 openAIChat 流，直接测试它即可
  console.log("开始测试openAIChat - 流及openAIStreamChatCallback");
  await LLMRequestEntity.openAIStreamChatCallback(
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "你好",
        },
      ],
      stream: true,
    },
    (answer) => console.log(answer)
  );
};

chatTest();
```

## WEB 环境的调用

### audio 类能力的调用 case

```
import { useEffect, useState } from "react";
import { default as LLMRequest } from "llm-request";

function App() {
  const [audioUrl, setAudioUrl] = useState("");
  const [audioText, setAudioText] = useState("");

  const audioTest = async () => {
    const LLMRequestEntity = new LLMRequest(""); // 换成你的API_KEY
    console.log("开始生成音频");

    const audioUrl = await LLMRequestEntity.openAIAudio(
      {
        model: "tts-1",
        input: "我正在试用llm-request中的openAIAudio方法生成音频",
        voice: "alloy",
      },
      "1"
    );
    if (audioUrl) {
      setAudioUrl(audioUrl);

      // 音频 url 转 File 对象
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();
      const file = new File([audioBlob], "audio.mp3", { type: "audio/mpeg" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "whisper-1");
      setAudioText(await LLMRequestEntity.openAIAudio(formData, "2"));
    } else {
      console.log("未获取有效音频");
    }
  };

  useEffect(() => {
    audioTest();
  }, []);

  return (
    <>
      {audioUrl && <audio src={audioUrl} controls></audio>}
      {audioText}
    </>
  );
}

export default App;
```

### chat 类能力的调用

```
import { useEffect, useState } from "react";
import { default as LLMRequest } from "llm-request";

function App() {
  const [text, setText] = useState("");

  const chatTest = async () => {
    const LLMRequestEntity = new LLMRequest(""); // 换成你的API_KEY
    setText(
      JSON.stringify(
        await LLMRequestEntity.openAIChat({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: "你好",
            },
          ],
        })
      )
    );

    await LLMRequestEntity.openAIStreamChatCallback(
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "深圳有哪些火车站",
          },
        ],
        stream: true,
      },
     (answer) => {
        document.getElementById("output").innerHTML += answer;
      }
    );
  };

  useEffect(() => {
    chatTest();
  }, []);

  return (
    <>
      {text}
      <br></br>
      <div id="output"></div>
    </>
  );
}

export default App;
```
