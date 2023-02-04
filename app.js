const fs = require('fs');
const puppeteer = require('puppeteer');
const ffmpeg = require('fluent-ffmpeg');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
    const browser = await puppeteer.launch();
    const width = 1372;
    const height = 819;
    const scale = 1;
    const recordFile = "./simple.mp4";

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
    // A quick scroll to the bottom of the page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    // wait 1s
    await page.waitForTimeout(1000);
    // Again scroll to the top of the page
    await page.evaluate(() => window.scrollTo(0, 0));
    // wait 1s
    await page.waitForTimeout(1000);
    // Get the height of the rendered page
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log("Page height: ", pageHeight);
    // Start recording
    await recorder.start(recordFile); // supports extension - mp4, avi, webm and mov
    // wait 3s
    await page.waitForTimeout(3000);

    // Smooth scroll to the bottom of the page
    let currentPosition = 0;
    while (currentPosition < pageHeight) {
        const nextPosition = Math.min(currentPosition + height / 70, pageHeight);
        await page.evaluate(_scrollTo => {
            window.scrollTo(0, _scrollTo);
        }, nextPosition);
        currentPosition = nextPosition;
        await page.waitForTimeout(5);
    }

    // Detect if the page is same and CSS animation finished
    // TODO

    await recorder.stop();
    await browser.close();

    // Check `record_file` exists or not
    if (fs.existsSync(recordFile)) {
        console.log("Video file created successfully");
        // check file size is greater than 0
        const stats = fs.statSync(recordFile);
        const fileSizeInBytes = stats.size;
        if (fileSizeInBytes > 50) {
            console.log("Start to compress the video");
            // Run ffmpeg to compress the video
            // ffmpeg -i "1.mp4" -vcodec libx264 -crf 32 2.mp4
            const command = ffmpeg(recordFile)
                .videoCodec('libx264')
                .videoBitrate('1000k')
                .audioCodec('libmp3lame')
                .audioBitrate('128k')
                .outputOptions([
                    '-crf 32',
                    '-preset ultrafast',
                    '-movflags faststart'
                ])
                .on('error', function (err) {
                    console.log('An error occurred: ' + err.message);
                })
                .on('end', function () {
                    console.log('Processing finished!');
                })
                .save(recordFile.replace('.mp4', '-compressed.mp4'));
        }
        else {
            console.log("Video file size is less than 50 bytes");
        }
    } else {
        console.log("Video file not created");
    }
})();
