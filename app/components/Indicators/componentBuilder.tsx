import React, { useMemo } from "react";
import Line from "../Chart/Line";
import type { ScaleLinear } from "d3";

interface ComponentProps {
  data: SimpleCandle[];
  xScale: ScaleLinear<number, number, never>;
  yScale: ScaleLinear<number, number, never>;
}

type Indicator = (data: SimpleCandle[], args: any) => Point[];
type MultiIndicator = (data: SimpleCandle[], args: any) => Record<string, Point[]>;

export function componentBuilder<T extends Indicator>(
  fn: T,
  displayName: string,
  args: Parameters<T>[1],
  props?: React.SVGProps<SVGLineElement>,
  overlay = true,
) {
  const Component = ({ data, xScale, yScale }: ComponentProps) => {
    const x = useMemo(() => fn(data, args), [data]);
    return <Line data={x} xScale={xScale} yScale={yScale} gradientFill={false} {...props} />;
  };
  Component.displayName = displayName;
  Component.overlay = overlay;
  Component.build = undefined;
  Component.buildArgs = undefined;
  return Component;
}

export function componentBuilderMulti<T extends MultiIndicator>(
  fn: T,
  displayName: string,
  args: Parameters<T>[1],
  props?: Record<keyof ReturnType<T>, React.SVGProps<SVGLineElement>>,
  overlay = true,
) {
  const Component = ({ data, xScale, yScale }: ComponentProps) => {
    const x = useMemo(() => fn(data, args), [data]);
    return (
      <g>
        {Object.entries(x).map(([k, v], i) => (
          <Line
            key={i}
            data={v}
            xScale={xScale}
            yScale={yScale}
            {...props?.[k]}
            gradientFill={false}
          />
        ))}
      </g>
    );
  };
  Component.displayName = displayName;
  Component.overlay = overlay;
  Component.build = undefined;
  Component.buildArgs = undefined;
  return Component;
}

export type IndicatorComponent = ReturnType<typeof componentBuilder>;
