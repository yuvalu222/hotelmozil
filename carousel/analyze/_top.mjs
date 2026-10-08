import fs from 'node:fs';
import { chromium } from 'playwright';
const [deck, frame] = process.argv.slice(2);
const b64 = fs.readFileSync(`harvest/tt-decks/${deck}/${frame}`).toString('base64');
const br = await chromium.launch({ channel:'chrome', headless:true });
const p = await br.newPage();
await p.setContent('<body></body>');
const r = await p.evaluate(async (uri) => {
  const im = new Image();
  await new Promise((ok,no)=>{im.onload=ok;im.onerror=no;im.src=uri});
  const W=im.width,H=im.height,c=document.createElement('canvas');
  c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});
  x.drawImage(im,0,0);const d=x.getImageData(0,0,W,500).data;
  const out=[];
  for(let y=1;y<499;y++){
    let n=0;
    for(let xx=1;xx<W-1;xx++){
      const i=(y*W+xx)*4, l=(a)=>0.2126*d[a]+0.7152*d[a+1]+0.0722*d[a+2];
      if(Math.abs(l(i+4)-l(i-4))>40) n++;
    }
    out.push(n);
  }
  return {W,out};
}, `data:image/jpeg;base64,${b64}`);
// runs of rows with any appreciable edge count
const t = Math.max(...r.out)*0.15;
let s=-1;
for(let y=0;y<r.out.length;y++){
  if(r.out[y]>=t){ if(s<0)s=y; }
  else if(s>=0){ if(y-s>=8) console.log(`  y ${s+1} .. ${y}   height ${y-s-1}`); s=-1; }
}
console.log(`(top 500px of ${deck}/${frame}, ${r.W} wide)`);
await br.close();
