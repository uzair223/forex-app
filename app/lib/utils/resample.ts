import _ from "lodash";

const milli = {
  M: 60 * 1000,
  H: 60 * 60 * 1000,
  D: 24 * 60 * 60 * 1000,
} as const;

export function parseTimeFrame(timeFrame: TimeFrameString) {
  const period = +timeFrame.substring(0, timeFrame.length - 1);
  const interval = timeFrame[timeFrame.length - 1] as "M" | "H" | "D";
  const periodMilli = period * milli[interval];
  return { period, periodMilli, interval };
}

export default function resample<TData extends TimeData>(
  data: TData[],
  timeFrame: TimeFrameString,
  aggregrateGroup?: undefined,
): TData[][];

export default function resample<TData extends TimeData, TReturn>(
  data: TData[],
  timeFrame: TimeFrameString,
  aggregrateGroup: (group: TData[]) => TReturn,
): TReturn[];

export default function resample<TData extends TimeData, TReturn>(
  data: TData[],
  timeFrame: TimeFrameString,
  aggregrateGroup?: (group: TData[]) => TReturn,
) {
  const { periodMilli } = parseTimeFrame(timeFrame);

  const groups = _(data)
    // ensure only data with period <= timeFrame is being used to compute groups
    .filter(d => (d.period ?? 0) <= periodMilli / 1000)
    .groupBy(d => Math.floor(+d.timestamp / periodMilli))
    .value();
  if (!aggregrateGroup) return _.values(groups);
  return _.map(groups, aggregrateGroup);
}
