import React, { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment-timezone";
import type countries from "@/_constants/countries.json";

interface SessionProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  name: string;
  flag: keyof typeof countries;
  tz: string;
  openHour?: number;
  closeHour?: number;
  collapse: boolean;
}

const workDays = [1, 2, 3, 4, 5];

const getNextWorkDay = (date: moment.Moment) => {
  const daysToAdd =
    workDays
      .map(day => (day - date.day() + 7) % 7)
      .filter(days => days > 0)
      .sort((a, b) => a - b)[0] || 7;
  return date.clone().add(daysToAdd, "days");
};

function Session({
  name,
  flag,
  tz,
  openHour: openHour = 8,
  closeHour: closeHour = 17,
  collapse,
  className,
  ...props
}: SessionProps) {
  const openTime = moment.tz(tz).hour(openHour).minute(0).second(0);
  const closeTime = moment.tz(tz).hour(closeHour).minute(0).second(0);

  const update = useCallback((): {
    now: moment.Moment;
    timeUntil: moment.Duration;
    status: "Opens" | "Closes";
  } => {
    const now = moment().tz(tz);
    // Check if today is a work day
    const isWorkDay = workDays.includes(now.day());
    // If it's not a work day, find the next work day
    if (!isWorkDay) {
      const nextOpenTime = getNextWorkDay(openTime).hour(openHour);
      return { now, timeUntil: moment.duration(nextOpenTime.diff(now)), status: "Opens" };
    }
    // If it's before the session open
    if (now.isBefore(openTime))
      return { now, timeUntil: moment.duration(openTime.diff(now)), status: "Opens" };
    // If it's before the session close
    if (now.isBefore(closeTime))
      return { now, timeUntil: moment.duration(closeTime.diff(now)), status: "Closes" };
    // After closing time, calculate time until next opening
    const nextOpenTime = getNextWorkDay(openTime).hour(openHour);
    return { now, timeUntil: moment.duration(nextOpenTime.diff(now)), status: "Opens" };
  }, [tz, openHour, closeHour]);

  const [data, setData] = useState(update());

  const timerRef = useRef<NodeJS.Timer>();
  useEffect(() => {
    timerRef.current = setInterval(() => setData(update()), 1000);
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className={"flex flex-row gap-4 " + (className ?? "")} {...props}>
      <div
        className={`h-full max-h-12 lg:max-h-20 aspect-square rounded-full border-4 overflow-hidden ${
          data.status === "Closes"
            ? data.timeUntil.asMinutes() <= 60
              ? "shadow-sm shadow-orange-500 border-orange-500"
              : "shadow-sm shadow-green-500 border-green-500"
            : data.timeUntil.asMinutes() <= 60
            ? "shadow-sm shadow-blue-500 border-blue-500"
            : "transition dark:border-zinc-700"
        }`}
      >
        <img className="w-full h-full object-cover" src={`flags/${flag}.svg`} alt={name} />
      </div>
      <div className={`${collapse ? "hidden" : "block"}`}>
        <p className="font-semibold">{name}</p>
        <p>{data.now.format("hh:mm:ss a")}</p>
        <p className="text-xs text-zinc-400">{data.now.format("ll")}</p>
        <p className="text-xs text-zinc-400">{`${data.status} in ${data.timeUntil.humanize()}`}</p>
      </div>
    </div>
  );
}

export default Session;
