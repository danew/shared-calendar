import React from "react";
import { add, addDays, format, getHours, getMinutes, getDay, startOfWeek } from "date-fns";
import { useCalendar } from './CalendarContext';
import { Events } from './Events';
import "./calendar.css";

function CurrentTime() {
  const { time, startHour } = useCalendar();
  const day = getDay(time);
  const hour = getHours(time);
  const mins = getMinutes(time);
  const percentage = mins/60 * 100;
  return (
    <div className="current-time" style={{ gridColumn: day + 2, gridRow: hour - startHour + 2, top: `${percentage}%` }}>
      <div className="circle"></div>
    </div>
  )
}

interface TimeRowProps {
  row: number;
  time: Date;
}

function TimeRow({ row, time }: TimeRowProps) {
  return (
    <div className="time" style={{ gridRow: row }}>
      {format(time, "h:mmaaa")}
    </div>
  );
}

interface TimeColumnProps {
}

function TimeColumn({}: TimeColumnProps) {
  const { startHour, endHour, today } = useCalendar();
  const range = Array.from({ length: endHour - startHour }, (_, i) => i + startHour);
  return (
    <>
      {range.map((hour, i) => {
        const time = add(today, { hours: hour });
        return <TimeRow key={i} row={i + 1} time={time} />
      })}
    </>
  )
}

function Rows() {
  const { startHour, endHour } = useCalendar();
  const range = Array.from({ length: endHour - startHour }, (_, i) => i);
  return (
    <>
      {range.map((hour) => {
        return <div key={hour} className="row" style={{ gridRow: hour }}></div>
      })}
    </>
  )
}

function Columns() {
  const { startHour, endHour } = useCalendar();
  const range = Array.from({ length: endHour - startHour }, (_, i) => i + 3);
  return (
    <>
      {range.map((hour) => {
        return <div key={hour} className="col" style={{ gridColumn: hour }}></div>
      })}
    </>
  )
}

function WeekDays() {
  const { time } = useCalendar();
  const monday = startOfWeek(time, { weekStartsOn: 1 });
  const range = Array.from({ length: 5 }, (_, i) => addDays(monday, i));
  return (
    <div className="days">
      <div className="filler" />
      <div className="filler" />
      {range.map((date, i) => {
        return <div key={i} className="day">{format(date, 'EEEE do')}</div>
      })}
    </div>
  )
}

export function Calendar() {
  const { today, setOffset, offset } = useCalendar();

  return (
    <div className="container">
      <div className="header">
        <button onClick={() => setOffset({ weeks: offset.weeks - 1 })}>Previous</button>
        <div className="title">{format(today, "MMMM")}</div>
        <button onClick={() => setOffset({ weeks: offset.weeks + 1 })}>Next</button>
      </div>
      <WeekDays />
      <div className="content">
        <TimeColumn />
        <div className="filler-col" />
        <Columns />
        <Rows />
        <Events />
        <CurrentTime />
      </div>
    </div>
  );
}
