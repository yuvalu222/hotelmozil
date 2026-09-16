import { chromium } from 'playwright';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ctx=await chromium.launchPersistentContext('recon/profile-headed',{
  channel:'chrome',headless:true,userAgent:UA,viewport:{width:1440,height:1000},locale:'en-US',
  args:['--disable-blink-features=AutomationControlled']});
await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>undefined}));
const out=[];

const queries=[
  ['bing-photo-site','https://www.bing.com/search?q=site%3Atiktok.com+%2Fphoto%2F+travel+tips&count=30'],
  ['bing-acct','https://www.bing.com/search?q=site%3Atiktok.com%2F%40cheapholidayexpert&count=30'],
  ['ddg-photo','https://duckduckgo.com/html/?q=site%3Atiktok.com+%2Fphoto%2F+travel+tips'],
  ['google-photo','https://www.google.com/search?q=site:tiktok.com+%22/photo/%22+travel+tips&num=30'],
];
for(const [name,url] of queries){
  const p=await ctx.newPage(); const r={name,url};
  try{
    const resp=await p.goto(url,{timeout:60000,waitUntil:'domcontentloaded'});
    r.status=resp?.status(); await p.waitForTimeout(5000);
    const d=await p.evaluate(()=>{
      const hrefs=[...document.querySelectorAll('a[href]')].map(a=>a.href);
      const tt=hrefs.filter(h=>/tiktok\.com\/@[^/]+\/(photo|video)\//.test(h));
      return {all:hrefs.length, tiktok:[...new Set(tt)].length,
        photo:[...new Set(tt.filter(h=>h.includes('/photo/')))].length,
        sample:[...new Set(tt)].slice(0,4),
        blocked:/unusual traffic|captcha|verify you/i.test(document.body.innerText)};
    });
    Object.assign(r,d);
  }catch(e){ r.error=String(e).split('\n')[0].slice(0,120); }
  out.push(r); console.log(JSON.stringify(r).slice(0,420)); await p.close();
}
fs.writeFileSync('recon/probe7-results.json',JSON.stringify(out,null,2));
await ctx.close();
