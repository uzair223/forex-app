import type { SVGProps } from "react";

import { componentBuilder, componentBuilderMulti } from "./componentBuilder";
import { ema, sma } from "@/lib/indicators/average";
import { boll } from "@/lib/indicators/boll";

interface AverageProps {
  length: number;
  source: keyof SimpleCandleValues;
  props: SVGProps<SVGLineElement>;
}

interface BBProps {
  length: number;
  n: number;
  source: keyof SimpleCandleValues;
  props: Record<keyof ReturnType<typeof boll>, React.SVGProps<SVGLineElement>>;
}

export const buildEMA = ({ length, source, props }: AverageProps) =>
  componentBuilder(ema, "ema", `EMA(${length})`, { length, source }, props);

export const buildSMA = ({ length, source, props }: AverageProps) =>
  componentBuilder(sma, "sma", `SMA(${length})`, { length, source }, props);

export const buildBB = ({ length, n, source, props }: BBProps) =>
  componentBuilderMulti(boll, "bb", `BB(${length},${n})`, { length, n, source }, props);

export default { ema: buildEMA, sma: buildSMA, bb: buildBB };
