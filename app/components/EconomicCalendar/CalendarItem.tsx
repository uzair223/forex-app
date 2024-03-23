import { time } from "@/lib/utils/time";
import type { ICalendarItem } from "./EconomicCalendar";

function CalendarItem({ d, tz }: { d: ICalendarItem; tz: number }) {
  return (
    <div className={`p-2 scroll-mt-8 ${+d.date < Date.now() ? "text-zinc-400" : ""}`}>
      <div className="inline-flex gap-4 mb-2">
        <div className="w-max py-1">
          {d.code ? (
            <img
              className="mb-2 ms-auto shadow-md"
              width="24px"
              height="18px"
              src={`flags/${d.code}.svg`}
              alt={d.code}
            />
          ) : null}
          <div className="inline-flex gap-1">
            <span className="flex rounded-full shadow-md h-4 w-4 bg-green-500"></span>
            <span
              className={`flex rounded-full shadow-md h-4 w-4 bg-orange-500 ${
                d.impact < 2 ? "opacity-20" : ""
              }`}
            ></span>
            <span
              className={`flex rounded-full shadow-md h-4 w-4 bg-red-600 ${
                d.impact < 3 ? "opacity-20" : ""
              }`}
            ></span>
          </div>
        </div>

        <div>
          <p className={`leading-tight`}>{d.title}</p>
          <p className="text-zinc-400 text-xs">
            {time(d.date, tz, `%a %e %b %H:%M UTC${tz >= 0 ? "+" : ""}${tz}`)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 grid-rows-2 text-center">
        <span className="w-full text-sm">{d.previous || <>&ndash;</>}</span>
        <span className="w-full text-sm">{d.consensus || <>&ndash;</>}</span>
        <span className="w-full text-sm">{d.actual || <>&ndash;</>}</span>
        <span className="w-full text-xs text-zinc-400">Previous</span>
        <span className="w-full text-xs text-zinc-400">Consensus</span>
        <span className="w-full text-xs text-zinc-400">Actual</span>
      </div>
    </div>
  );
}

export default CalendarItem;
