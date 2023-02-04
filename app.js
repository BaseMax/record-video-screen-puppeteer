const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
    const browser = await puppeteer.launch();
    const width = 1372;
    const height = 819;
    const scale = 1;

    const browserWSEndpoint = browser.wsEndpoint();
    const browserContext = await browser.createIncognitoBrowserContext();
    const page = await browserContext.newPage();
    await page.setViewport({
        width: width,
        height: height,
        deviceScaleFactor: scale
    });

    const recorder = new PuppeteerScreenRecorder(page);
    // await page.goto('https://asrez.ir');
    await page.goto('https://digikala.com');
    // wait 2s
    await page.waitForTimeout(2000);
    // Wait to complete load
    await page.waitForSelector('body');
    // wait 1s
    await page.waitForTimeout(1000);
    // Get the height of the rendered page
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log("Page height: ", pageHeight);
    // Start recording
    await recorder.start('./simple.mp4'); // supports extension - mp4, avi, webm and mov

    // Smooth scroll to the bottom of the page
    let currentPosition = 0;
    while (currentPosition < pageHeight) {
        const nextPosition = Math.min(currentPosition + height / 40, pageHeight);
        await page.evaluate(_scrollTo => {
            window.scrollTo(0, _scrollTo);
        }, nextPosition);
        currentPosition = nextPosition;
        await page.waitForTimeout(30);
    }

    await recorder.stop();
    await browser.close();
})();
