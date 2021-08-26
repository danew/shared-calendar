const { authorize, getEvents, getServiceAccount } = require('../utils/calendar');

const CalendarId = process.env.CALENDAR_ID;

exports.handler = async (event) => {
  const { from, to } = event.queryStringParameters;
  if (!location || !description) {
    return {
      statusCode: 400,
    }
  }

  try {
    const serviceAccount = getServiceAccount();
    const client = await authorize(serviceAccount);
    const events = await getEvents(client, CalendarId, from, to);
    
    return {
      statusCode: 200,
      body: JSON.stringify(events),
    }
  } catch (e) {
    console.log(e)
    return {
      statusCode: 500,
    }
  }
}