import React, { useEffect, useMemo, useState } from "react";
import { subDays, getHours, getMinutes, getDay, startOfWeek, differenceInMinutes } from "date-fns";
import { useCalendar } from './CalendarContext';
import { endOfWeek } from "date-fns/esm";

interface EventResponse {
  public: boolean,
  status: string,
  summary: string,
  start: string;
  end: string;
}

async function fetchEvents(from: Date, to: Date): Promise<EventResponse[]> {
  const query = new URLSearchParams();
  query.set('from', from.toISOString());
  query.set('to', to.toISOString());
  try {
    const response = await fetch(`/api/get-events?${query}`);
    return response.json();
  } catch (e) {
    return [];
  }
}

interface EventProps {
  isPublic?: boolean;
  summary: string;
  start: string;
  end: string;
}

function Event({ isPublic = false, summary, start, end }: EventProps) {
  const color = isPublic ? { backgroundColor: '#b3e1f7', borderColor: '#81cdf2' } : { backgroundColor: '#f7b3b3', borderColor: '#f28181' };
  
  const { startHour, endHour } = useCalendar();

  const startHourOfDay = getHours(new Date(start));
  const endHourOfDay = getHours(new Date(end));

  if (startHourOfDay < 7 || startHourOfDay > endHour) {
    return null;
  }

  const date = new Date(start);
  const day = getDay(date);
  const duration = differenceInMinutes(new Date(end), new Date(start));

  const row = (startHourOfDay - startHour) + 2;
  let rowCount = ((endHourOfDay - startHour) + 2) - row || 1;
  let translate = (getMinutes(date) / 60) * 100;

  if (day > 5 || row > 10) {
    return null;
  }

  let height = 100;
  if (duration < 60) {
    height = duration / 60 * 100;
    translate = 100;
  }
  return (
    <div className="event" style={{ gridColumn: day + 2, gridRow: `${row}/span ${rowCount}`, transform: `translateY(${translate}%)`, height: `${height}%`, ...color }}>{summary}</div>
  );
}

export function Events() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const { time } = useCalendar();

  const from = useMemo(() => startOfWeek(time, { weekStartsOn: 1 }), [time]);
  const to = useMemo(() => subDays(endOfWeek(time, { weekStartsOn: 1 }), 2), [time]);
  
  useEffect(() => {
    async function getEvents() {
      setEvents([]);
      const res = await fetchEvents(from, to);
      setEvents(res);
    }
    getEvents();
  }, [from, to, setEvents])

  return (
    <>
      {events.map((event, i) => (
        <Event key={event.start + event.summary + i} start={event.start} end={event.end} summary={event.summary} isPublic={event.public} />
      ))}
    </>
  )
}
