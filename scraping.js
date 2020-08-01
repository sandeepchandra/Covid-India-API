const request = require("request-promise");
const $ = require("cheerio");
const puppeteer = require('puppeteer');
const http = require('http');

url = 'https://www.mohfw.gov.in/';

async function fetchTableData(url)
{
    const browser = await puppeteer.launch({
        headless:true
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' })
    page.click('a.open-table');
    return page;
}


async function getPageContent(page) {
    
    let html = await page.evaluate(() => document.body.innerHTML);
    //console.log(html)

    const Corona_Cases = [];

    $("#state-data > div > div > div > div > table > tbody > tr", html).each((index, element) => {
        
        const tds = $(element).find("td");

        if (index === 35 )
        {
            const id = 36;

            const state = "INDIA";

            const Active_Cases = Number($(tds[1]).text().trim());

            const Cured = Number($(tds[3]).text().trim());

            const Deaths = Number($(tds[5]).text().trim());

            const Total_Corona_Cases = Active_Cases + Cured + Deaths;
        
            const Co_tableRow = {id, state, Active_Cases, Cured, Deaths, Total_Corona_Cases};
            Corona_Cases.push(Co_tableRow);

        }
        else if(index > 35)
        {
            return;
        }
        else
        {
            const id = Number($(tds[0]).text().trim());

            const state = $(tds[1]).text().trim();
    
            const Active_Cases = Number($(tds[2]).text().trim());
    
            const Cured = Number($(tds[4]).text().trim());
    
            const Deaths = Number($(tds[6]).text().trim());

            const Total_Corona_Cases = Active_Cases + Cured + Deaths;
        
            const Co_tableRow = {id, state, Active_Cases, Cured, Deaths, Total_Corona_Cases};
            Corona_Cases.push(Co_tableRow);

        }

    });

    // console.log("Got the Data. Now you can go to http://localhost:8080 link to get the data");

    // http.createServer(function (req, res) {
    //     res.writeHead(200, {'Content-Type': 'application/json'});
    //     res.end(JSON.stringify(Corona_Cases));
    // }).listen(8080);

    const port = process.env.PORT || 3000

    const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(Corona_Cases));
    });

    server.listen(port,() => {
    console.log(`Server running at port http://localhost:`+port);
    });
}

async function monitor() {
    let page = await fetchTableData(url);
    await getPageContent(page);
}

monitor();
