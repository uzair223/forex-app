import type { ScaleLinear } from "d3";

interface CandlesProps {
  data: SimpleCandle[];
  candleWidth: number;
  xScale: ScaleLinear<number, number, never>;
  yScale: ScaleLinear<number, number, never>;
  bullProps: React.SVGLineElementAttributes<SVGLineElement>;
  bearProps: React.SVGLineElementAttributes<SVGLineElement>;
  wickProps: React.SVGLineElementAttributes<SVGLineElement>;
}

function Candles({
  data,
  candleWidth,
  xScale,
  yScale,
  bullProps,
  bearProps,
  wickProps,
}: CandlesProps) {
  return data.map((d, i) => (
    <g key={i}>
      <line
        x1={xScale(i) + candleWidth / 2}
        x2={xScale(i) + candleWidth / 2}
        y1={yScale(d.high)}
        y2={yScale(d.low)}
        strokeWidth={1}
        {...wickProps}
      />
      <line
        x1={xScale(i) + candleWidth / 2}
        x2={xScale(i) + candleWidth / 2}
        y1={yScale(d.close)}
        y2={yScale(d.open)}
        strokeWidth={candleWidth}
        {...(d.open < d.close ? bullProps : bearProps)}
      />
    </g>
  ));
}

export default Candles;
