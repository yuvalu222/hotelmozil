import { chromium } from 'playwright';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ctx=await chromium.launchPersistentContext('recon/profile-hl',{
  channel:'chrome',headless:true,userAgent:UA,viewport:{width:1440,height:1000},locale:'en-US',
  args:['--disable-blink-features=AutomationControlled']});
await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>undefined}));

// 1 Meta Ad Library
{const p=await ctx.newPage();
 await p.goto('https://www.facebook.com/ads/library/',{timeout:60000,waitUntil:'domcontentloaded'});
 await p.waitForTimeout(5000);
 await p.goto('https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IL&q=%D7%98%D7%99%D7%A1%D7%95%D7%AA&search_type=keyword_unordered',{timeout:60000,waitUntil:'domcontentloaded'});
 await p.waitForTimeout(12000); await p.mouse.wheel(0,2000); await p.waitForTimeout(4000);
 const t=await p.evaluate(()=>document.body.innerText);
 console.log('META headless: results=',(t.match(/~?[\d,]+\s+results/i)||[])[0],'libIDs=',(t.match(/Library ID:\s*\d+/g)||[]).length,'started=',(t.match(/Started running on/g)||[]).length);
 await p.close();}
// 2 Creative Center
{const p=await ctx.newPage();
 await p.goto('https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en',{timeout:60000,waitUntil:'domcontentloaded'});
 await p.waitForTimeout(12000); await p.mouse.wheel(0,1500); await p.waitForTimeout(4000);
 const d=await p.evaluate(()=>({cards:document.querySelectorAll('[class*="card"],[class*="Card"]').length,ctr:(document.body.innerText.match(/Top \d+%/g)||[]).length}));
 console.log('CC headless:',JSON.stringify(d)); await p.close();}
// 3 TikTok post
{const p=await ctx.newPage();
 try{await p.goto('https://www.tiktok.com/@tiktokcreativeexperts/video/7291541210508856618',{timeout:90000,waitUntil:'commit'});
 await p.waitForTimeout(13000);
 const d=await p.evaluate(()=>{const g=s=>{const e=document.querySelector(`[data-e2e="${s}"]`);return e?e.innerText:null;};return{like:g('like-count'),comment:g('comment-count'),share:g('share-count')};});
 console.log('TT post headless:',JSON.stringify(d));}catch(e){console.log('TT err',String(e).slice(0,90));}
 await p.close();}
// 4 discover enumerator
{const p=await ctx.newPage();
 await p.goto('https://www.tiktok.com/discover/travel-tips',{timeout:60000,waitUntil:'domcontentloaded'});
 await p.waitForTimeout(9000); for(let i=0;i<3;i++){await p.mouse.wheel(0,1600);await p.waitForTimeout(2000);}
 const n=await p.evaluate(()=>[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.href).filter(h=>/tiktok\.com\/@[^/]+\/(photo|video)\//.test(h)))].length);
 console.log('discover headless posts=',n); await p.close();}
// 5 Pexels
{const p=await ctx.newPage();
 const r=await p.goto('https://www.pexels.com/search/thailand/',{timeout:60000,waitUntil:'domcontentloaded'});
 await p.waitForTimeout(6000);
 const n=await p.evaluate(()=>document.querySelectorAll('img[src*="pexels"]').length);
 console.log('pexels headless status=',r?.status(),'imgs=',n); await p.close();}
await ctx.close();
