import { chromium } from 'playwright';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ctx=await chromium.launchPersistentContext('recon/profile-headed',{
  channel:'chrome',headless:true,userAgent:UA,viewport:{width:1440,height:1000},locale:'en-US',
  args:['--disable-blink-features=AutomationControlled']});
await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>undefined}));
const out=[];
const urls=[
 ['discover-carousels','https://www.tiktok.com/discover/best-carousels-on-tiktok'],
 ['discover-traveltips','https://www.tiktok.com/discover/travel-tips'],
 ['tag-traveltips','https://www.tiktok.com/tag/traveltips'],
 ['tag-thailand','https://www.tiktok.com/tag/thailandtravel'],
];
for(const [name,url] of urls){
  const p=await ctx.newPage(); const r={name,url};
  try{
    const resp=await p.goto(url,{timeout:60000,waitUntil:'domcontentloaded'});
    r.status=resp?.status(); await p.waitForTimeout(9000);
    for(let i=0;i<4;i++){await p.mouse.wheel(0,1600);await p.waitForTimeout(2500);}
    const d=await p.evaluate(()=>{
      const tt=[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.href)
        .filter(h=>/tiktok\.com\/@[^/]+\/(photo|video)\//.test(h)))];
      return {posts:tt.length, photo:tt.filter(h=>h.includes('/photo/')).length,
        sample:tt.slice(0,3), txtLen:document.body.innerText.length};
    });
    Object.assign(r,d);
  }catch(e){r.error=String(e).split('\n')[0].slice(0,110);}
  out.push(r); console.log(JSON.stringify(r).slice(0,400)); await p.close();
}
fs.writeFileSync('recon/probe8-results.json',JSON.stringify(out,null,2));
await ctx.close();
