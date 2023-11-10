const fs = require('fs');
const path = require('path');

const saveLocation = path.join(__dirname, '..', 'data');

if (!fs.existsSync(saveLocation)) {
  fs.mkdirSync(saveLocation, { recursive: true });
}

const savedFileHashes = path.resolve(saveLocation, '.savedFiles.json')

if (!fs.existsSync(savedFileHashes)) {
  fs.writeFileSync(savedFileHashes, JSON.stringify({}));
}

// SOURCE: https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
// This is a simple, *insecure* hash that's short, fast, and has no dependencies.
// For algorithmic use, where security isn't needed, it's way simpler than sha1 (and all its deps)
// or similar, and with a short, clean (base 36 alphanumeric) result.
// Loosely based on the Java version; see
// https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
const simpleHash = str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
};

// save csv file to disk under /data
function saveData(fileName, fileContents) {
  const savedHashes = JSON.parse(fs.readFileSync(savedFileHashes.toString()));
  const hash = simpleHash(fileContents);

  if (Object.keys(savedHashes).includes(hash)) {
    console.log('File already saved');
    return savedHashes[hash];
  }

  fs.writeFileSync(path.join(saveLocation, fileName), fileContents);
  savedHashes[hash] = fileName;
  fs.writeFileSync(savedFileHashes, JSON.stringify(savedHashes));

  return fileName;
}

module.exports = {
  saveData
}