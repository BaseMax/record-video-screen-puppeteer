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
    await page.setViewport({ width, height });
    await page._client.send('Emulation.clearDeviceMetricsOverride');
    await page._client.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: zoom,
        mobile: false,
        fitWindow: false,
    });

    const recorder = new PuppeteerScreenRecorder(page);
    await recorder.start('./simple.mp4'); // supports extension - mp4, avi, webm and mov
    await page.goto('https://google.com');

    await page.goto('https://asrez.ir');
    await recorder.stop();
    await browser.close();
})();
