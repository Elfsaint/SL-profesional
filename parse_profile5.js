const fs = require('fs');
const zlib = require('zlib');

const pdfPath = "C:/Users/PRECISION 3551/.dsh/attachments/v1/files/75/750e220c0e12f366de69cae7d43a405023ba1b1e73ae84de766d1295094f0358/Profile (5).pdf";
const buf = fs.readFileSync(pdfPath);

let pos = 0;
let streams = [];
while ((pos = buf.indexOf("stream", pos)) !== -1) {
  let start = pos + 6;
  if (buf[start] === 13) start++;
  if (buf[start] === 10) start++;
  let end = buf.indexOf("endstream", start);
  if (end === -1) break;
  let raw = buf.slice(start, end);
  if (raw[raw.length-1] === 10) raw = raw.slice(0, -1);
  if (raw[raw.length-1] === 13) raw = raw.slice(0, -1);
  let decomp = null;
  try { decomp = zlib.inflateSync(raw); } catch(e) {
    try { decomp = zlib.inflateRawSync(raw); } catch(e2) {}
  }
  streams.push(decomp ? decomp.toString("latin1") : raw.toString("latin1"));
  pos = end + 9;
}

let cmap = {};
streams.forEach(s => {
  let bfcharMatches = s.matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g);
  for (let m of bfcharMatches) {
    let src = m[1].toLowerCase();
    // pad src to 4 digits if needed
    while (src.length < 4) src = "0" + src;
    let chars = [];
    for (let i = 0; i < m[2].length; i += 4) {
      let codeVal = parseInt(m[2].substr(i, 4), 16);
      chars.push(String.fromCharCode(codeVal));
    }
    cmap[src] = chars.join("");
  }
});

console.log("CMap size:", Object.keys(cmap).length);

let extractedText = [];

streams.forEach((s, idx) => {
  if (s.includes("TJ") || s.includes("Tj")) {
    let streamText = [];
    // Extract text blocks
    let btBlocks = s.split("BT");
    btBlocks.forEach(bt => {
      if (!bt.includes("ET")) return;
      let blockText = "";
      let matches = bt.matchAll(/<([0-9a-fA-F]+)>\s*(TJ|Tj)|\[(.*?)\]\s*TJ|\((.*?)\)\s*(Tj|TJ)/gs);
      for (let m of matches) {
        if (m[1]) {
          for (let i = 0; i < m[1].length; i += 4) {
            let code = m[1].substr(i, 4).toLowerCase();
            blockText += cmap[code] || "?";
          }
        } else if (m[3]) {
          let hexes = m[3].matchAll(/<([0-9a-fA-F]+)>/g);
          for (let h of hexes) {
            for (let i = 0; i < h[1].length; i += 4) {
              let code = h[1].substr(i, 4).toLowerCase();
              blockText += cmap[code] || "?";
            }
          }
        } else if (m[4]) {
          blockText += m[4];
        }
      }
      if (blockText.trim()) streamText.push(blockText);
    });
    if (streamText.length > 0) {
      extractedText.push(`--- Stream ${idx} --- \n` + streamText.join("\n"));
    }
  }
});

fs.writeFileSync("D:/SANTIAGO/pagina web/profile5_text.txt", extractedText.join("\n\n"), "utf8");
console.log("Saved to profile5_text.txt");
