const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    
    await page.goto('http://localhost:5174');
    await page.waitForSelector('nav button');
    
    const tabs = await page.$$('nav button');
    if (tabs.length >= 5) {
      await tabs[4].click();
      console.log('Clicked Consult Tab');
    }

    await new Promise(r => setTimeout(r, 1000));
    
    const nameInput = await page.$('input[placeholder="예: 햇살이"]');
    if (nameInput) {
      await nameInput.type('테스트아이');
      const contentArea = await page.$('textarea');
      if (contentArea) await contentArea.type('이건 테스트입니다.');
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        console.log('Submitted profile form');
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    let msgs = await page.$$eval('div.whitespace-pre-wrap', els => els.map(e => e.innerText));
    console.log('MESSAGES BEFORE DELETE:', msgs);

    const deleteBtn = await page.$('button > svg.lucide-x');
    if (deleteBtn) {
      console.log('Found X button. Clicking it...');
      await deleteBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      console.log('Clicked delete button.');
      
      msgs = await page.$$eval('div.whitespace-pre-wrap', els => els.map(e => e.innerText));
      console.log('MESSAGES AFTER DELETE:', msgs);
    } else {
      console.log('NO X BUTTON FOUND!');
    }
    
    await browser.close();
    console.log('Test completed.');
  } catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
  }
})();
