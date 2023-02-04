const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
    const browser = await puppeteer.launch();
    const width = 1280;
    const height = 720;
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
    // Wait to complete load
    await page.waitForSelector('body');
    // Get the height of the rendered page
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log("Page height: ", pageHeight);
    // Start recording
    await recorder.start('./simple.mp4'); // supports extension - mp4, avi, webm and mov
    // wait 3s
    await page.waitForTimeout(3000);

    // Smooth scroll to the bottom of the page
    let currentPosition = 0;
    while (currentPosition < pageHeight) {
        const nextPosition = Math.min(currentPosition + height / 60, pageHeight);
        await page.evaluate(_scrollTo => {
            window.scrollTo(0, _scrollTo);
        }, nextPosition);
        currentPosition = nextPosition;
        await page.waitForTimeout(30);
    }

    await recorder.stop();
    await browser.close();
})();
