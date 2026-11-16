import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export const digest = value => createHash('sha256').update(value).digest('hex');
// Normalize only transformations observed on this site's Netlify production.
// Preserve every other script, comment, attribute and gameplay byte.
export function normalizeHostHTML(value) {
  return value.toString()
    .replace(/<!-- This site is hosted on Netlify\. Anyone can build and deploy a site\n     like this one for free: https:\/\/netlify\.new\/\?[^\n]*\n     Netlify hosting facts for this site: static\/SSR served via Netlify Edge\. -->\n/, '')
    .replace('<script async src="/.netlify/scripts/hud?variant=public" data-nf-variant="public" data-netlify-site-id="d6a1e807-d067-4b58-ab77-fe0287532606" data-app-host="app.netlify.com" data-account-tier="free"></script>', '')
    .replace("href='/game/preview-2d/art-review' style='color:inherit;text-decoration:underline'", 'href="./art-review.html" style="color:inherit;text-decoration:underline"').trimEnd();
}
export async function compareLive(root, base, fetcher = fetch) {
  const files = ['index.html', 'game.js', 'style.css'];
  const walk = dir => {
    for (const entry of readdirSync(path.join(root, dir), {withFileTypes:true})) {
      const name = dir + '/' + entry.name;
      if (entry.isDirectory()) walk(name);
      else if (/\.(png|webp|svg|json)$/.test(name)) files.push(name);
    }
  };
  walk('assets');
  const results = [];
  for (const file of files) {
    try {
      const url = new URL(file, base);
      url.searchParams.set('verify', process.env.GITHUB_SHA || 'local');
      const response = await fetcher(url, {signal:AbortSignal.timeout(15000), redirect:'error', cache:'no-store'});
      if (!response.ok) throw Error('HTTP ' + response.status);
      const source = readFileSync(path.join(root, file));
      const live = Buffer.from(await response.arrayBuffer());
      const expected = digest(file === 'index.html' ? normalizeHostHTML(source) : source);
      const actual = digest(file === 'index.html' ? normalizeHostHTML(live) : live);
      results.push({file, pass:expected === actual, expected, actual, rawExpected:digest(source), rawActual:digest(live)});
    } catch (error) { results.push({file, pass:false, error:error.message}); }
  }
  return {status:results.every(r => r.pass) ? 'CONTENT_MATCH' : 'BLOCKED', results};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve('game/preview-2d');
  const report = await compareLive(root, 'https://yencafeday.netlify.app/game/preview-2d/');
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'CONTENT_MATCH') process.exitCode = 1;
}
