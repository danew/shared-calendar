const { isBefore, isAfter } = require('date-fns');
const { google } = require('googleapis');

const defaultScopes = ['https://www.googleapis.com/auth/calendar.events.readonly'];

const PrivateTest = process.env.EMAIL_PRIVATE_TEST;

exports.authorize = async function authorize(serviceAccount, scopes = defaultScopes) {
  const jwtClient = new google.auth.JWT(serviceAccount.client_email, null, serviceAccount.private_key, scopes);
  return new Promise((res, rej) => {
    jwtClient.authorize((err) => {
      if (err) {
        rej(err);
      } else {
        res(jwtClient)
      }
    })
  });  
}

function scrubEvents(events, from, to) {
  const reg = new RegExp(PrivateTest, 'i');
  const start = new Date(from);
  const end = new Date(to);
  return events
    .filter(event => event.status !== 'cancelled')
    .filter(event => isAfter(new Date(event.start.dateTime), start) && isBefore(new Date(event.end.dateTime), end))
    .map(event => {
      const isPublic = event && event.organizer && event.organizer.email && reg.test(event.organizer.email);
      return {
        public: isPublic,
        status: event.status,
        summary: isPublic ? event.summary : 'Private',
        start: event.start.dateTime,
        end: event.end.dateTime,
      }
    });
}

exports.getEvents = async function getEvents(auth, calendarId, from, to){
  const calendar = google.calendar({version: 'v3', auth });  
  return new Promise((res, rej) => {
    calendar.events.list({
      calendarId,
      timeMin: from,
      timeMax: to,
    }, (err, resp) => {
      if (err) {
        console.error(err);
        rej('Failed to fetch events');
      } else {
        const cleaned = scrubEvents(resp.data.items, from, to);
        res(cleaned);
      }
    })
  });
}

exports.getServiceAccount = function getServiceAccount() {
  try {
    const base = JSON.parse(process.env.SERVICE_ACCOUNT);
    return {
      ...base,
      private_key: base.private_key.replace(/\\n/gm, '\n')
    }
  } catch (e) {
    return undefined;
  }
}