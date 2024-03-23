import _ from "lodash";
import { window, mean } from "./_helpers";

export const sma = (
  data: SimpleCandle[],
  args: {
    length: number;
    source: keyof SimpleCandleValues;
  },
): Point[] =>
  _(data)
    .map(args.source)
    .map(window<number>(args.length))
    .slice(args.length)
    .map(mean)
    .map((v, i) => ({
      timestamp: i + args.length,
      value: v,
    }))
    .value();

export const ema = (
  data: SimpleCandle[],
  {
    length,
    source,
  }: {
    length: number;
    source: keyof SimpleCandleValues;
  },
): Point[] => {
  const k = 2 / (length + 1);
  return _(data)
    .map(source)
    .reduce(
      (p, n, i) => (i ? p.concat(n * k + (p[p.length - 1] * (length - 1)) / (length + 1)) : p),
      [data[0][source]],
    )
    .map((v, i) => ({
      timestamp: i,
      value: v,
    }));
};
