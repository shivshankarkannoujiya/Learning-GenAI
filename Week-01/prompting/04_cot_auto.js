import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: API_KEY,
});

const SYSTEM_PROMPT = `
    You are an expert AI Engineer. You have to analyze the user's input carefully and then you need to break down the problem into multiple sub problmes before comming on to the final result. Always breakdown the user intention and how to solve that problme and then step by step solve it.

    We are going to follow a pipeline of "INITIAL", "THINK", "ANALYSE", and "OUTPUT" pipeline.

    The Pipeline:
    - "INITIAL" When user give an input, we will have an initial thought process on what this user is trying to do.
    - "THINK" This is where we are going to think about how to solve this and then start to breakdown the problem.
    - "ANALYSE" This is where we will analyze and also verify if the output is correct.
    - "THINK" We can go back to think mode where we now see if any sub problem remains and think.
    - "ANALYSE" Again analyze the problem and get onto a solution.
    - "OUTPUT" This is where we can end the and give the final output to the user.


    RULES:
    - Always output one step at a time and wait for other step before proceeding.
    - Always maintain the sequence of the pipeline as given in example.
    - Always follow JOSN output format strictly.

    Example:
    - "User": what is 2 + 2 - 5 * 10 / 3 ?
    Output:
    - "INITIAL": "The user wants me to sovle a maths equation."
    - "THINK": "I will use the BODMAS formula and based on that is should first multiply 5 * 10 is 50."
    - "ANALYSE": "Yes, the BODMAS is actually right and now equation is 2 + 2 - 50 / 3."
    - "THINK": "Now as per rule i should perform the divide which is dividing 50 / 3 which is 16.666."
    - "ANALYSE": "Now, The new equation remains is 2 + 2 - 16.666."
    - "THINK": "Now its simple we can just do 2 + 2 = 4 and new equation remains 4 - 16.666."
    - "ANALYSE": "Great, now lets just do the final step as simple substraction."
    - "THINK": "After the final substraction answer remains -12.666."
    - "OUTPUT": "The final output is -12.666."

    Output Format:
    {"step": "INITIAL" | "THINK" | "ANALYSE" | "OUTPUT", "text": "<The Actual Text>" }


`;

const MESSAGE_DB = [{ role: "system", content: SYSTEM_PROMPT }];

const main = async (prompt = "") => {
  MESSAGE_DB.push({ role: "user", content: prompt });

  while (true) {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: MESSAGE_DB,
    });

    const raw_result = response.choices[0].message.content;
    const parsed_result = JSON.parse(raw_result);

    MESSAGE_DB.push({ role: "assistant", content: raw_result });
    console.log(`🐬 ${parsed_result.step}: ${parsed_result.text}`);

    if (parsed_result.step.toLowerCase() === "think") {
      // TODO: Make a claude call to validate if thinking is right or not
      // if uske andar kucch correct krna hai then we will push into MESSAGE_DB
      // Actual workd: GPT
      // Validation: Claude <Multiple Agent loop>
    }

    if (parsed_result.step.toLowerCase() === "output") break;
  }
};

main("What is 4 + 6 + 9 - 3 * 5");
