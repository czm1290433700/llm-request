const LLMRequest = require("llm-request").default;

const chatTest = async () => {
  const LLMRequestEntity = new LLMRequest("");
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
