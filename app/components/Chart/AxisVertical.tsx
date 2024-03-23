import type { ScaleLinear } from "d3";

interface AxisBottomProps {
  yScale: ScaleLinear<number, number, never>;
  innerWidth: number;
  tickOffset: number;
  dp: number;
  alignLeft?: boolean;
}
function AxisVertical({ yScale, innerWidth, tickOffset, dp, alignLeft = true }: AxisBottomProps) {
  const textAnchor = alignLeft ? "start" : "end";
  const xoff = alignLeft ? 0 : innerWidth;
  return yScale.ticks().map((y, i) => (
    <g key={i} transform={`translate(0,${yScale(y)})`}>
      <text className="text-xs fill-zinc-400" style={{ textAnchor }} x={xoff + tickOffset}>
        {y.toFixed(dp)}
      </text>
    </g>
  ));
}

export default AxisVertical;
