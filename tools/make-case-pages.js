// Optional. Run once after adding a case study:  node tools/make-case-pages.js
// Writes work/<slug>.html with the right title, description and share image already in the HTML,
// so the link preview is correct on WhatsApp / X / LinkedIn (they do not run JavaScript).
// The /work/<slug> page itself works without this; it is only for the share preview.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..'), SITE = 'https://greycreatives.vercel.app';
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/case-studies.js'), 'utf8'), ctx);
const tpl = fs.readFileSync(path.join(root, 'work.html'), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
fs.mkdirSync(path.join(root, 'work'), { recursive: true });
for (const c of ctx.window.GC_CASES) {
  const title = `${c.name} — Case Study | Grey Creatives`;
  const desc = c.metaDescription || `Case study: ${c.name} (${c.industry}). ${(c.services || []).join(', ')} by Grey Creatives.`;
  const url = `${SITE}/work/${c.slug}`, img = `${SITE}/${String(c.cover).replace(/^\//, '')}`;
  let h = tpl
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(desc)}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(title)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(desc)}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta property="og:image" content=")[^"]*"/, `$1${esc(img)}"`)
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${esc(title)}"`)
    .replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${esc(desc)}"`)
    .replace(/(<meta name="twitter:image" content=")[^"]*"/, `$1${esc(img)}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`);
  fs.writeFileSync(path.join(root, 'work', c.slug + '.html'), h);
  console.log('wrote work/' + c.slug + '.html');
}
