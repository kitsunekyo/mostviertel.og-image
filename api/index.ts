import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "fs";
import puppeteer from "puppeteer";

const isDev = !process.env.AWS_REGION;

const rglr = readFileSync(
  `${__dirname}/fonts/PlusJakartaSans/PlusJakartaSans-Regular.woff2`
).toString("base64");
const bold = readFileSync(
  `${__dirname}/fonts/PlusJakartaSans/PlusJakartaSans-Bold.woff2`
).toString("base64");

const css = `
  @font-face {
    font-family: 'PlusJakartaSans';
    font-style:  normal;
    font-weight: normal;
    src: url(data:font/woff2;charset=utf-8;base64,${rglr}) format('woff2');
  }
  @font-face {
    font-family: 'PlusJakartaSans';
    font-style:  normal;
    font-weight: bold;
    src: url(data:font/woff2;charset=utf-8;base64,${bold}) format('woff2');
  }
  :root {
    --space: 60px;
    --font-base: 36px;
    --font-xl: 60px;
    --text-secondary: #888;
  }
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 0;
    height: 100vh;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    flex-direction: column;
    font-family: PlusJakartaSans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    overflow: hidden;
  }
  .footer {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .footer-content {
    font-weight: bold;
    font-size: 28px;
    padding: 20px var(--space);
    text-align: right;
  }
  .border {
    height: 20px;
    background: linear-gradient(to bottom right, #f97316, #f59e0b);
  }
  .container {
    padding: 0 var(--space);
  }
  h1 {
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: var(--font-xl);
    margin: 0 0 .5em 0;
  }
  .excerpt {
    font-size: var(--font-base);
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.6;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  ul, li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .flex {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2rem;
  }
  .date {
    font-size: var(--font-base);
    color: var(--text-secondary);
  }
  .tags {
    font-size: var(--font-base);
    line-height: 1;
    color: var(--text-secondary);
    display: flex;
    gap: .5em;
    align-items: center;
    flex-wrap: wrap;
  }
  .tag {
    background-color: rgb(243 244 246);
    padding: .35em .5em;
    border-radius: .5em;
  }
`;

function toArray(input: string[] | string): string[] {
  if (Array.isArray(input)) return input;
  return [...input];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { title, excerpt, tags, createdAt } = req.query;
    if (Array.isArray(title)) {
      throw new Error("title must be a single value");
    }
    if (Array.isArray(createdAt)) {
      throw new Error("createdAt must be a single value");
    }
    if (Array.isArray(excerpt)) {
      throw new Error("excerpt must be a single value");
    }

    const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OG Image</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="container">
          <h1>${title}</h1>
          <div class="flex">
            <ul class="tags">
              ${toArray(tags)
                .map((tag) => `<li class="tag">${tag}</li>`)
                .join(" ")}
            </ul>
            <span class="date">${formatDate(createdAt)}</span>
          </div>
        </div>
        <div class="footer">
          <div class="footer-content">
            mostviertel.tech
          </div>
          <div class="border">&nbsp;</div>
        </div>
      </body>
      </html>`;

    if (isDev) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      return res.end(html);
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });
    await page.setContent(html);
    const file = await page.screenshot({ type: "png" });
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    return res.end(file);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>Internal Error</h1><p>Sorry, there was a problem</p>");
    console.error(e);
  }
}
