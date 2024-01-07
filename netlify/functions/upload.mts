import { Handler } from "@netlify/functions";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const handler: Handler = async (event, context) => {
  console.log("await chromium.executablePath", await chromium.executablePath());
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
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
