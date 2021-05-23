var args = process.argv.slice(2);
const username = args[0]
const password = args[1]
const headless = (args[2].toLowerCase() == 'true')
const fileOutput = (args[3].toLowerCase() == 'true')
const textOutput = (args[4].toLowerCase() == 'true')
args = args.slice(5);


var fs = require("fs");
const puppeteer = require('puppeteer-extra')
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

puppeteer.use(require('puppeteer-extra-plugin-user-preferences')({userPrefs: {download: {prompt_for_download: false, open_pdf_in_system_reader: true, default_directory: process.cwd(),},plugins: {always_open_pdf_externally: true},}}));

const download = require('download-chromium');
const os = require('os');

const url = require('url');
const fsPromises = fs.promises;
var Emitter  = require('pattern-emitter');
var pageEmitter = new Emitter();
async function saveCookies(page){
    const cookies = await page.cookies();
    await fsPromises.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
}

async function loadCookies(page){
    await fs.exists('./cookies.json', async function(exists) { 
        if (exists) {
            const cookiesString = await fsPromises.readFile('./cookies.json');
            const cookies = JSON.parse(cookiesString);
            await page.setCookie(...cookies);
        } 
    }); 
}

var pngImg1x1;
fs.readFile("1x1.png", function (err, data) {
    if (err) throw err;
    pngImg1x1 = data;
});
async function applyEvents(page){
    await loadCookies(page);

    await page.setRequestInterception(true);
	page.on('request', async (interceptedRequest) => {
		if (interceptedRequest.resourceType() == 'image'){
            interceptedRequest.respond({body: pngImg1x1});
		}else interceptedRequest.continue();
	});

    page.on('load', () => {
        parsedUrl = url.parse(page.url())
        eventUrl = parsedUrl.host+parsedUrl.path
        if (eventUrl.slice(-1) == '/') 
            eventUrl = eventUrl.slice(0,-1)

        pageEmitter.emit(eventUrl, page, parsedUrl)
    });

    pageEmitter.on('close-app', async() => {
        await page.waitForTimeout(2.5 * 1000);
        await page.browser().close();
    })
}
 
(async () => {
    const tmp = os.tmpdir();
    const exec = await download({
    revision: 818858,
    installPath: `${tmp}/.local-chromium`})

    const browser = await puppeteer.launch({executablePath: exec, headless: headless, devtools: false, args: ['--app=http://example.com']});

    browser.on('targetcreated', async(target) => {
        console.log(`Created target type ${target.type()} url ${target.url()}`);
        if (target.type() !== 'page') {
            return;
        } else {
            var page = await target.page();
        }
        await applyEvents(page);
    });

    const page = await browser.newPage();
    a = await browser.pages()
    a[0].close()
    //await createFile()
    await page.goto('https://en.wikipedia.org/wiki/Website')
    //pageEmitter.emit('close-app')
})();


pageEmitter.on(/.*/, async (page, parsedUrl) => {
    await saveCookies(page);
    console.log(parsedUrl)
})

const moment = require ('moment');
var unixTiemstamp = moment().unix();
DATA_FILE = unixTiemstamp+'-data.csv'
async function createFile(){
    if(fileOutput)
        await fsPromises.writeFile(DATA_FILE, 'D&H_Number, Product_Title, HTML_Data'+'\n');
}

async function appendData(data){
    if(textOutput)
        console.log(data)
    if(fileOutput)
        await fsPromises.appendFile(DATA_FILE, data)
}

