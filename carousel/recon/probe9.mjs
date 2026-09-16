import { chromium } from 'playwright';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ctx=await chromium.launchPersistentContext('recon/profile-headed',{
  channel:'chrome',headless:true,userAgent:UA,viewport:{width:1440,height:1000},locale:'en-US',
  args:['--disable-blink-features=AutomationControlled']});
await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>undefined}));
const out={};

// A: does a discover page's embedded JSON mark image posts?
{
  const p=await ctx.newPage();
  await p.goto('https://www.tiktok.com/discover/travel-tips',{timeout:60000,waitUntil:'domcontentloaded'});
  await p.waitForTimeout(9000);
  out.discoverJson=await p.evaluate(()=>{
    const h=document.documentElement.innerHTML;
    return {imagePost:(h.match(/imagePost/g)||[]).length,
            photoUrls:(h.match(/\/photo\/\d+/g)||[]).length,
            playCount:(h.match(/"playCount":\d+/g)||[]).length};
  });
  console.log('DISCOVER-JSON',JSON.stringify(out.discoverJson));
  await p.close();
}
// B: known photo-post URL forms
const tries=[
 'https://www.tiktok.com/@tiktokcreativeexperts/video/7291541210508856618',
 'https://www.tiktok.com/@casey.caputo/video/7192021491574328622',
];
out.posts=[];
for(const u of tries){
  const q=await ctx.newPage(); let d={u};
  try{
    await q.goto(u,{timeout:90000,waitUntil:'commit'});
    await q.waitForTimeout(13000);
    d=await q.evaluate(()=>{
      const h=document.documentElement.innerHTML;
      const g=s=>{const e=document.querySelector(`[data-e2e="${s}"]`);return e?e.innerText:null;};
      return {url:location.href, like:g('like-count'), comment:g('comment-count'), share:g('share-count'),
        isImagePost:/imagePost/.test(h),
        imgCount:document.querySelectorAll('img[src*="tiktokcdn"]').length,
        swiper:document.querySelectorAll('[class*="swiper-slide"]').length};
    });
  }catch(e){d.error=String(e).split('\n')[0].slice(0,110);}
  out.posts.push(d); console.log('POST',JSON.stringify(d).slice(0,330)); await q.close();
}
fs.writeFileSync('recon/probe9-results.json',JSON.stringify(out,null,2));
await ctx.close();
