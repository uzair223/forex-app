import { useEffect, useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { debounce } from "lodash";

import { useSseContext } from "@/lib/hooks/eventSource";

import Main from "@/components/Main";
import InstrumentCard from "@/components/InstrumentCard";
import SessionGroup from "@/components/Session/SessionGroup";
import EconomicCalendar from "@/components/EconomicCalendar/EconomicCalendar";
import Spinner from "@/components/Spinner";

const RSS = "https://www.myfxbook.com/rss/forex-economic-calendar-events";
export async function loader() {
  const res = await fetch(RSS);
  return json({
    fetchedAt: +new Date(res.headers.get("date") as string),
    xml: (await res.text()) as string,
  });
}

export default function Index() {
  const [selected, setSelected] = useState(0);
  const { subscriptions } = useSseContext()!;
  const { fetchedAt, xml } = useLoaderData<typeof loader>();

  useEffect(() => {
    const toggle = debounce((e: KeyboardEvent) => {
      if (!["ArrowUp", "ArrowDown"].includes(e.key)) return true;
      console.log(e.key);
      e.preventDefault();
      setSelected(v => {
        const x = (v + (e.key === "ArrowUp" ? 1 : -1)) % 8;
        return x < 0 ? x + 8 : x;
      });
    }, 500);
    window.addEventListener("keydown", toggle);
    return () => {
      window.removeEventListener("keydown", toggle);
    };
  }, []);

  return (
    <div className="md:h-screen min-w-screen min-h-screen text-black bg-zinc-100 transition dark:bg-zinc-900 dark:text-zinc-200 p-2">
      <div className="w-full h-full flex flex-col md:flex-row gap-2">
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 col-span-2 w-full h-full md:basis-[30%] order-last max-h-screen md:max-h-max md:order-none">
          <SessionGroup />
          <EconomicCalendar fetchedAt={fetchedAt} xml={xml} />
        </div>
        <div className="w-full h-[75svh] md:h-full p-2 bg-white transition dark:bg-zinc-800 rounded-md">
          {subscriptions.length ? (
            <Main
              className="w-full h-full"
              instrument={subscriptions[selected]}
              defaultTimeFrame="15M"
              defaultOfferSide="bid"
            />
          ) : (
            <Spinner />
          )}
        </div>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 md:grid-cols-1 lg:grid-cols-2 md:basis-[40%] overflow-y-auto overflow-x-hidden">
          {subscriptions.map((v, i) => (
            <InstrumentCard
              className={selected === i ? "shadow-md transition dark:shadow-zinc-500/20" : ""}
              key={i}
              defaultInstrument={v}
              defaultTimeFrame="15M"
              lookBack={100}
              onClick={() => setSelected(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
