import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { add, startOfDay } from "date-fns";

interface DateOffset {
  days: number;
  weeks: number;
  months: number;
}

interface CalendarContext {
  time: Date;
  today: Date;
  startHour: number;
  endHour: number;
  offset: DateOffset;
  setOffset: (offest: Partial<DateOffset>) => void;
}

const defaultContext = {
  time: new Date(),
  today: startOfDay(new Date()),
  startHour: 6,
  endHour: 18,
  offset: {
    days: 0,
    months: 0,
    weeks: 0,
  },
  setOffset: () => {}
};

export const Context = createContext<CalendarContext>(defaultContext);

export function useCalendar() {
  return useContext(Context);
}

interface CalendarProviderProps extends Partial<CalendarContext> {
  children: ReactNode;
}

export function CalendarProvider({ children, today, startHour, endHour, time, offset }: CalendarProviderProps) {
  const [currentOffset, setCurrentOffset] = useState({
    days: offset?.days ?? defaultContext.offset.days,
    weeks: offset?.weeks ?? defaultContext.offset.weeks,
    months: offset?.months ?? defaultContext.offset.months,
  });

  const setOffset = useCallback((partialOffset: Partial<DateOffset>) => {
    setCurrentOffset(curr => ({
      days: partialOffset?.days ?? curr.days,
      weeks: partialOffset?.weeks ?? curr.weeks,
      months: partialOffset?.months ?? curr.months,
    }));
  }, [setCurrentOffset]);

  const value = useMemo(() => ({
    time: add(time ?? defaultContext.time, currentOffset),
    today: add(today ?? defaultContext.today, currentOffset),
    startHour: startHour ?? defaultContext.startHour,
    endHour: endHour ?? defaultContext.endHour,
    offset: currentOffset,
    setOffset,
  }), [time, today, startHour, endHour, offset, setOffset, currentOffset]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  )
}
