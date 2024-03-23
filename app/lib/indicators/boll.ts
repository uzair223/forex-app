import _ from "lodash";
import { sma } from "./average";
import { stdev, window } from "./_helpers";

export function boll(
  data: SimpleCandle[],
  {
    length,
    n,
    source,
  }: {
    length: number;
    n: number;
    source: keyof SimpleCandleValues;
  },
) {
  const ma = sma(data, { length, source });
  const std = _(data)
    .map(source)
    .map(window<number>(length))
    .slice(length)
    .map(stdev)
    .map(x => x * n)
    .value();
  return {
    upper: _.zipWith(ma, std, ({ value, timestamp }, stdev) => ({
      timestamp,
      value: value + stdev,
    })) as Point[],
    lower: _.zipWith(ma, std, ({ value, timestamp }, stdev) => ({
      timestamp,
      value: value - stdev,
    })) as Point[],
    middle: ma,
  };
}
