import axios from "axios";
import { exec } from "child_process";

export const getWeather = async (city) => {
  try {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;

    const response = await axios.get(url, {
      responseType: "text",
      timeout: 10000,
    });

    if (
      !response.data ||
      response.data.includes("Weather data source not available")
    ) {
      throw new Error("Weather service unavailable.");
    }

    return JSON.stringify({
      city,
      weatherInfo: response.data,
    });
  } catch (err) {
    return JSON.stringify({
      city,
      error: "Unable to fetch weather.",
    });
  }
};

export const executeCommandOnCli = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, output) => {
      if (error) {
        return resolve(`There was an error ${error}`);
      } else {
        return resolve(output);
      }
    });
  });
};
