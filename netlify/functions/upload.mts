import { Handler } from "@netlify/functions";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

const handler: Handler = async (event, context) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath),
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto("https://www.rohlik.cz/vitejte");

  const element = await page.$('[data-test="welcome-hero-logo"]');
  const title = await page.title();
  if (element) {
    console.log("element found");
  }

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: title }),
  };
};

export { handler };
