const fs = require('fs');
const zlib = require('zlib');

const path = process.argv[2];
const buf = fs.readFileSync(path);

// Find all 'stream' ... 'endstream' at byte level
const text = [];
let i = 0;
let streamNum = 0;
while (i < buf.length - 6) {
  // search for "stream" keyword
  if (buf[i] === 0x73 && buf.toString('ascii', i, i+6) === 'stream') {
    let s = i + 6;
    // skip CR/LF
    if (buf[s] === 0x0d) s++;
    if (buf[s] === 0x0a) s++;
    // find endstream
    const endIdx = buf.indexOf(Buffer.from('endstream'), s);
    if (endIdx < 0) break;
    let e = endIdx;
    // trim trailing whitespace
    while (e > s && (buf[e-1] === 0x0a || buf[e-1] === 0x0d || buf[e-1] === 0x20 || buf[e-1] === 0x09)) e--;
    const chunk = buf.slice(s, e);
    let out = null;
    try {
      out = zlib.inflateSync(chunk);
    } catch (err) {
      // maybe raw deflate (no zlib header)
      try { out = zlib.inflateRawSync(chunk); } catch (e2) { out = null; }
    }
    text.push(`\n===== STREAM ${streamNum} (offset ${i}) len=${chunk.length} =====`);
    if (out) {
      text.push(out.toString('utf8'));
    } else {
      text.push('(could not decompress, raw length ' + chunk.length + ')');
      text.push(chunk.toString('latin1'));
    }
    streamNum++;
    i = endIdx + 9;
  } else {
    i++;
  }
}

fs.writeFileSync(process.argv[3] || 'cv_extracted.txt', text.join('\n'), 'utf8');
console.log('streams found:', streamNum);
