const fetch = require('node-fetch')

const { DOCKER_TRIGGER_URL } = process.env

const createDockerHubFetch = async () => async ({ body }) => fetch(DOCKER_TRIGGER_URL, {
  headers: {
    Accept: 'application/json'
  },
  method: 'POST',
  body: JSON.stringify(body)
})

const sendBuildTrigger = async ({ tag }) => {
  const fetcher = await createDockerHubFetch()
  await fetcher({
    body: {
      source_type: 'Tag',
      source_name: tag
    }
  })
  await fetcher({
    body: {
      source_type: 'Branch',
      source_name: 'master'
    }
  })
}

module.exports = {
  createDockerHubFetch,
  sendBuildTrigger
}
