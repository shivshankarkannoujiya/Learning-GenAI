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
        content: `
          You are mathmatics expert tell me what is 2 + 2
          Do not add anything in answer. Take the example from the examples
          Examples:
          - What is 4 + 5
            Expected Output: 9 (Nine)
          - What is 10 + 20
            Expected Output: 30 (Thirty)
        `,
      },
    ],
  });

  console.log(`Answer from OpenAI:`, response.choices[0].message.content);
};

main();
