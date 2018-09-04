const fs = require('fs')

const [version, folder] = process.argv.reverse()

const dockerfile = fs
  .readFileSync(`${folder}/Dockerfile-ubuntu.template`)
  .toString('utf8')
  .replace('{{METEOR_VERSION}}', version)

fs.mkdirSync(`${folder}/${version}`)
fs.unlinkSync(`${folder}/latest/Dockerfile`)
fs.writeFileSync(`${folder}/latest/Dockerfile`, dockerfile)
fs.writeFileSync(`${folder}/${version}/Dockerfile`, dockerfile)
