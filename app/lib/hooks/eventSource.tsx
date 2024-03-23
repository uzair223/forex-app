import { createContext, useEffect, useContext, useState, useRef } from "react";
import _ from "lodash";

import K from "@/_constants";

interface IContext {
  dataStream: Record<string, Candle[]>;
  subscriptions: string[];
  setDataStream: React.Dispatch<React.SetStateAction<Record<string, Candle[]>>>;
  setSubscriptions: React.Dispatch<React.SetStateAction<string[]>>;
  isActive: boolean;
}
const EventSourceContext = createContext<IContext | null>(null);

export function EventSourceProvider({
  defaults,
  children,
}: { defaults: string[] } & React.PropsWithChildren) {
  const [isActive, setActive] = useState(true);
  const [prev, setPrev] = useState<string[]>([]);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [dataStream, setDataStream] = useState<Record<string, Candle[]>>({});

  const eventSource = useRef<EventSource>();

  useEffect(() => {
    const local = (
      JSON.parse(localStorage.getItem("subscriptions") ?? "null") as string[] | null
    )?.filter(x => K.DK_INSTRUMENT_NAMES.includes(x));
    setSubscriptions(local ?? defaults);
  }, [defaults]);

  useEffect(() => {
    const difference = _.difference(subscriptions, prev);
    if (!difference.length) return; // if subscriptions have been mutated
    localStorage.setItem("subscriptions", JSON.stringify(subscriptions)); // store new subscriptions locally
    setPrev(subscriptions);
    // close existing eventsource and reinitiate
    eventSource.current?.close();
    eventSource.current = new EventSource(
      `/api/realtime?instruments=${subscriptions.join(",")}&delay=${K.DELAY}&period=${K.PERIOD}`,
    );
    eventSource.current.onopen = async () => {
      // fetching and storing minutely historical data
      const resMin = await fetch(
        `/api/historical?instruments=${difference.join(",")}&timeFrame=1min&count=${Math.min(
          5000,
          K.RETENTION - 1000,
        )}`,
      );
      const dataMin: Record<string, Candle[]> = await resMin.json();
      setDataStream(v => ({ ...v, ...dataMin }));

      // fetching and storing hourly historical data before minutely data
      const resHour = await fetch(
        `/api/historical?instruments=${difference.join(",")}&timeFrame=1hour&end=${new Date(
          Math.trunc(Date.now() / 60_000) * 60_000 - Math.min(5000, K.RETENTION - 1000) * 60_000,
        ).toJSON()}&count=1000`,
      );
      const dataHour: Record<string, Candle[]> = await resHour.json();
      setDataStream(v => ({
        ...v,
        ...Object.fromEntries(
          difference.map(k => [
            k,
            [...dataHour[k], ...dataMin[k]].sort((a, b) => +a.timestamp - +b.timestamp),
          ]),
        ),
      }));
    };
    eventSource.current.onerror = evt => {
      setActive(false);
      // @ts-ignore
      console.error(evt?.message ?? "Unexpected error...");
      eventSource.current?.close();
      eventSource.current = undefined;
    };

    subscriptions.forEach(
      x =>
        eventSource.current?.addEventListener(x, ({ data }) => {
          const c = JSON.parse(data);
          setDataStream(v => {
            const buf = [...(v[x!] ?? [])];
            // overwrite previous if same candle
            if (buf[buf.length - 1]?.timestamp === c.timestamp) buf.pop();
            buf.push(c);
            // delete first if max array size
            if (buf.length > K.RETENTION) buf.shift();
            return { ...v, [x!]: buf };
          });
        }),
    );
  }, [subscriptions, prev]);

  return (
    <EventSourceContext.Provider
      value={{ dataStream, subscriptions, setDataStream, setSubscriptions, isActive }}
    >
      {children}
    </EventSourceContext.Provider>
  );
}

export const useSseContext = () => useContext(EventSourceContext);

export const useSubscribe = (instrument: string) => {
  const [current, setCurrent] = useState(instrument);
  const { dataStream, subscriptions, setDataStream, setSubscriptions, isActive } = useSseContext()!;
  useEffect(() => {
    if (subscriptions.includes(instrument)) return;
    setSubscriptions(v => [...v, instrument]); // add new instrument to subscriptions
  }, [instrument, subscriptions, setSubscriptions]);

  // replace current subscription with another
  const changeSubscription = (value: string) => {
    setSubscriptions(v => {
      const x = [...v];
      const i = x.indexOf(current);
      if (i > -1) x[i] = value;
      else x.push(value);
      return x;
    });
    setDataStream(v => {
      const x = { ...v };
      delete x[current];
      return x;
    });
    setCurrent(value);
  };
  return {
    dataStream: dataStream[current],
    instrument: current,
    changeSubscription,
    setCurrent,
    isActive,
  };
};
