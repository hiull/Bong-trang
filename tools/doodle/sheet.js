const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const src = fs.readFileSync(require('path').join(__dirname, '../../assets/img/doodles.js'), 'utf8');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await p.setContent('<html><body style="margin:0;background:#FFF6EC;font:11px sans-serif"><div id=g style="display:grid;grid-template-columns:repeat(15,1fr);gap:4px;padding:6px"></div></body></html>');
  await p.addScriptTag({ content: src });
  await p.evaluate(() => { const g = document.getElementById('g'); Object.keys(DOODLES).forEach(k => { const d = document.createElement('div'); d.style.textAlign = 'center';
    d.innerHTML = '<svg viewBox="0 0 64 64" width="64" height="64">' + DOODLES[k] + '</svg><div>' + k + '</div>'; g.appendChild(d); }); });
  await p.screenshot({ path: 'sheet.png', fullPage: true });
  await b.close();
})();
