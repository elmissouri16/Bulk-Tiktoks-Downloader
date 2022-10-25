const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth")();
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const fetch = require("node-fetch");
const fs = require('fs');
const https = require('https');


["chrome.runtime", "navigator.languages"].forEach(a =>
  stealthPlugin.enabledEvasions.delete(a)
);

puppeteer.use(stealthPlugin);
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

main();
async function main() {
  const browser = await puppeteer.launch( { headless: true } );
  const page = await browser.newPage();
    page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36")
  
   //delete browser profile after finish
  let chromeTmpDataDir = null;
  let chromeSpawnArgs = browser.process().spawnargs;
  for (let i = 0; i < chromeSpawnArgs.length; i++) {
      if (chromeSpawnArgs[i].indexOf("--user-data-dir=") === 0) {
          chromeTmpDataDir = chromeSpawnArgs[i].replace("--user-data-dir=", "");
      }
  }

  await page.evaluateOnNewDocument(() => {
    delete navigator.__proto__.webdriver;
  });
  //We stop images and stylesheet to save data
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    if(['image', 'stylesheet', 'font'].includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  })
const args = process.argv.slice(2)
const userLink = args[0]
const nVideos = parseInt(args[1])

  await page.goto(userLink); //Change this to user url page
  let username = page.url().slice(23,).replace(/[-:.\/*<>|?]/g,"");

  //Scroll down until no more videos
  await autoScroll(page);

  const urls = await page.evaluate(() => 
    Array.from(document.querySelectorAll('div.tiktok-1qb12g8-DivThreeColumnContainer > div > div > div > div > div > a'), element => element.href));

  var videoDes = await page.evaluate(() =>Array.from(document.querySelectorAll('div.tiktok-1qb12g8-DivThreeColumnContainer.eegew6e2 > div > div > div > a')).map((items) => items.innerText))
    
    for (var i=videoDes.length; i--;) {
      videoDes[i] = videoDes[i] + ' #shorts' + "\r\n" ;}; //Append #shorts for each video title
      
      fs.appendFile('names.txt', videoDes + '', function (err) {
        if (err) throw err;
        console.log('Descriptions Saved!');
      });
   //get snaptik token
    const snaptoken = await getSnapToken()
      // If no. of videos that need to be downloaded is less than total videos
      // then download nVideos
      if(nVideos<urls.length)
        console.log('Now Downloading ' +nVideos+ ' Video(s)' ) 
      // Else if total videos is less than the given number, than download all videos
      else
        console.log('Now Downloading ' +urls.length+ ' Video(s)' ) 
      //Loop on snaptik for no watermark tiktok videos
      //Be careful that can be alot of GBs if the profile has a lot of videos
    for (var i=0;i<urls.length && i<nVideos;i++) //You can limit number of videos by replace url.length by number
    {
      function getRandomNumber() {
        var random = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
         return random;
       };
    await page.waitForTimeout(getRandomNumber());
       page.once('dialog', async function(dialog) {
         await dialog.accept();
     });
       await page.waitForTimeout(getRandomNumber())
       await page.goto('https://snaptik.app/abc.php?url='+(urls[i])+'&lang=en&token='+snaptoken,{waitUntil: 'domcontentloaded'});
       await page.waitForTimeout(getRandomNumber())
       //await page.waitForSelector('input[name="url"]');
       //await page.type('input[name="url"]' , (urls[i]) , {delay: 100} );
       let link = (urls[i]).slice(-19)
       const body = await page.content()
       const token = body.toString().match(/href=\\"[^"]*"/i)[0].split(".")
     // Wait for 5 seconds
     const decode = await Buffer.from(token[3], 'base64').toString('ascii').split('"')
     const content = decodeURIComponent(decode[3])
    


    
     // Link to file you want to download
     const path = './'+username+'/'; // Location to save videos
     try {
       if (!fs.existsSync(path)) {
         fs.mkdirSync(path)
       }
     } catch (err) {
       console.error(err)
     }
    const request = https.get(content, function(response) {
        if (response.statusCode === 200) {
            var file = fs.createWriteStream(path+link+'.mp4');
            response.pipe(file);
            console.log(file.path + ' Saved!')

            fs.appendFile('names.txt',file.path +  "\r\n" , function (err) {
            if (err) throw err;
            console.log('Done');
            });
        }

        request.setTimeout(90000, function() { // if after 60s file not downlaoded, we abort a request 
            request.destroy();
            console.log('Cant download at video'+urls[i]);
    });
    });
    ;};

  
    browser.close();
      if (chromeTmpDataDir !== null) {
      fs.rm(chromeTmpDataDir, { recursive: true }, () => console.log('Deleted tmp profile'));
    }
  }

async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}

async function getSnapToken(){
  var url = 'https://snaptik.app/en'
  const request = await fetch(url, {
      method: "GET"
  });
  const res = await request.text()
  const snaptiktoken = res.toString().match(/<input name="token" value="[^"]*"/g).toString().split('"')[3];
  return snaptiktoken
}