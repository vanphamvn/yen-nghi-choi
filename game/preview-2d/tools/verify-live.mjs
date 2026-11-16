import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export const digest = value => createHash('sha256').update(value).digest('hex');
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
      const expected = digest(readFileSync(path.join(root, file)));
      const actual = digest(Buffer.from(await response.arrayBuffer()));
      results.push({file, pass:expected === actual, expected, actual});
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
