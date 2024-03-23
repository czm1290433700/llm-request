const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const LLMRequest = require("llm-request").default;

const audioTest = async () => {
  const LLMRequestEntity = new LLMRequest("");
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
