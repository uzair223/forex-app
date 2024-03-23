import React, { useEffect, useRef, useState } from "react";
import moment from "moment-timezone";
import type countries from "@/_constants/countries.json";

interface SessionProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  name: string;
  flag: keyof typeof countries;
  tz: string;
  localStart?: string;
  localEnd?: string;
  collapse: boolean;
}

const isWeekend = (d: moment.Moment) => (d.weekday() === 6) || (d.weekday()  === 0)
function Session({
  name,
  flag,
  tz,
  localStart,
  localEnd,
  collapse,
  className,
  ...props
}: SessionProps) {

  const sessionStart = moment(localStart || "08:00:00", "hh:mm:ss");
  const sessionEnd = moment(localEnd || "16:00:00", "hh:mm:ss");

  const update = () => {
    const now = moment().tz(tz)
    const sessionOpen = now.isBetween(sessionStart, sessionEnd) && !isWeekend(now);

    const nextOpenDate = now.clone().set({ hour: sessionStart.hour(), minute: sessionStart.minute(), second: sessionStart.second() }).add(now.weekday() === 5 ? 3 : now.weekday() === 6 ? 2 : 1, "day")
    const nextOpenStr = "Opens "+now.to(nextOpenDate)
    const nextOpenDuration = moment.duration(nextOpenDate.diff(now));
    
    const nextCloseDate = now.clone().set({ hour: sessionEnd.hour(), minute: sessionEnd.minute(), second: sessionEnd.second() })
    const nextCloseStr = "Closes "+now.to(nextCloseDate)
    const nextCloseDuration = moment.duration(nextCloseDate.diff(now));
    
    return { now, sessionOpen, nextOpenDuration, nextOpenStr, nextCloseDuration, nextCloseStr }
  }

  const [data, setData] = useState(update())

  const timerRef = useRef<NodeJS.Timer>();
  useEffect(() => {
    timerRef.current = setInterval(() => setData(update()), 1000);
    return () => {
      clearInterval(timerRef.current);
    }
  }, []);


  return (
    <div className={"flex flex-row gap-4 " + (className ?? "")} {...props}>
      <div
        className={`max-h-12 lg:max-h-20 aspect-square rounded-full border-4 overflow-hidden ${
          data.sessionOpen
            ? data.nextCloseDuration.asMinutes() <= 60
              ? "shadow-sm shadow-orange-500 border-orange-500"
              : "shadow-sm shadow-green-500 border-green-500"
            : data.nextOpenDuration.asMinutes() <= 60
              ? "shadow-sm shadow-blue-500 border-blue-500"
              : "transition dark:border-zinc-700"
        }`}
      >
        <img className="w-full h-full object-cover" src={`flags/${flag}.svg`} alt={name} />
      </div>
      <div className={`hidden ${collapse ? "" : "lg:block"}`}>
        <p className="font-semibold">{name}</p>
        <p>{data.now.format("hh:mm:ss a")}</p>
        <p className="text-xs text-zinc-400">
          {data.now.format('ll')}
        </p>
        <p className="text-xs text-zinc-400">
          {data.sessionOpen
            ? data.nextCloseStr
            : data.nextOpenStr
          }
        </p>
      </div>
    </div>
  );
}

export default Session;
