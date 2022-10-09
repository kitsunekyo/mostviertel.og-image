import chromium from "chrome-aws-lambda";
import playwright from "playwright-core";

let _page: playwright.Page | null;

const chromiumExecutablePath =
  process.platform === "win32"
    ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "linux"
    ? "/usr/bin/google-chrome"
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function getOptions(isDev: boolean) {
  let options: {
    args: string[];
    executablePath: string;
    headless: boolean;
  };
  if (isDev) {
    options = {
      args: [],
      executablePath: chromiumExecutablePath,
      headless: true,
    };
  } else {
    options = {
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    };
  }
  return options;
}

async function getPage(isDev: boolean) {
  if (_page) {
    console.log("chromium: reusing page");
    return _page;
  }
  const options = await getOptions(isDev);
  console.log("chromium: options received");
  const browser = await playwright.chromium.launch(options);
  console.log("chromium: browser launched");
  _page = await browser.newPage();
  console.log("chromium: new page created");
  return _page;
}

export async function getScreenshot(html: string, isDev = false) {
  const page = await getPage(isDev);
  console.log("chromium: page received");
  await page.setViewportSize({ width: 1200, height: 630 });
  console.log("chromium: viewport set");
  await page.setContent(html);
  console.log("chromium: content set");
  const file = await page.screenshot({ type: "png" });
  console.log("chromium: screenshot done");
  return file;
}
