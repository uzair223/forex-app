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
    <div className="w-screen h-screen text-black bg-zinc-100 transition dark:bg-zinc-900 dark:text-zinc-200 p-2">
      <div className="w-full h-full grid gap-2 grid-cols-11 grid-rows-1">
        <div className="flex flex-col gap-2 col-span-2 w-full h-full">
          <SessionGroup />
          <EconomicCalendar fetchedAt={fetchedAt} xml={xml} />
        </div>
        <div className="col-span-5 w-full h-full p-2 bg-white transition dark:bg-zinc-800 rounded-md">
          {subscriptions.length ? (
            <Main
              instrument={subscriptions[selected]}
              defaultTimeFrame="15M"
              defaultOfferSide="bid"
            />
          ) : (
            <Spinner />
          )}
        </div>
        <div className="max-h-screen col-span-4 grid gap-2 lg:grid-cols-2 overflow-auto">
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
