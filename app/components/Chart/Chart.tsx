import React, { useEffect } from "react";
import Line from "./Line";
import * as d3 from "d3";

interface ChartProps extends React.SVGProps<SVGPathElement> {
  data?: Point[];
  options: {
    height: number;
    width: number;
    margin: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
}

function Chart({ data, options: { height, width, margin }, ...props }: ChartProps) {
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;
  const [random, setRandom] = React.useState<string>();

  useEffect(() => {
    const rand: [number, number][] = d3
      .range(0, innerWidth, innerWidth / 50)
      .map((v, i) => [v, innerHeight - i - d3.randomInt(innerHeight / 5)()]);
    rand.push([innerWidth, rand[rand.length - 1][1]]);
    setRandom(
      d3.line(
        d => d[0],
        d => d[1],
      )(rand) ?? undefined,
    );
  }, [innerHeight, innerWidth, setRandom]);

  if (!data?.length)
    return (
      <svg
        width={width}
        height={height}
        style={{
          height: "max-content",
          maxHeight: "100%",
        }}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          <Line
            innerWidth={innerWidth}
            innerHeight={innerHeight}
            lineString={random}
            strokeWidth={props.strokeWidth ?? 2}
            className="text-zinc-500 animate-pulse"
          />
        </g>
      </svg>
    );

  const X = (d: Point) => +d.timestamp;
  const Y = (d: Point) => d.value;

  const xScale = d3
    .scaleLinear()
    .domain(data.map(X))
    .range(d3.range(0, innerWidth, innerWidth / data.length));

  const yScale = d3
    .scaleLinear()
    .domain([d3.min(data.map(Y))!, d3.max(data.map(Y))!])
    .range([innerHeight, 0]);

  return (
    <svg
      width={width}
      height={height}
      style={{
        height: "max-content",
        maxHeight: "100%",
      }}
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {xScale.range().length <= 1 ? (
          <>
            <Line
              innerWidth={innerWidth}
              innerHeight={innerHeight}
              lineString={random}
              strokeWidth={props.strokeWidth ?? 2}
              className="text-zinc-500 animate-pulse"
            />
          </>
        ) : (
          <Line
            innerWidth={innerWidth}
            innerHeight={innerHeight}
            data={data}
            xScale={xScale}
            yScale={yScale}
            {...props}
          />
        )}
      </g>
    </svg>
  );
}

export default Chart;
