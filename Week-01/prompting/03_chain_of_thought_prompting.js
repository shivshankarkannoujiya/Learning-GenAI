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

const main = async (prompt = "") => {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },

      // TODO: Manualy add the assistant and as the LLM is stateless
      {
        role: "assistant",
        content: JSON.stringify({
          step: "INITIAL",
          text: "The user wants me to solve a maths equation.",
        }),
      },
      {
        role: "assistant",
        content: JSON.stringify({
          step: "THINK",
          text: "I will use the BODMAS formula and based on that I should first perform the multiplication, which is 3 * 5, giving 15.",
        }),
      },
      {
        role: "assistant",
        content: JSON.stringify({
          step: "ANALYSE",
          text: "Yes, the BODMAS rule is indeed correct, and now the equation becomes 4 + 6 + 9 - 15.",
        }),
      },
      {
        role: "assistant",
        content: JSON.stringify({
          step: "THINK",
          text: "Now, I should perform the addition operations first, which are 4 + 6 + 9. This gives us 19.",
        }),
      },
      {
        role: "assistant",
        content: JSON.stringify({
          step: "ANALYSE",
          text: "Indeed, adding these values results in 19. Now the equation we need to solve is 19 - 15.",
        }),
      },
      {
        role: "assistant",
        content: JSON.stringify({
          step: "THINK",
          text: "Now it's simple subtraction; I simply need to calculate 19 - 15.",
        }),
      },
      {
        role: "assistant",
        content: JSON.stringify({
          step: "ANALYSE",
          text: "After performing the subtraction, the result is 4.",
        }),
      },
    ],
  });

  console.log(`Answer from OpenAI:`, response.choices[0].message.content);
};

main("What is 4 + 6 + 9 - 3 * 5");
