import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";

import type { IndicatorComponent } from "../Indicators/componentBuilder";

import * as d3 from "d3";
import AxisVertical from "./AxisVertical";

import { time } from "@/lib/utils/time";
import { ResetIcon } from "../icons";
import Candles from "./Candles";

import colors from "tailwindcss/colors";


interface CandlestickProps extends React.PropsWithChildren {
  data: SimpleCandle[];
  options: {
    height: number;
    width: number;
    margin: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    candlePadding: number;
    yPadding: number;
    initialDisplay: number;
    dp: number;
    tz: number;
    timeFrameInterval: "M" | "H" | "D";
    bullProps: React.SVGLineElementAttributes<SVGLineElement>;
    bearProps: React.SVGLineElementAttributes<SVGLineElement>;
    wickProps: React.SVGLineElementAttributes<SVGLineElement>;
    crosshairProps: React.SVGLineElementAttributes<SVGLineElement>;
  };
  indicators?: IndicatorComponent[];
  changeDeps?: any[];
}

const MIN_WIDTH = 3;


const TextBgFilter = (props:{id: string, color: string}) =>
<filter x="0" y="0" width="1" height="1" id={props.id}>
  <feFlood floodColor={props.color} result="bg"/>
  <feMerge>
    <feMergeNode in="bg"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>

