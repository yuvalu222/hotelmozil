import { chromium } from 'playwright';
import fs from 'node:fs';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ctx=await chromium.launchPersistentContext('recon/profile-headed',{
  channel:'chrome',headless:true,userAgent:UA,viewport:{width:1440,height:1000},locale:'en-US',
  args:['--disable-blink-features=AutomationControlled']});
await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>undefined}));
const out=[];

// Meta Ad Library — land on base then navigate in-app
{
  const p=await ctx.newPage();
  const r1=await p.goto('https://www.facebook.com/ads/library/',{timeout:60000,waitUntil:'domcontentloaded'});
  await p.waitForTimeout(6000);
  const r2=await p.goto('https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IL&q=%D7%98%D7%99%D7%A1%D7%95%D7%AA&search_type=keyword_unordered',{timeout:60000,waitUntil:'domcontentloaded'});
  await p.waitForTimeout(12000);
  await p.mouse.wheel(0,2000); await p.waitForTimeout(5000);
  const d=await p.evaluate(()=>{
    const t=document.body.innerText;
    return {status:'nav', resultsHdr:(t.match(/~?[\d,]+\s+results/i)||[])[0]||null,
      libraryIds:(t.match(/Library ID:\s*\d+/g)||[]).length,
      started:(t.match(/Started running on/g)||[]).length,
      txtLen:t.length, txt:t.replace(/\s+/g,' ').slice(0,400)};
  });
  out.push({src:'meta-adlib',s1:r1?.status(),s2:r2?.status(),...d});
  console.log('META',JSON.stringify(d).slice(0,600));
  await p.screenshot({path:'recon/shots/meta-deep.jpg',quality:55,type:'jpeg'});
  await p.close();
}
// Pinterest direct pin
{
  const p=await ctx.newPage();
  const r=await p.goto('https://www.pinterest.com/pin/1055599601246186/',{timeout:60000,waitUntil:'domcontentloaded'});
  await p.waitForTimeout(8000);
  const d=await p.evaluate(()=>{const t=document.body.innerText;
    return {txtLen:t.length, saves:/\bsaves?\b/i.test(t), txt:t.replace(/\s+/g,' ').slice(0,300)};});
  out.push({src:'pinterest-pin',status:r?.status(),...d});
  console.log('PIN',JSON.stringify(d).slice(0,400));
  await p.close();
}
fs.writeFileSync('recon/probe5-results.json',JSON.stringify(out,null,2));
await ctx.close();
