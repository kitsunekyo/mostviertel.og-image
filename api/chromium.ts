import chromium from "chrome-aws-lambda";
import playwright from "playwright-core";

let _page: playwright.Page | null;

const customChromePath = process.env.OG_CHROMIUM_EXECUTABLE_PATH;
const chromiumExecutablePath = customChromePath
  ? customChromePath
  : process.platform === "win32"
  ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
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
    return _page;
  }
  const options = await getOptions(isDev);
  const browser = await playwright.chromium.launch(options);
  _page = await browser.newPage();
  return _page;
}

export async function getScreenshot(html: string, isDev = false) {
  const page = await getPage(isDev);
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(html);
  const file = await page.screenshot({ type: "png" });
  return file;
}
