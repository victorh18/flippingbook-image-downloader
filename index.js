import { JSDOM } from "jsdom";
import fs from 'node:fs/promises'
import fsSync from 'node:fs'

let loadingProgress = 0;
let pageNumberDownloaded = 0;
let pagesToDownload = 0;

const loadingSpinner = {
    0: '⠋',
    1: '⠙',
    2: '⠹',
    3: `⠸`,
    4: '⠼',
    5: '⠴',
    6: '⠦',
    7: '⠧',
    8: `⠇`,
    9: '⠏',
}

const BASE_URL = 'https://hgpdvol1.academiadominicanahistoria.org.do//files/assets/common/'


process.stdout.write('\x1Bc');

// hides cursor
process.stderr.write('\x1B[?25l');

const intervalValue = setInterval(() => {
    loadingProgress++;
    const padding = 4;
    const repeatDots = Math.round(loadingProgress / 10) % padding;
 
    const statusText = pagesToDownload ? `Downloading page ${pageNumberDownloaded} of ${pagesToDownload}         \r\n` : 'Calculating pages to download...\r\n'

    process.stdout.moveCursor(0, -2)
    process.stdout.write(` ${loadingSpinner[loadingProgress % 10]} Loading${'.'.repeat(repeatDots).padEnd(padding, ' ')}\r\n`);
    process.stdout.write(` ${statusText}`);
}, 80)

const getPageUrl = (pageNumber, textLayer) => {
    if (textLayer)
        return BASE_URL + `page-textlayers/page${`${pageNumber}`.padStart(4, '0')}_c.png`;

    return BASE_URL + `page-html5-substrates/page${`${pageNumber}`.padStart(4, '0')}.jpg`;
}

const getDownloadUrls = (pagerResponse) => {
    const { pages } = pagerResponse;

    const urls = [];

    pagesToDownload = Object.keys(pages).length;

    for (const pageNumber in pages) {
        if (Object.hasOwnProperty.call(pages, pageNumber)) {
            const pageMetada = pages[pageNumber];

            urls.push(getPageUrl(pageNumber, pageMetada?.textLayer))
        }
    }
    
    //console.log(urls);
    downloadFiles(urls);
    
}

const downloadFiles = async (urls) => {
    if (!fsSync.existsSync('./pages'))
        await fs.mkdir('./pages');

    for (const url of urls) {
        const urlParts = url.split('/')
        const pageName = urlParts[urlParts.length - 1].replace('_c', "")
        const response = await fetch(url);
        const image = await response.arrayBuffer();

        fs.appendFile(`./pages/${pageName}`, Buffer.from(image));
        pageNumberDownloaded++;
    }
    clearInterval(intervalValue);
    console.log(' Done!')
}

fetch('https://hgpdvol1.academiadominicanahistoria.org.do//files/assets/common/pager.js')
    .then(response => response.json()
    .then(data => getDownloadUrls(data)));




