'use strict';

// right now, just applies highlight.js styling

let fs = require('fs');
let path = require('path');

let jsdom = require('jsdom');
let hljs = require('highlight.js');

function highlightCodeblocks(html) {
  let dom = new jsdom.JSDOM(html, { includeNodeLocations: true });
  let nodes = dom.window.document.querySelectorAll('.build-js');
  if (nodes.length === 0) {
    return html;
  }
  // last-first
  let sorted = [...nodes].map(n => ({ node: n, loc: dom.nodeLocation(n) })).sort((a, b) => b.loc.startOffset - a.loc.startOffset);
  for (let { node, loc } of sorted) {
    let prefix = html.slice(0, loc.startOffset);
    let code = html.slice(loc.startTag.endOffset, loc.endTag.startOffset).trim();
    let suffix = html.slice(loc.endOffset);

    let formatted = hljs.highlight(code, { language: 'javascript' }).value;
    html = `${prefix}<code class="hljs${code.length < 10 ? ' nowrap' : ''}">${formatted.trim()}</code>${suffix}`;
  }
  return html;
}

let source = path.join('__dirname', '..', 'source');
let out = path.join('__dirname', '..', 'docs');
fs.mkdirSync(out, { recursive: true });

for (let file of fs.readdirSync(source)) {
  if (!file.endsWith('.html')) {
    continue;
  }
  let contents = fs.readFileSync(path.join(source, file), 'utf8');
  let built = highlightCodeblocks(contents);
  fs.writeFileSync(path.join(out, file), built, 'utf8');
}