function CandlestickChart({
  data,
  options: {
    height,
    width,
    margin,
    candlePadding,
    yPadding,
    initialDisplay,
    dp,
    tz,
    timeFrameInterval,
    bullProps,
    bearProps,
    wickProps,
    crosshairProps,
  },
  indicators,
  changeDeps = [],
  children,
}: CandlestickProps) {
  const [scale, setScale] = useState<{
    x: d3.ScaleLinear<number, number>;
    y: d3.ScaleLinear<number, number>;
  }>();

  const l = useMemo(() => data[data.length - 1], [data]);
  const innerHeight = useMemo(() => height - margin.top - margin.bottom, [height, margin]);
  const innerWidth = useMemo(() => width - margin.left - margin.right, [width, margin]);
  const initialScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, data.length + 5])
        .range([0, innerWidth]),
    [data, innerWidth],
  );

  useEffect(() => {
    setScale(v =>
      v
        ? {
            x: d3.scaleLinear().domain(v.x.domain()).range([0, innerWidth]),
            y: d3.scaleLinear().domain(v.y.domain()).range([innerHeight, 0]),
          }
        : undefined,
    );
  }, [innerWidth, innerHeight]);

  const calcDomain = (data: SimpleCandle[], yPadding: number) => {
    const mi = d3.min(data.map(d => d.low))!;
    const ma = d3.max(data.map(d => d.high))!;
    const r = ma - mi;
    return [mi - r * yPadding, ma + r * yPadding];
  };

  const candleWidth = useMemo(() => {
    return scale ? (scale.x(1) - scale.x(0)) * (1 - candlePadding) : 0;
  }, [scale, candlePadding]);

  const ref = useRef<any>(null);
  const zoomRef = useRef<d3.ZoomBehavior<Element, any>>();
  const zoomed = useCallback(
    (t: d3.ZoomTransform) => {
      setScale(() => {
        const x = t.rescaleX(initialScale);
        const [a, b] = x.domain() as [number, number];
        const slice = data.slice(Math.floor(a), Math.ceil(b));
        const y = d3
          .scaleLinear()
          .domain(calcDomain(slice, yPadding))
          .nice()
          .range([innerHeight, 0]);
        return { x, y };
      });
    },
    [initialScale, innerHeight, data, yPadding],
  );
  const resetZoom = useCallback(
    (zoom?: d3.ZoomBehavior<Element, any>) => {
      const svg = d3.select(ref.current);
      const si = Math.max(1, (MIN_WIDTH * data.length) / innerWidth, data.length / initialDisplay);
      const zoomIdentity = d3.zoomIdentity.scale(si).translate((-innerWidth * (si - 1)) / si, 0);
      zoomed(zoomIdentity);
      // @ts-ignore
      svg.call(zoom?.transform ?? zoomRef.current?.transform, zoomIdentity);
    },
    [data.length, initialDisplay, innerWidth, zoomed],
  );

  // reset scales and zoom when data changes
  useEffect(() => {
    zoomRef.current = undefined;
    setScale(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...changeDeps]);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    const extent: [[number, number], [number, number]] = [
      [0, 0],
      [innerWidth, 0],
    ];
    const s = Math.max(1, (MIN_WIDTH * data.length) / innerWidth);
    const zoom = d3
      .zoom()
      .translateExtent(extent)
      .extent(extent)
      .scaleExtent([s, s * 10])
      .on("zoom", e => {
        d3.select("#tooltip").style("opacity", 0);
        d3.select("#mouse").style("opacity", 0);
        zoomed(e.transform);
      });
    svg.call(zoom);
    if (zoomRef.current) return;
    resetZoom(zoom);
    zoomRef.current = zoom;
  }, [innerWidth, innerHeight, scale, data.length, zoomed, resetZoom]);

  const timeDetailed = (d: number | Date) =>
    time(
      d,
      tz,
      {
        M: "%a %d %H:%M",
        H: "%a %d %H:%M",
        D: "%a %d %b",
      }[timeFrameInterval],
    );

  const tooltip = (d: SimpleCandle) => {
    return d3.select("#tooltip").style("opacity", 100).html(`
    <span class="font-semibold">${timeDetailed(d.timestamp)}</span>&nbsp;&ndash;&nbsp;
    <span class=${d.close > d.open ? "text-green-500" : "text-red-500"}>
      O: ${d.open.toFixed(dp)}&nbsp;H: ${d.high.toFixed(dp)}&nbsp;L: ${d.low.toFixed(
        dp,
      )}&nbsp;C: ${d.close.toFixed(dp)}
    </span>
    `);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    d3.select("#children").style("opacity", 100);
    d3.select("#reset").style("opacity", 100);

    const bbox = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bbox.left;
    const y = e.clientY - bbox.top;
    const d = data[Math.min(data.length - 1, Math.floor(scale?.x.invert(x) ?? data.length - 1))];
    tooltip(d);

    d3.select("#mouse").style("opacity", 100);
    d3.select("#mouse-vline").attr("x1", x).attr("x2", x);
    d3.select("#mouse-hline").attr("y1", y).attr("y2", y);
    const { width } = (
      d3.select("#mouse-x text").text(timeDetailed(d.timestamp)).node() as SVGTextElement
    ).getBoundingClientRect();
    d3.select("#mouse-x").attr(
      "transform",
      `translate(${Math.max(width / 2, Math.min(x, innerWidth - width / 2))},-5)`,
    );
    const { height } = (
      d3
        .select("#mouse-y text")
        .text(scale?.y.invert(y).toFixed(dp) ?? null)
        .node() as SVGTextElement
    ).getBoundingClientRect();
    d3.select("#mouse-y").attr(
      "transform",
      `translate(0,${Math.max(height / 2 + 2, Math.min(y, innerHeight - height / 2))})`,
    );
  };

  const onMouseLeave = () => {
    d3.select("#children").style("opacity", 0);
    d3.select("#reset").style("opacity", 0);
    d3.select("#mouse").style("opacity", 0);
    tooltip(l);
  };

  return (
    <div
      className="group/overlay relative cursor-crosshair select-none"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute flex flex-col w-full h-full pointer-events-none" id="overlay">
        <div
          id="tooltip"
          className="w-fit text-xs px-2 bg-gradient-to-b from-white dark:from-zinc-800 from-60%"
        >
          <span className="font-semibold">{timeDetailed(l.timestamp)}</span>&nbsp;&ndash;&nbsp;
          <span className={l.close > l.open ? "text-green-500" : "text-red-500"}>
            O: {l.open.toFixed(dp)}
            &nbsp;H: {l.high.toFixed(dp)}
            &nbsp;L: {l.low.toFixed(dp)}
            &nbsp;C: {l.close.toFixed(dp)}
          </span>
        </div>
        
        <div
          className="absolute bottom-0 inline-flex gap-1 p-2 pl-0 transition opacity-0 group-hover/overlay:opacity-100 bg-white dark:bg-zinc-800 cursor-pointer pointer-events-auto"
          onClick={() => resetZoom()}
        >
          <ResetIcon className="w-4 h-4 fill-zinc-500 transition group-hover/reset:fill-zinc-600" />
          <span className="text-xs">Reset scale</span>
        </div>

        <div id="children" style={{ opacity: 0 }} className="transition">
          {children}
        </div>
      </div>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: "100%", height: "auto" }}
        ref={ref}
      >
        {scale ? (
          <>
            <defs>
              <TextBgFilter id="axis-mouse" color={colors.blue[500]}/>
              <TextBgFilter id="axis-price-red" color={colors.red[500]}/>
              <TextBgFilter id="axis-price-green" color={colors.green[500]}/>
            </defs>
            <g transform={`translate(${margin.left},${margin.top})`}>
              <g id="candles">
                <Candles
                  data={data}
                  candleWidth={candleWidth}
                  xScale={scale.x}
                  yScale={scale.y}
                  bullProps={bullProps}
                  bearProps={bearProps}
                  wickProps={wickProps}
                />
              </g>
              <g id="indicators">
                {indicators
                  ?.filter(({ overlay }) => overlay)
                  .map((Component, i) => (
                    <Component key={i} data={data} xScale={scale.x} yScale={scale.y} />
                  ))}
              </g>
            </g>
            <g>
              <AxisVertical
                yScale={scale.y}
                innerWidth={innerWidth}
                tickOffset={margin.right}
                dp={dp}
                alignLeft={false}
              />
              <g>
                <text
                  filter={`url(#axis-price-${l.close > l.open ? "green" : "red"})`}
                  className="text-xs fill-white"
                  textAnchor="end"
                  alignmentBaseline="middle"
                  x={innerWidth + margin.right}
                  y={scale.y(l.close)}
                >
                  {l.close.toFixed(dp)}
                </text>
              </g>
            </g>
            <g
              id="mouse"
              style={{
                transition: "opacity 0.2s",
                opacity: "0",
              }}
            >
              
              <g {...crosshairProps}>
                <line id="mouse-hline" x1={innerWidth} x2={margin.left} />
                <line id="mouse-vline" y1={margin.top} y2={innerHeight} />
              </g>
              <g id="mouse-x">
                <text
                  filter="url(#axis-mouse)"
                  className="text-xs fill-white"
                  textAnchor="middle"
                  clipPath="inset(-1px -1px -1px -1px)"
                  y={innerHeight - margin.bottom}
                ></text>
              </g>
              <g id="mouse-y">
                <text
                  filter="url(#axis-mouse)"
                  className="text-xs fill-white"
                  textAnchor="end"
                  alignmentBaseline="middle"
                  clipPath="inset(-1px -1px -1px -1px)"
                  x={innerWidth + margin.right}
                ></text>
              </g>
            </g>
          </>
        ) : null}
      </svg>
    </div>
  );
}

export default CandlestickChart;
