const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
    const browser = await puppeteer.launch();
    const width = 1280;
    const height = 720;
    const zoom = 1;

    const browserWSEndpoint = browser.wsEndpoint();
    const browserContext = await browser.createIncognitoBrowserContext();
    const page = await browserContext.newPage();
    // const session = await page.target().createCDPSession();
    await page.setViewport({ width, height, zoom });

    const recorder = new PuppeteerScreenRecorder(page);
    await recorder.start('./simple.mp4'); // supports extension - mp4, avi, webm and mov
    await page.goto('https://google.com');

    await page.goto('https://asrez.ir');

    // Auto-scroll after every 2s
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
            }, 2000);
            setTimeout(() => {
                clearInterval(timer);
                resolve();
            }, 5000);
        });
    });
    await page.waitFor(5000);

    await recorder.stop();
    await browser.close();
})();
