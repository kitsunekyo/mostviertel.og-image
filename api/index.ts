import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "fs";

// const isDev = !process.env.AWS_REGION;
// const isHtmlDebug = process.env.OG_HTML_DEBUG === "1";
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
  * {
    box-sizing: border-box;
  }
  body {
    position: relative;
    margin: 0;
    padding: 0;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: PlusJakartaSans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  .border {
    position: absolute;
    height: 10px;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom right, #f97316, #f59e0b)
  }
  h1 {
    line-height: 1;
    margin: 0;
  }
  .excerpt {
    max-width: 500px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.6;
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  ul, li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .tags {
    display: flex;
    gap: 4px;
    align-items: center;
    flex-wrap: wrap;
  }
  .tag {
    background-color: rgb(243 244 246);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1;
    color: #666;
  }
`;

function toArray(input: string[] | string): string[] {
  if (Array.isArray(input)) return input;
  return [...input];
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
        <div>
          <h1>${title}</h1>
          ${excerpt ? `<p class="excerpt">${excerpt}</p>` : ""}
          <p>${createdAt}</p>
          <ul class="tags">
            ${toArray(tags)
              .map((tag) => `<li class="tag">${tag}</li>`)
              .join(" ")}
          </ul>
        </div>
        <div class="border" />
      </body>
      </html>`;

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    // res.setHeader("Content-Type", "text/html");
    return res.end(html);
    // return res.end("hello world");

    /**
     * receive req: blog metadata
     * title
     * tags
     * createdAt
     *
     * generate html with og image content
     * pass to puppeteer
     * make screenshot
     * respond with screenshot image + cache
     */

    // const parsedReq = parseRequest(req);
    // const html = getHtml(parsedReq);
    // if (isHtmlDebug) {
    //   res.end(html);
    //   return;
    // }
    // const { fileType } = parsedReq;
    // const file = await getScreenshot(html, fileType, isDev);
    // res.setHeader("Content-Type", `image/${fileType}`);
    // res.setHeader(
    //   "Cache-Control",
    //   `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
    // );
    // res.end(file);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>Internal Error</h1><p>Sorry, there was a problem</p>");
    console.error(e);
  }
}
