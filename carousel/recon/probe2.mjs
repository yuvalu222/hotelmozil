import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT='recon/shots'; fs.mkdirSync(OUT,{recursive:true});
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';

const targets=[
  ['h-tiktok-search','https://www.tiktok.com/search?q=thailand%20travel%20tips'],
  ['h-tiktok-explore','https://www.tiktok.com/explore'],
  ['h-pin-search','https://www.pinterest.com/search/pins/?q=thailand%20travel%20tips'],
  ['h-pin-ideas','https://www.pinterest.com/ideas/travel/935919021007/'],
  ['h-cc-topads','https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?period=30&region=IL'],
  ['h-meta-adlib','https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IL&q=travel&search_type=keyword_unordered&media_type=all'],
];

const ctx = await chromium.launchPersistentContext('recon/profile-headed', {
  channel:'chrome', headless:true, userAgent:UA,
  viewport:{width:1440,height:900}, locale:'en-US',
  args:['--disable-blink-features=AutomationControlled','--start-maximized'],
});
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>undefined});});

const res=[];
for (const [name,url] of targets){
  const page=await ctx.newPage(); const r={name,url};
  try{
    const resp=await page.goto(url,{timeout:60000,waitUntil:'domcontentloaded'});
    r.status=resp?.status()??null;
    await page.waitForTimeout(9000);
    for(let i=0;i<3;i++){ await page.mouse.wheel(0,1200); await page.waitForTimeout(2500); }
    const body=await page.evaluate(()=>document.body.innerText.slice(0,4000));
    r.title=await page.title(); r.chars=body.length;
    r.blocked=/captcha|verify (that )?you are human|unusual traffic|access denied|security check/i.test(body);
    r.metricHits=(body.match(/\b\d+(\.\d+)?[KMB]\b/g)||[]).length;
    r.links=await page.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>a.href)
      .filter(h=>/\/(video|photo|pin)\//.test(h)||/ad_archive|library\/\?id/.test(h)).length);
    r.sample=body.replace(/\s+/g,' ').slice(0,200);
    await page.screenshot({path:`${OUT}/${name}.jpg`,quality:60,type:'jpeg'});
  }catch(e){ r.error=String(e).split('\n')[0].slice(0,140); }
  res.push(r); console.log(JSON.stringify(r)); await page.close();
}
fs.writeFileSync('recon/probe2-results.json',JSON.stringify(res,null,2));
await ctx.close();
