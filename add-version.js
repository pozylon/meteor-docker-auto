const fs = require('fs')

const [version, folder] = process.argv.reverse()

const dockerfile = fs
  .readFileSync(`${folder}/Dockerfile-ubuntu.template`)
  .toString('utf8')
  .replace('{{METEOR_VERSION}}', version)

fs.mkdirSync(`${folder}/${version}`)
fs.writeFileSync(`${folder}/${version}/Dockerfile`, dockerfile)

if (
  version.indexOf('rc') === -1 &&
  version.indexOf('canary') === -1 &&
  version.indexOf('beta') === -1 &&
  version.indexOf('alpha') === -1) {
  // official release, update latest
  fs.unlinkSync(`${folder}/latest/Dockerfile`)
  fs.writeFileSync(`${folder}/latest/Dockerfile`, dockerfile)
}
