import { Config, Handler } from "@netlify/functions";
import chromium from "@sparticuz/chromium";
import puppeteer, { Browser, Page } from "puppeteer-core";

const handler: Handler = async (event) => {
  const urlToScrape = event.queryStringParameters!.url;
  console.log("urlToScrape", urlToScrape);

  if (!urlToScrape)
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "url param was not provided",
      }),
    };

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath()),
    headless: true,
    devtools: false,
  });

  const page = await browser.newPage();

  await page.goto(urlToScrape);

  const [buttonElement] = await page!.$x("//button[contains(., 'Accept all')]");

  if (buttonElement) {
    await (buttonElement as any).click();
  } else {
    console.warn("No button found");
  }

  console.info("Scraping Google lens");

  const imageMatchesContainer = await page!.waitForSelector(
    'div[class="g8gdQd"]',
    {
      timeout: 3000,
    }
  );

  if (!imageMatchesContainer) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No matches container was found while scaping",
      }),
    };
  }

  const divSelector = "div[data-action-url]";
  const urls = await imageMatchesContainer?.$$eval(divSelector, (links) => {
    return links
      .map((link) => ({
        url: link.getAttribute("data-action-url"),
        image: link.getAttribute("data-thumbnail-url"),
        description: link.getAttribute("data-item-title"),
      }))
      .filter((product) => Object.values(product).every(Boolean));
  });

  await browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify(urls),
  };
};

export const config: Config = {
  path: "/upload/?url=:url",
  method: "GET",
};

export { handler };
