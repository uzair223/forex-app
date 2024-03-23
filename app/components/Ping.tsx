import { isWeekend, minutesTo } from "@/lib/utils/time";

interface PingProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  isActive: boolean;
  dataLoaded: boolean;
}
function Ping({ isActive, dataLoaded, className, ...props }: PingProps) {
  const minutesToOpen = Math.ceil(minutesTo(7, 10));
  const hoursToOpen = Math.ceil(minutesToOpen / 60);
  const daysToOpen = Math.floor(minutesToOpen / 1440);
  const weekend = isWeekend();
  
  return (
    <>
      <span className={"peer relative flex " + (className ?? "")} {...props}>
        <span
          className={
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 " +
            (isActive && dataLoaded
              ? "bg-green-500"
              : weekend && hoursToOpen <= 1
              ? "bg-blue-500"
              : "hidden")
          }
        ></span>
        <span
          className={
            "relative inline-flex rounded-full h-full w-full shadow " +
            (isActive && dataLoaded
              ? "shadow-green-500 bg-green-500"
              : dataLoaded && weekend
              ? hoursToOpen > 1
                ? "bg-zinc-400"
                : "shadow-blue-500 bg-blue-500"
              : "bg-red-500")
          }
        ></span>
      </span>
      {!isActive ? (
        <span className="w-max absolute text-xs border shadow-md bg-white/90 rounded-md py-1 px-2 opacity-0 left-2 translate-x-0 transition dark:bg-zinc-800/90 peer-hover:opacity-100 peer-hover:translate-x-4 z-50 pointer-events-none">
          {weekend ? (
            <>
              Market closed
              <br />
              Opens in&nbsp;
              {daysToOpen >= 1
                ? `${daysToOpen} day${daysToOpen > 1 ? "s" : ""}, ${hoursToOpen % 24} hour${
                    hoursToOpen % 24 > 1 ? "s" : ""
                  }`
                : hoursToOpen > 1
                ? `${hoursToOpen} hour${hoursToOpen > 1 ? "s" : ""}`
                : `${minutesToOpen} minute${minutesToOpen > 1 ? "s" : ""}`}
            </>
          ) : (
            <>
              Live feed closed
              <br />
              Try refreshing...
            </>
          )}
        </span>
      ) : null}
    </>
  );
}

export default Ping;
