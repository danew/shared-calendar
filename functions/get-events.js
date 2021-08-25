const fetch = require('node-fetch')

const saveSearch = async (location, description, ip) => {
}

exports.handler = async (event) => {
  const { location, description } = event.queryStringParameters
  if (!location || !description) {
    return {
      statusCode: 404,
    }
  }

  try {
    const params = new URLSearchParams()
    params.set('location', location)
    params.set('description', description)

    const ip = event.identity && event.identity.sourceIP || null
    saveSearch(location, description, ip)

    const response = await fetch(`https://jobs.github.com/positions.json?${params}`)
    const positions = await response.json()
    return {
      statusCode: 200,
      body: JSON.stringify(positions),
    }
  } catch (e) {
    console.log(e)
    return {
      statusCode: 500,
    }
  }
}