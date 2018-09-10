const fetch = require('node-fetch')

const { DOCKER_TRIGGER_URL } = process.env

const createDockerHubFetch = async () => async ({ body }) => fetch(DOCKER_TRIGGER_URL, {
  headers: {
    Accept: 'application/json'
  },
  method: 'POST',
  body: body || null
})

const sendBuildTrigger = async ({ tag }) => {
  const fetcher = await createDockerHubFetch()
  return fetcher({
    body: {
      source_type: 'Tag',
      source_name: tag
    }
  })
}

module.exports = {
  createDockerHubFetch,
  sendBuildTrigger
}
