import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSubscribe } from "@/lib/hooks/eventSource";
import { useDarkTheme } from "@/lib/hooks/useDarkTheme";
import { useTimezone } from "@/lib/hooks/useTimezone";
import type { IndicatorComponent } from "./Indicators/componentBuilder";

import Ping from "./Ping";
import CandlestickChart from "./Chart/CandlestickChart";
import IndicatorModal from "./Indicators/IndicatorModal";
import { MoonIcon, SunIcon } from "./icons";

import K from "@/_constants";
import resample, { parseTimeFrame } from "@/lib/utils/resample";
import { range } from "lodash";
import { time } from "@/lib/utils/time";
import buildIndicators from "./Indicators/indicatorBuilder";
import Spinner from "./Spinner";

interface MainProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  instrument: string;
  defaultTimeFrame: TimeFrameString;
  defaultOfferSide: "bid" | "ask";
}

function Main({ instrument, defaultTimeFrame, defaultOfferSide, className, ...props }: MainProps) {
  const { instrument: current, dataStream, setCurrent, isActive } = useSubscribe(instrument);
  const [offerSide, setOfferSide] = useState(defaultOfferSide);
  const [timeFrame, setTimeFrame] = useState(defaultTimeFrame);

  const [isDark, toggleDark] = useDarkTheme();
  const [tz, setTz] = useTimezone()!;
  const [modalOpen, setModalOpen] = useState(false);

  const dp = useMemo(
    () => K.DK_INSTRUMENTS.find(({ name }) => name === instrument)?.dp ?? 0,
    [instrument],
  );
  const { interval } = useMemo(() => parseTimeFrame(timeFrame), [timeFrame]);
  const resampled = useMemo(
    () =>
      dataStream?.length
        ? resample(dataStream, timeFrame, g => ({
            timestamp: new Date(g[0].timestamp),
            open: g[0][`${offerSide}_open`],
            high: Math.max(
              ...g.flatMap(v => [
                v[`${offerSide}_open`],
                v[`${offerSide}_close`],
                v[`${offerSide}_high`],
              ]),
            ),
            low: Math.min(
              ...g.flatMap(v => [
                v[`${offerSide}_open`],
                v[`${offerSide}_close`],
                v[`${offerSide}_low`],
              ]),
            ),
            close: g[g.length - 1][`${offerSide}_close`],
          })).slice(1)
        : undefined,
    [dataStream, offerSide, timeFrame],
  );

  useEffect(() => {
    setCurrent(instrument);
  }, [instrument, setCurrent]);

  // Loading and serializing indicators
  const [indicators, setIndicators] = useState<IndicatorComponent[]>([]);
  useEffect(() => {
    const parsed: { id: keyof typeof buildIndicators; buildArgs: any }[] = JSON.parse(
      localStorage.getItem("indicators") ?? "[]",
    );
    setIndicators(
      parsed.map(({ id, buildArgs }) => {
        return Object.assign(buildIndicators[id]?.(buildArgs), {
          buildArgs,
        });
      }),
    );
  }, []);

  const serialize = (x: IndicatorComponent[]) => {
    console.log(x);
    localStorage.setItem(
      "indicators",
      JSON.stringify(
        x.filter(({ id }) => id !== null).map(({ id, buildArgs }) => ({ id, buildArgs })),
      ),
    );
  };

  const [size, setSize] = useState({ width: 1, height: 1 });
  const ref = useRef<HTMLDivElement>(null);
  const onResize = useCallback(() => {
    if (ref.current) setSize({ width: ref.current.clientWidth, height: ref.current.clientHeight });
  }, []);
  useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  const [now, setNow] = useState(time(Date.now(), tz, "%a %H:%M:%S"));
  const timerRef = useRef<NodeJS.Timer>();
  useEffect(() => {
    timerRef.current = setInterval(() => setNow(time(Date.now(), tz, "%a %H:%M:%S")), 1000);
    return () => clearInterval(timerRef.current);
  }, [tz]);

  return (
    <>
      {modalOpen ? (
        <IndicatorModal
          open={modalOpen}
          setOpen={setModalOpen}
          add={x =>
            setIndicators(v => {
              const y = [...v, x];
              serialize(y);
              return y;
            })
          }
        />
      ) : null}
      <div className={"flex flex-col w-full h-full " + (className ?? "")} {...props}>
        <div className="flex justify-between w-full pl-2 mb-2">
          <div className="relative inline-flex items-center">
            <Ping className="w-3 h-3" isActive={isActive} dataLoaded={dataStream?.length > 0} />
            <span className="text-2xl font-mono font-semibold px-2">{instrument}</span>
            &ndash;
            <select
              className="outline-none appearance-none bg-transparent dark:focus:bg-zinc-800 px-2"
              name="os-select"
              defaultValue={defaultOfferSide}
              onChange={e => {
                setOfferSide(e.currentTarget.value as "bid" | "ask");
              }}
            >
              <option value="bid">Bid</option>
              <option value="ask">Ask</option>
            </select>
            <select
              className="outline-none appearance-none bg-transparent dark:focus:bg-zinc-800 px-2 -translate-x-2"
              name="timeframe-select"
              defaultValue={timeFrame}
              onChange={e => {
                setTimeFrame(e.currentTarget.value as TimeFrameString);
              }}
            >
              <option>1M</option>
              <option>3M</option>
              <option>5M</option>
              <option>15M</option>
              <option>30M</option>
              <option>1H</option>
              <option>2H</option>
              <option>4H</option>
              <option>8H</option>
              <option>1D</option>
            </select>
          </div>
          <div className="inline-flex items-center gap-2">
            <div className="flex items-center justify-center w-full">
              <label className="flex items-center cursor-pointer">
                <label htmlFor="theme-toggle" className="hidden">
                  Theme
                </label>
                <div className="relative">
                  <input
                    id="theme-toggle"
                    type="checkbox"
                    className="peer sr-only"
                    checked={!!isDark}
                    onChange={toggleDark}
                  />
                  <div className="block bg-zinc-500 w-10 h-6 rounded-full"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 transition peer-checked:translate-x-full">
                    <MoonIcon
                      className={`w-full h-full fill-white transition ${
                        isDark ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>
                  <div className="absolute left-1 top-1 w-4 h-4 transition peer-checked:translate-x-full">
                    <SunIcon
                      className={`w-full h-full fill-white transition ${
                        isDark ? "opacity-0" : "opacity-100"
                      }`}
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex-auto overflow-hidden" ref={ref}>
          {resampled?.length ? (
            <CandlestickChart
              data={resampled}
              options={{
                ...size,
                margin: { top: 0, bottom: 0, left: 0, right: 40 },
                candlePadding: 0.25,
                yPadding: 0.05,
                initialDisplay: 100,
                dp,
                tz,
                timeFrameInterval: interval,
                bullProps: { className: "stroke-green-600" },
                bearProps: { className: "stroke-red-600" },
                wickProps: { className: "stroke-zinc-400 transition dark:stroke-zinc-600" },
                crosshairProps: {
                  className: "stroke-zinc-300 transition dark:stroke-zinc-700",
                  strokeDasharray: "5",
                },
              }}
              indicators={indicators}
              changeDeps={[current, timeFrame, offerSide]}
            >
              <ul className="text-xs w-fit pl-2 cursor-pointer pointer-events-auto">
                {indicators.map((component, i) => (
                  <li className="font-mono first:mt-2" key={i}>
                    {component.displayName}
                    <span
                      className="cursor-pointer text-base text-zinc-500 px-1 transition hover:text-zinc-600"
                      onClick={() => {
                        setIndicators(v => {
                          const x = [...v];
                          x.splice(i, 1);
                          serialize(x);
                          return x;
                        });
                      }}
                    >
                      &#215;
                    </span>
                  </li>
                ))}
                <li
                  className="group/add cursor-pointer mt-1 first:mt-0 px-1"
                  onClick={() => setModalOpen(true)}
                >
                  <span className="text-base text-zinc-500 transition group-hover/add:text-zinc-600">
                    +
                  </span>
                  &nbsp;Add indicators
                </li>
              </ul>
            </CandlestickChart>
          ) : (
            <Spinner />
          )}
        </div>
        <div className="text-xs">
          {now}
          <select
            className="outline-none bg-transparent dark:focus:bg-zinc-800"
            name="tz-select"
            defaultValue={tz}
            onChange={e => setTz(+e.currentTarget.value)}
          >
            {range(-12, 13).map((d, i) => (
              <option value={d} key={i}>
                UTC{d >= 0 ? "+" : ""}
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

export default Main;
