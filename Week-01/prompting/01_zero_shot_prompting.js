import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: API_KEY,
});

const main = async (params) => {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: "You are mathmatics expert tell me what is 2 + 2",
      },
    ],
  });

  console.log(`Answer from OpenAI:`, response.choices[0].message.content);
};

main();
