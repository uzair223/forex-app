import React, { useRef, useState, useEffect, useMemo } from "react";
import { useSseContext, useSubscribe } from "@/lib/hooks/eventSource";

import Chart from "./Chart/Chart";
import Ping from "./Ping";

import K from "@/_constants";
import resample from "@/lib/utils/resample";
import { isWeekend } from "@/lib/utils/time";

const down = "text-red-500 font-medium tracking-normal";
const up = "text-green-500 font-medium tracking-normal";

interface InstrumentCardProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  defaultInstrument: string;
  defaultTimeFrame: TimeFrameString;
  lookBack: number;
}

function InstrumentCard({
  defaultInstrument,
  defaultTimeFrame,
  lookBack,
  className,
  onClick,
  ...props
}: InstrumentCardProps) {
  const { subscriptions } = useSseContext()!;
  const { dataStream, instrument, changeSubscription, isActive } = useSubscribe(defaultInstrument);
  const ref = useRef<HTMLDivElement>(null);

  const [timeFrame, setTimeFrame] = useState(defaultTimeFrame);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [dayOpen, setDayOpen] = useState<number>();

  useEffect(() => {
    if (!dataStream?.length) return;
    setDayOpen(
      dataStream
        .slice(-1440)
        .reverse()
        .find(d => +d.timestamp % 86400000 < K.DELAY * 1000)?.bid_open,
    );
  }, [dataStream]);

  useEffect(() => {
    const onResize = () => {
      if (ref.current)
        setSize({ width: ref.current.clientWidth, height: ref.current.clientHeight });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const { bid_close, bid_open, ask_close, ask_open } = useMemo(
    () => dataStream?.[dataStream?.length - 1] ?? {},
    [dataStream],
  );

  const dp = useMemo(
    () => K.DK_INSTRUMENTS.find(({ name }) => name === instrument)!.dp,
    [instrument],
  );

  const resampled = useMemo(
    () =>
      dataStream?.length
        ? resample(dataStream, timeFrame, g => ({
            timestamp: new Date(g[0].timestamp),
            value: g[g.length - 1].bid_close,
          })).slice(-(lookBack ?? 100))
        : undefined,
    [dataStream, lookBack, timeFrame],
  );

  const chgPct = useMemo(
    () => (dayOpen ? (bid_close / dayOpen - 1) * 100 : undefined),
    [dayOpen, bid_close],
  );
  return (
    <div
      className={
        "relative group w-full min-h-[8rem] bg-white transition dark:bg-zinc-800 rounded-md p-2 cursor-pointer " +
          className ?? ""
      }
      {...props}
    >
      <div className="flex flex-col w-full h-full">
        <div className="w-full flex flex-col leading-tight">
          <div className="relative inline-flex items-center cursor-default">
            <Ping
              className="w-2 h-2 z-20"
              isActive={isActive}
              dataLoaded={dataStream?.length > 0}
            />
            <select
              title={`${instrument} change instrument`}
              id="instrument-select"
              name="instrument-select"
              className="px-2 -translate-x-1 font-mono font-semibold outline-none appearance-none bg-transparent dark:focus:bg-zinc-800 z-10 hover:underline focus:underline"
              defaultValue={instrument}
              onChange={e => {
                changeSubscription(e.currentTarget.value);
              }}
            >
              {K.DK_INSTRUMENT_NAMES.map((v, i) => (
                <option disabled={subscriptions.includes(v)} key={i}>
                  {v}
                </option>
              ))}
              &emsp;
            </select>
            <span
              className={
                "text-xs tracking-tight -translate-x-2 " +
                (typeof chgPct === "undefined"
                  ? "hidden"
                  : chgPct < 0
                  ? "text-red-500"
                  : "text-green-500")
              }
            >
              {(chgPct ?? 0) > 0 ? "+" : ""}
              {chgPct?.toFixed(2)}%
            </span>
          </div>
          <div className="text-xs tracking-tight text-zinc-400">
            <span
              className={
                isActive ? (bid_close > bid_open ? up : bid_close < bid_open ? down : "") : ""
              }
            >
              {bid_close?.toFixed(dp)}
            </span>
            &nbsp;&bull;&nbsp;
            <span
              className={
                isActive ? (ask_close > ask_open ? up : ask_close < ask_open ? down : "") : ""
              }
            >
              {ask_close?.toFixed(dp)}
            </span>
          </div>
        </div>
        <div className="w-full h-full flex-auto overflow-hidden" onClick={onClick} ref={ref}>
          <Chart
            data={resampled!}
            options={{
              ...size,
              margin: { top: 10, bottom: 10, left: 0, right: 0 },
            }}
            className={
              "transition duration-500 " +
              (typeof chgPct === "undefined" || isWeekend()
                ? "text-zinc-500 group-hover:text-zinc-400"
                : chgPct < 0
                ? "text-red-600 group-hover:text-red-500"
                : "text-green-600 group-hover:text-green-500")
            }
            strokeWidth={2}
          />
        </div>
      </div>
      <select
        title={`${instrument} change timeframe`}
        id="timeframe-select"
        name="timeframe-select"
        className="absolute bottom-0 left-0 outline-none text-xs md:text-sm bg-transparent dark:focus:bg-zinc-800 hover:underline focus:underline"
        onChange={e => setTimeFrame(e.currentTarget.value as TimeFrameString)}
        value={timeFrame}
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
  );
}

export default InstrumentCard;
