const { google } = requre('googleapis');

const defaultScopes = ['https://www.googleapis.com/auth/calendar.events.readonly'];

const PrivateTest = process.env.EMAIL_PRIVATE_TEST;

export async function authorize(serviceAccount, scopes = defaultScopes) {
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

function scrubEvents(events) {
  const reg = new RegExp(PrivateTest, 'i');
  events.map(event => {
    const isPublic = reg.test(event.organizer.email);
    return {
      public: isPublic,
      status: event.status,
      summary: isPublic ? event.summary : 'Private',
      start: event.start,
      end: event.end,
    }
  })
}

export async function getEvents(auth, calendarId, from, to){
  const calendar = google.calendar({version: 'v3', auth });  
  return new Promise((res, rej) => {
    calendar.events.list({
      calendarId,
      orderBy: 'startTime',
      timeMin: from,
      timeMax: to,
    }, (err, resp) => {
      if (err) {
        rej(err);
      } else {
        const cleaned = scrubEvents(resp.data.items);
        res(cleaned);
      }
    })
  });
}

export function getServiceAccount() {
  try {
    return JSON.parse(process.env.SERVICE_ACCOUNT);
  } catch (e) {
    return undefined;
  }
}