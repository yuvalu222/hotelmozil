import { chromium } from 'playwright';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
fs.mkdirSync('recon/shots',{recursive:true});

const accounts=['@thetravelcreator','@hoteltipsdaily','@travel','@cheapholidayexpert','@nomadicmatt'];
const ctx=await chromium.launchPersistentContext('recon/profile-headed',{
  channel:'chrome',headless:true,userAgent:UA,viewport:{width:1440,height:900},locale:'en-US',
  args:['--disable-blink-features=AutomationControlled'],
});
await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>undefined}));
const res=[];
for(const a of accounts){
  const page=await ctx.newPage(); const r={account:a};
  try{
    const resp=await page.goto(`https://www.tiktok.com/${a}`,{timeout:60000,waitUntil:'domcontentloaded'});
    r.status=resp?.status()??null;
    await page.waitForTimeout(8000);
    for(let i=0;i<2;i++){await page.mouse.wheel(0,1500);await page.waitForTimeout(2500);}
    const d=await page.evaluate(()=>{
      const items=[...document.querySelectorAll('a[href*="/video/"],a[href*="/photo/"]')];
      const views=[...document.querySelectorAll('[data-e2e="video-views"]')].map(e=>e.innerText);
      return {items:items.length,
        photo:items.filter(a=>a.href.includes('/photo/')).length,
        views:views.slice(0,12),
        txt:document.body.innerText.slice(0,200)};
    });
    Object.assign(r,d);
    await page.screenshot({path:`recon/shots/tt-${a.replace('@','')}.jpg`,quality:55,type:'jpeg'});
  }catch(e){r.error=String(e).split('\n')[0].slice(0,120);}
  res.push(r);console.log(JSON.stringify(r));await page.close();
}
fs.writeFileSync('recon/probe3-results.json',JSON.stringify(res,null,2));
await ctx.close();
