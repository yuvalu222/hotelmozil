import { chromium } from 'playwright';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ctx=await chromium.launchPersistentContext('recon/profile-headed',{
  channel:'chrome',headless:true,userAgent:UA,viewport:{width:1440,height:1000},locale:'en-US',
  args:['--disable-blink-features=AutomationControlled']});
await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>undefined}));
const out={};

const p=await ctx.newPage();
await p.goto('https://www.tiktok.com/explore',{timeout:60000,waitUntil:'domcontentloaded'});
await p.waitForTimeout(9000);
for(let i=0;i<3;i++){await p.mouse.wheel(0,1500);await p.waitForTimeout(2500);}
const links=await p.evaluate(()=>[...new Set([...document.querySelectorAll('a[href*="/video/"],a[href*="/photo/"]')].map(a=>a.href))]);
out.exploreLinks=links.length;
out.photoLinks=links.filter(l=>l.includes('/photo/')).length;
out.sampleLinks=links.slice(0,6);
console.log('EXPLORE total=',links.length,'photo=',out.photoLinks);
console.log('SAMPLE',JSON.stringify(links.slice(0,3)));
await p.close();

out.posts=[];
for(const link of links.slice(0,2)){
  const q=await ctx.newPage(); let d={link};
  try{
    await q.goto(link,{timeout:90000,waitUntil:'commit'});
    await q.waitForTimeout(14000);
    d=await q.evaluate(()=>{
      const t=document.body.innerText;
      const g=s=>{const e=document.querySelector(`[data-e2e="${s}"]`);return e?e.innerText:null;};
      return {url:location.href, like:g('like-count'), comment:g('comment-count'), share:g('share-count'),
        browseLike:g('browse-like-count'),
        imgs:document.querySelectorAll('img[src*="tiktokcdn"]').length,
        txtLen:t.length, txt:t.replace(/\s+/g,' ').slice(0,200)};
    });
    await q.screenshot({path:`recon/shots/tt-post-${out.posts.length}.jpg`,quality:55,type:'jpeg'});
  }catch(e){ d.error=String(e).split('\n')[0].slice(0,120); }
  out.posts.push(d); console.log('POST',JSON.stringify(d).slice(0,400));
  await q.close();
}
fs.writeFileSync('recon/probe6-results.json',JSON.stringify(out,null,2));
await ctx.close();
