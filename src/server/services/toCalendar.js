const { google } = require('googleapis')
const fs = require('fs')


const keyFile = 'service-account-key.json'
const SCOPES = ['https://www.googleapis.com/auth/calendar']

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: SCOPES,
})

module.exports.createEvent() = async function () {
  const calendar = google.calendar({ version: 'v3', auth })

  const event = {
    summary: 'Meeting with Bob',
    location: 'Online',
    description: 'Discuss project details.',
    start: {
      dateTime: '2024-12-25T10:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: '2024-12-25T11:00:00-07:00',
      timeZone: 'America/Los_Angeles',
    },
    attendees: [{ email: 'bob@example.com' }],
  }

  try {
    const result = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    })

    console.log('Event created:', result.data.htmlLink)
  } catch (error) {
    console.error('Error creating event:', error)
  }
}


