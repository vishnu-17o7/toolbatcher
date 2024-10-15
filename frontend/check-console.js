import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  try {
    await page.goto('http://localhost:8080', {waitUntil: 'networkidle0'});
    
    // Wait for 5 seconds to allow for any asynchronous operations to complete
    await page.waitForTimeout(5000);

    // Get the content of the #root element
    const content = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML : 'Root element not found';
    });

    console.log('Content of #root:', content);

  } catch (error) {
    console.error('Error loading page:', error);
  }

  await browser.close();
})();