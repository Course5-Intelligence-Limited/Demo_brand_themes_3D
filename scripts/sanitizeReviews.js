#!/usr/bin/env node
// Usage: node scripts/sanitizeReviews.js <inputPath> <outputPath>
// Streams input, replaces unquoted NaN with null, converts single-quoted arrays like "['positive']" -> ["positive"].

const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Usage: node scripts/sanitizeReviews.js <inputPath> <outputPath>');
  process.exit(1);
}

const inputPath = path.resolve(process.argv[2]);
const outputPath = path.resolve(process.argv[3]);

console.log(`Sanitizing ${inputPath} → ${outputPath}`);

const readStream = fs.createReadStream(inputPath, { encoding: 'utf8' });
const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

let carry = '';
const CARRY_KEEP = 1024; // keep last 1KB to avoid cutting tokens

readStream.on('data', (chunk) => {
  let text = carry + chunk;

  // Replace patterns on the current text, but keep last CARRY_KEEP chars as carry
  if (text.length > CARRY_KEEP) {
    const processUpTo = text.length - CARRY_KEEP;
    const toProcess = text.slice(0, processUpTo);
    carry = text.slice(processUpTo);

    const fixed = sanitizeChunk(toProcess);
    writeStream.write(fixed);
  } else {
    carry = text;
  }
});

readStream.on('end', () => {
  if (carry.length > 0) {
    const fixed = sanitizeChunk(carry);
    writeStream.write(fixed);
  }
  writeStream.end();
  console.log('Sanitization complete.');
});

readStream.on('error', (err) => {
  console.error('Read error:', err);
  process.exit(1);
});

writeStream.on('error', (err) => {
  console.error('Write error:', err);
  process.exit(1);
});

function sanitizeChunk(s) {
  // 1) Replace unquoted NaN that appear as JSON values: ": NaN," or ": NaN}" etc.
  s = s.replace(/:\s*NaN(?=\s*[,}\]])/g, ': null');

  // 2) Convert patterns like "['positive']" or "['a','b']" -> ["positive"] / ["a","b"]
  // Step A: replace opening "['  -> ["  (keep the outer double-quote or not)
  s = s.replace(/"\[\s*'/g, '"["');
  // Step B: replace closing ']"  -> "]"
  s = s.replace(/'\s*\]"/g, '"]"');
  // Step C: replace inner single-quote separators ',' -> "," inside the square
  s = s.replace(/'\s*,\s*'/g, '","');

  // 3) Also handle non-quoted bracket arrays e.g. ['positive'] (rare) — convert single quotes to double inside brackets
  s = s.replace(/\[\s*'([^']*?)'\s*\]/g, '["$1"]');
  s = s.replace(/\[\s*'([^']*?)'\s*,\s*'([^']*?)'\s*\]/g, '["$1","$2"]');

  return s;
}
