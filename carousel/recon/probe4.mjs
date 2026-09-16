import { chromium } from 'playwright';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ctx=await chromium.launchPersistentContext('recon/profile-headed',{
  channel:'chrome',headless:true,userAgent:UA,viewport:{width:1440,height:900},locale:'en-US',
  args:['--disable-blink-features=AutomationControlled']});
await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>undefined}));
const out=[];

// 1. TikTok profile embedded JSON
{
  const p=await ctx.newPage();
  await p.goto('https://www.tiktok.com/@cheapholidayexpert',{timeout:60000,waitUntil:'domcontentloaded'});
  await p.waitForTimeout(7000);
  const d=await p.evaluate(()=>{
    const el=document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__')||document.getElementById('SIGI_STATE');
    const html=document.documentElement.innerHTML;
    return {hasUniversal:!!el, len:el?el.textContent.length:0,
      keys:el?Object.keys(JSON.parse(el.textContent)['__DEFAULT_SCOPE__']||{}):[],
      itemListInHtml:/itemList|ItemModule|playCount/.test(html),
      playCountHits:(html.match(/"playCount":\d+/g)||[]).length};
  });
  out.push({src:'tiktok-embedded',...d}); console.log('TIKTOK',JSON.stringify(d).slice(0,500));
  await p.close();
}
// 2. Instagram profile logged-out
{
  const p=await ctx.newPage();
  const resp=await p.goto('https://www.instagram.com/cheapholidayexpert/',{timeout:60000,waitUntil:'domcontentloaded'});
  await p.waitForTimeout(8000);
  const d=await p.evaluate(()=>{
    const html=document.documentElement.innerHTML;
    return {links:[...document.querySelectorAll('a[href*="/p/"]')].length,
      edgeMedia:/edge_owner_to_timeline_media|"like_count"/.test(html),
      likeHits:(html.match(/"like_count":\d+/g)||[]).length,
      txt:document.body.innerText.slice(0,200)};
  });
  out.push({src:'instagram',status:resp?.status(),...d}); console.log('IG',JSON.stringify(d).slice(0,400));
  await p.close();
}
// 3. Creative Center — click into the list
{
  const p=await ctx.newPage();
  await p.goto('https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en',{timeout:60000,waitUntil:'domcontentloaded'});
  await p.waitForTimeout(12000);
  await p.mouse.wheel(0,1500); await p.waitForTimeout(4000);
  const d=await p.evaluate(()=>({cards:document.querySelectorAll('[class*="card"],[class*="Card"]').length,
    txtLen:document.body.innerText.length, txt:document.body.innerText.slice(0,600)}));
  out.push({src:'creative-center',...d}); console.log('CC',JSON.stringify(d).slice(0,600));
  await p.screenshot({path:'recon/shots/cc-deep.jpg',quality:55,type:'jpeg'});
  await p.close();
}
fs.writeFileSync('recon/probe4-results.json',JSON.stringify(out,null,2));
await ctx.close();
