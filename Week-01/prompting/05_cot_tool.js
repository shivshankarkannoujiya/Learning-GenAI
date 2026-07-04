import { OpenAI } from "openai";
import dotenv from "dotenv";
import { getWeather, executeCommandOnCli } from "./tools/cot_tools.js";

dotenv.config({
  path: "./.env",
});

const API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: API_KEY,
});

const SYSTEM_PROMPT = `
    You are an expert AI Engineer. You have to analyze the user's input carefully and then you need to break down the problem into multiple sub problmes before comming on to the final result. Always breakdown the user intention and how to solve that problme and then step by step solve it.

    We are going to follow a pipeline of "INITIAL", "THINK", "TOOL_REQUEST", "ANALYSE", and "OUTPUT" pipeline.

    The Pipeline:
    - "INITIAL" When user give an input, we will have an initial thought process on what this user is trying to do.
    - "THINK" This is where we are going to think about how to solve this and then start to breakdown the problem.
    - "ANALYSE" This is where we will analyze and also verify if the output is correct.
    - "THINK" We can go back to think mode where we now see if any sub problem remains and think.
    - "ANALYSE" Again analyze the problem and get onto a solution.
    - "TOOL_REQUEST" Use this for calling or requesting a tool. The format of output would be {"step": "TOOL_REQUEST", "functionName": "getWeather", "input": "Goa", "text": "Calling getWeather tool for Goa",}
    - "OUTPUT" This is where we can end the and give the final output to the user.

    AVAILABLE_TOOLS:
    - "getWeather": getWeather(city: string): Returns the realtime weather information of city. 
    - executeCommandOnCli: executeCommandOnCli(command: string): Executes the commands on the user device and return output from stdout.

    RULES:
      - Always output exactly one step at a time.
      - Always maintain the pipeline sequence: INITIAL → THINK → ANALYSE → TOOL_REQUEST (if needed) → THINK → ANALYSE → ... → OUTPUT.
      - A task may require zero, one, or multiple TOOL_REQUEST steps.
      - After every TOOL_OUTPUT, continue reasoning from where you left off instead of restarting.
      - If additional information or actions are required, request the next appropriate tool.
      - Never jump to OUTPUT until every required tool has been executed and all sub-problems have been solved.
      - Verify the result after every tool execution before deciding the next step.
      - Only produce OUTPUT when the entire user request has been fully completed.
      - Always follow the JSON output format strictly.
      - Never output plain text outside the JSON object.
      - When requesting a tool, always use this format:
        {
          "step": "TOOL_REQUEST",
          "text": "<Why this tool is being called>",
          "functionName": "<Tool Name>",
          "input": "<Tool Input>"
        }
      - Never assume the result of a tool. Wait for the TOOL_OUTPUT before continuing your reasoning.
      - If a previous TOOL_OUTPUT is insufficient, request another tool instead of guessing.

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


    Example:
    - "User": "What is weather of Goa"
    OUTPUT:
    - "INITIAL": "The user want me to fetch weather information of Goa."
    - "THINK": "From the tools i can see we have a tool getWeather which can be called to get weather information of the Goa."
    - "ANALYSE": "Well, we are going right we can call getWeather function with "Goa" as input"
    - "TOOL_REQUEST": {"functionName": "getWeather", "input": "Goa"}
    - "TOOL_REQUEST_OUTPUT": "The weather of Goa is sunny with 30 degree celcius".
    - "THINK": "We got the weather information."
    - "OUTPUT": "The weather of Goa is sunny with 30 degree celcius. its gonna be hot"

    Output Format:
    {"step": "INITIAL" | "THINK" | "ANALYSE" | "OUTPUT", "text": "<The Actual Text>" | "functionName": "<Name of function>", "input": "Input Params of function" }

`;

const MESSAGE_DB = [{ role: "system", content: SYSTEM_PROMPT }];

const main = async (prompt = "") => {
  MESSAGE_DB.push({ role: "user", content: prompt });

  while (true) {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: MESSAGE_DB,
    });

    const rawResult = response.choices[0].message.content;
    const parsedResult = JSON.parse(rawResult);

    MESSAGE_DB.push({ role: "assistant", content: rawResult });
    console.log(`🐬 ${parsedResult.step}: ${parsedResult.text}`);

    if (parsedResult.step.toLowerCase() === "output") break;

    if (parsedResult.step.toLowerCase() === "tool_request") {
      const { functionName, input } = parsedResult;
      switch (functionName) {
        case "executeCommandOnCli": {
          try {
            console.log("➡️ Calling tool:", functionName, input);
            const toolResult = await executeCommandOnCli(input);
            console.log("✅ Tool returned:", toolResult);
            console.log(`🔨 ${functionName}: ${input}`, toolResult);
            MESSAGE_DB.push({
              role: "developer",
              content: JSON.stringify({
                step: "TOOL_OUTPUT",
                output: toolResult,
              }),
            });
            continue;
          } catch (error) {
            console.error(`Error executing ${functionName}:`, error);
            MESSAGE_DB.push({
              role: "tool",
              content: JSON.stringify({
                step: "TOOL_OUTPUT",
                tool: functionName,
                error:
                  error instanceof Error
                    ? error.message
                    : "Unknown tool execution error",
              }),
            });

            continue;
          }
        }

        case "getWeather": {
          try {
            console.log("➡️ Calling tool:", functionName, input);
            const toolResult = await getWeather(input);
            console.log("✅ Tool returned:", toolResult);
            console.log(`🔨 ${functionName}: ${input}`, toolResult);
            MESSAGE_DB.push({
              role: "developer",
              content: JSON.stringify({
                step: "TOOL_OUTPUT",
                output: toolResult,
              }),
            });
            continue;
          } catch (error) {
            console.error(`Error executing ${functionName}:`, error);
            MESSAGE_DB.push({
              role: "tool",
              content: JSON.stringify({
                step: "TOOL_OUTPUT",
                tool: functionName,
                error:
                  error instanceof Error
                    ? error.message
                    : "Unknown tool execution error",
              }),
            });

            continue;
          }
        }

        default: {
          console.error(`Unknown tool requested: ${functionName}`);
          MESSAGE_DB.push({
            role: "tool",
            content: JSON.stringify({
              step: "TOOL_OUTPUT",
              tool: functionName,
              error: `Unknown tool: ${functionName}`,
            }),
          });

          continue;
        }
      }
    }
  }
};

main(
  "What is weather of mumbai, mathura, Gorakhpur, give the output in weather.txt file",
);
