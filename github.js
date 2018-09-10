const jwt = require('jsonwebtoken')
const fs = require('fs')
const util = require('util')
const fetch = require('node-fetch')

const {
  GITHUB_KEY_PATH, GITHUB_KEY,
  GITHUB_INSTALLATION_ID, GITHUB_APP_ID } = process.env

const getInstallationToken = async () => {
  const readFile = util.promisify(fs.readFile)
  const cert = GITHUB_KEY_PATH && await readFile(GITHUB_KEY_PATH)
  const certData = cert || Buffer.from(GITHUB_KEY, 'base64').toString()
  const jwtToken = jwt.sign({
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (1 * 60),
    iss: GITHUB_APP_ID
  }, certData, { algorithm: 'RS256' })

  const tokenResult = await fetch(`https://api.github.com/installations/${GITHUB_INSTALLATION_ID}/access_tokens`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github.machine-man-preview+json',
      Authorization: `Bearer ${jwtToken}`
    }
  })
  const { token } = await tokenResult.json()
  return token
}

const createGithubFetch = async token => async ({ resourceUri, method, body }) => fetch(`https://api.github.com${resourceUri}`, {
  headers: {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token}`
  },
  method: method || 'GET',
  body: body || null
})

module.exports = {
  getInstallationToken,
  createGithubFetch
}
