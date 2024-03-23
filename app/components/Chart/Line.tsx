import { useDarkTheme } from "@/lib/hooks/useDarkTheme";
import { line } from "d3";
import type { ScaleLinear } from "d3";
import { useId } from "react";

interface LineProps extends React.SVGProps<SVGPathElement> {
  innerWidth?: number;
  innerHeight?: number;
  data?: Point[];
  xScale?: ScaleLinear<number, number, never>;
  yScale?: ScaleLinear<number, number, never>;
  lineString?: string;
  gradientFill?: boolean;
}

const X = (d: Point) => +d.timestamp;
const Y = (d: Point) => d.value;

const Line = ({
  innerWidth,
  innerHeight,
  data,
  xScale,
  yScale,
  lineString,
  gradientFill = true,
  strokeWidth,
  ...props
}: LineProps) => {
  const id = useId();
  const isDark = !!useDarkTheme()![0];

  const d = data?.length
    ? line<Point>()
        .x(d => xScale!(X(d)))
        .y(d => yScale!(Y(d)))(data!) ?? undefined
    : lineString;

  const a = `${d}${
    data?.length ? "L" + innerWidth + "," + yScale!(Y(data[data.length - 1])) : ""
  }L${innerWidth},0L0,0`;

  return (
    <g {...props}>
      <path stroke="currentColor" fill="none" strokeWidth={strokeWidth} d={d} />
      {gradientFill ? (
        <>
          <defs>
            <linearGradient id={id} gradientTransform="rotate(90)">
              <stop offset="0%" stopColor="white" />
              <stop offset="45%" stopColor="currentColor" />
            </linearGradient>
            <linearGradient id={`${id}-dark`} gradientTransform="rotate(90)">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="45%" stopColor="currentColor" />
            </linearGradient>
          </defs>
          <path
            stroke="none"
            fill={`url(#${id}${isDark ? "-dark" : ""})`}
            fillOpacity="25%"
            d={a}
          />
        </>
      ) : null}
    </g>
  );
};

export default Line;
