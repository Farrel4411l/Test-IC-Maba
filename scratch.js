const fs = require('fs'); 
['index.html', 'join.html'].forEach(f => { 
  const html = fs.readFileSync(f, 'utf8'); 
  const tags = ['div', 'section', 'button', 'a', 'span'];
  tags.forEach(tag => {
    const o = (html.match(new RegExp('<' + tag + '\\b', 'g')) || []).length; 
    const c = (html.match(new RegExp('<\/' + tag + '>', 'g')) || []).length; 
    if (o !== c) console.log(f, tag, 'open:', o, 'close:', c);
  });
});
