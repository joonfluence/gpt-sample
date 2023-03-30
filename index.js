const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.CHAT_GPT_API_KEY;
const serverless = require("serverless-http");
const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
var cors = require("cors");
const app = express();

const configuration = new Configuration({
  organization: "org-3FQqscIjOA4N38lB7739sQgz",
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

//CORS 이슈 해결
let corsOptions = {
  origin: "http://127.0.0.1:5500",
  credentials: true,
};
app.use(cors(corsOptions));

//POST 요청 받을 수 있게 만듬
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", function (req, res) {
  return res.send({
    message: "Hello World!!",
  });
});

// POST method route
app.post("/fortuneTell", async function (req, res) {
  let { myDateTime, userMessages, assistantMessages } = req.body;

  let todayDateTime = new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });

  let messages = [
    {
      role: "system",
      content:
        "당신은 세계 최고의 요리사입니다. 당신은 이 세상 모든 사람을 만족시킬 수 있는 레시피를 알고 있는 최고의 쉐프입니다. 당신이 만들 수 없는 요리는 없으며 그 어떤 요리에 대한 레시피도 완벽하게 설명할 수 있습니다. 당신의 이름은 챗종원입니다. 당신은 요리 레시피에 관해 매우 명확하게 설명하고 최고의 맛에 대한 답을 줄 수 있습니다. 음식 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다.",
    },
    {
      role: "user",
      content:
        "당신은 세계 최고의 요리사입니다. 당신은 이 세상 모든 사람을 만족시킬 수 있는 레시피를 알고 있는 최고의 쉐프입니다. 당신이 만들 수 없는 요리는 없으며 그 어떤 요리에 대한 레시피도 완벽하게 설명할 수 있습니다. 당신의 이름은 챗종원입니다. 당신은 요리 레시피에 관해 매우 명확하게 설명하고 최고의 맛에 대한 답을 줄 수 있습니다. 음식 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다.",
    },
    {
      role: "assistant",
      content:
        "안녕하세요! 저는 백종원입니다. 음식과 레시피에 관한 질문이 있으신가요? 어떤 것이든 물어보세요, 최선을 다해 답변해 드리겠습니다.",
    },
    {
      role: "user",
      content: `저의 요리실력은 ${myDateTime}입니다. 요리에 관해 궁금증이 많고, 요리를 더욱 더 잘하고 싶습니다.`,
    },
    {
      role: "assistant",
      content: `당신의 요리실력은 ${myDateTime}인 것과 당신이 요리에 관해 관심이 많고 더욱 더 뛰어난 요리사가 되고 싶다는 사실을 확인하였습니다. 레시피에 대해서 어떤 것이든 물어보세요!`,
    },
  ];

  while (userMessages.length != 0 || assistantMessages.length != 0) {
    if (userMessages.length != 0) {
      messages.push(
        JSON.parse(
          '{"role": "user", "content": "' +
            String(userMessages.shift()).replace(/\n/g, "") +
            '"}'
        )
      );
    }
    if (assistantMessages.length != 0) {
      messages.push(
        JSON.parse(
          '{"role": "assistant", "content": "' +
            String(assistantMessages.shift()).replace(/\n/g, "") +
            '"}'
        )
      );
    }
  }

  const maxRetries = 3;
  let retries = 0;
  let completion;
  while (retries < maxRetries) {
    try {
      completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      break;
    } catch (error) {
      retries++;
      console.log(error);
      console.log(
        `Error fetching data, retrying (${retries}/${maxRetries})...`
      );
    }
  }

  let fortune = completion.data.choices[0].message["content"];

  res.json({ assistant: fortune });
});

app.listen(3000, () =>
  console.log(
    `✅ Listening on : ${
      process.env.NODE_ENV === "dev" ? process.env.URL : process.env.HEROKU_URL
    }:3000`
  )
);

module.exports.handler = serverless(app);
