const { send } = require('micro')
const SimpleGit = require('simple-git/promise')
const os = require('os')
const fs = require('fs-extra')
const { URL } = require('url')
const { execAsync } = require('async-child-process')
const { getInstallationToken } = require('./github')

const logger = console
const { ACCESS_KEY } = process.env
const GITHUB_ORGANIZATION = 'pozylon'
const GITHUB_REPOSITORY = 'meteor-docker-auto'

module.exports = async (req, res) => {
  const url = new URL(`http://${req.headers.host}${req.url}`)
  const accessKey = url.searchParams.get('accessKey')
  if (accessKey !== ACCESS_KEY) {
    const statusCode = 403
    return send(res, statusCode, 'Access key incorrect')
  }

  const version = url
    .searchParams.get('version')
    .replace('release/METEOR@', '')
  if (!version) {
    const statusCode = 500
    return send(res, statusCode, 'Version has to be provided')
  }

  const branch = url.searchParams.get('branch')
  const folder = url.searchParams.get('folder') || ''
  const tempDir = `${os.tmpdir()}/${GITHUB_REPOSITORY}`
  const token = await getInstallationToken()
  const originPath = `https://x-access-token:${token}@github.com/${GITHUB_ORGANIZATION}/${GITHUB_REPOSITORY}.git`

  logger.log(`clone ${GITHUB_ORGANIZATION}/${GITHUB_REPOSITORY} to ${tempDir}...`)
  await fs.emptyDir(tempDir)
  const git = SimpleGit(tempDir)
  await git.clone(originPath, tempDir)
  if (branch) {
    logger.log(`checkout ${branch}...`)
    await git.checkout(branch)
  }
  await git.addConfig('user.name', 'Meteor Docker Auto Bumper')
  await git.addConfig('user.email', 'hello@fivelines.ch')
  const { stdout } = await execAsync(`node add-version.js ${tempDir}${folder} ${version}`)
  logger.log(stdout)
  await git.add(['.'])
  await git.commit(`create new version ${version}`)
  await git.addTag(version)
  await git.push('origin', 'master', { '--set-upstream': null, '--force': null })
  await git.pushTags()
  const statusCode = 201
  return send(res, statusCode, 'Version ' + version + ' created')
}
