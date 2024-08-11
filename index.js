import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import 'dotenv/config'

const { IMAGES_FOLDER, BASE_URL } = process.env;
// Validate .env before executing
// Check if folder is really a folder

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


if (!IMAGES_FOLDER) {
    console.error("A valid folder was not provided, cancelling extraction...")
    process.exit();
}

if (!BASE_URL) {
    console.error("A download URL was not provided, cancelling extraction...")
    process.exit();
}

const ROUTE_PREFIX = '//files/assets/common/';

const PAGER_URL = `${BASE_URL}${ROUTE_PREFIX}pager.js`;
const DOWNLOAD_PREFIX = `${BASE_URL}${ROUTE_PREFIX}`

const NORMAL_DOWNLOAD_SUFFIX = 'page-html5-substrates/page';
const NORMAL_DOWNLOAD_EXTENSION = '.jpg';

const TEXT_LAYER_DOWNLOAD_SUFFIX = 'page-textlayers/page';
const TEXT_LAYER_DONWLOAD_NAME_SUFFIX = '_c';
const TEXT_LAYER_DOWNLOAD_EXTENSION = `${TEXT_LAYER_DONWLOAD_NAME_SUFFIX}.png`;

const CLEAR_TERMINAL_CHAR = '\x1Bc';
const HIDE_CURSOR_CHAR = '\x1B[?25l';

process.stdout.write(CLEAR_TERMINAL_CHAR);
process.stderr.write(HIDE_CURSOR_CHAR);

const intervalValue = setInterval(() => {
    loadingProgress++;
    const padding = 4;
    const repeatDots = Math.round(loadingProgress / 10) % padding;
 
    const statusText = pagesToDownload ? 
        `Downloading page ${pageNumberDownloaded} of ${pagesToDownload}         \r\n` : 
        'Calculating pages to download...\r\n';

    const spinnerChar = loadingSpinner[loadingProgress % 10];
    const loadingMessage = `Loading${'.'.repeat(repeatDots).padEnd(padding, ' ')}`;

    process.stdout.moveCursor(0, -2)
    process.stdout.write(` ${spinnerChar} ${loadingMessage}\r\n`);
    process.stdout.write(` ${statusText}`);
}, 80);

const getPageUrl = (pageNumber, textLayer) => {
    const suffix = textLayer ?
        `${DOWNLOAD_PREFIX}${TEXT_LAYER_DOWNLOAD_SUFFIX}` :
        `${DOWNLOAD_PREFIX}${NORMAL_DOWNLOAD_SUFFIX}`;

    const fileName = textLayer ?
        `${`${pageNumber}`.padStart(4, '0')}${TEXT_LAYER_DOWNLOAD_EXTENSION}` :
        `${`${pageNumber}`.padStart(4, '0')}${NORMAL_DOWNLOAD_EXTENSION}`;

    return `${suffix}${fileName}`
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

    downloadFiles(urls);
}

const downloadFiles = async (urls) => {
    if (!fsSync.existsSync(IMAGES_FOLDER))
        await fs.mkdir(IMAGES_FOLDER);

    for (const url of urls) {
        const urlParts = url.split('/')
        const pageName = urlParts[urlParts.length - 1].replace(TEXT_LAYER_DONWLOAD_NAME_SUFFIX, "")
        const response = await fetch(url);
        const image = await response.arrayBuffer();

        fs.appendFile(`${IMAGES_FOLDER}/${pageName}`, Buffer.from(image));
        pageNumberDownloaded++;
    }
    clearInterval(intervalValue);
    console.log(' Done!')
}

fetch(PAGER_URL)
    .then(response => response.json()
    .then(data => getDownloadUrls(data)));
