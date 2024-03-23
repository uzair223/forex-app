import { useState, useEffect, useRef } from "react";
import { useTimezone } from "@/lib/hooks/useTimezone";

import Spinner from "../Spinner";
import FilterModal from "./FilterModal";
import { FilterIcon } from "../icons";
import CalendarItem from "./CalendarItem";

export interface ICalendarItem {
  title: string;
  date: Date;
  impact: number;
  previous: string;
  consensus: string;
  actual: string;
  code?: string;
}
interface EconomicCalendarProps {
  fetchedAt: number | Date;
  xml: string;
}

const multiplier = {
  seconds: 1000,
  min: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;
const DEFAULT_COUNTRIES = [
  "us",
  "eu",
  "gb",
  "jp",
  "cn",
  "ch",
  "fr",
  "it",
  "es",
  "de",
  "ca",
  "au",
  "nz",
];

function EconomicCalendar({ fetchedAt, xml }: EconomicCalendarProps) {
  const tz = useTimezone()![0];
  const [items, setItems] = useState<ICalendarItem[]>([]);
  const [view, setView] = useState<ICalendarItem[]>([]);
  const [closest, setClosest] = useState<number>();
  const [modalOpen, setModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!xml.length) return;
    const parser = new DOMParser();
    const nodes = [
      ...parser
        .parseFromString(xml, "text/xml")
        .getElementsByTagName("channel")
        .item(0)!
        .getElementsByTagName("item"),
    ];
    const x = nodes.map(el => {
      const title = el.children[0].textContent!;
      const description = parser
        .parseFromString(el.children[3].textContent!, "text/html")
        .getElementsByTagName("tbody")
        .item(0)!.children[1].children;
      const impact =
        {
          "no-impact": 0,
          "low-impact": 1,
          "medium-impact": 2,
          "high-impact": 3,
        }[description[1].children[0]?.className?.split(" ")?.[2].replace("sprite-", "")] ?? 0;
      const previous = description[2].textContent?.trim() ?? "";
      const consensus = description[3].textContent?.trim() ?? "";
      const actual = description[4].textContent?.trim() ?? "";
      let tl: number;
      const timeLeft = description[0].textContent!;
      // [x]h [y]min, [x] min, [x] seconds
      if (timeLeft?.match(/\d+h \d+min/)) {
        const [h, m] = timeLeft.split(" ");
        tl = +h.replace("h", "") * multiplier.h + +m.replace("min", "") * multiplier.min;
      } else {
        const [t, p] = timeLeft?.split(" ");
        // @ts-ignore
        tl = +t * multiplier[p];
      }
      const MIN5 = 300_000;
      const date = new Date(Math.ceil((+fetchedAt + tl) / MIN5) * MIN5);
      date.setSeconds(0, 0);
      return {
        title,
        date,
        impact,
        previous,
        consensus,
        actual,
      };
    });
    setItems(x);
    setView(x);
  }, [xml, fetchedAt]);

  useEffect(() => {
    if (!view.length) return;
    setClosest(
      view
        .map((v, i) => [i, +v.date - Date.now()])
        .filter(x => x[1] > 0)
        .sort()?.[0]?.[0] ?? view.length - 1,
    );
  }, [view]);

  useEffect(() => {
    if (!ref.current || closest === undefined) return;
    const child = ref.current.children[closest];
    child?.scrollIntoView(true);
  }, [ref, closest]);

  return xml.length ? (
    <>
      <FilterModal
        defaultFilters={{ minImpact: 2, selected: DEFAULT_COUNTRIES }}
        items={items}
        setView={setView}
        open={modalOpen}
        setOpen={setModalOpen}
      />
      <div className="h-full bg-white transition dark:bg-zinc-800 rounded-md overflow-hidden">
        <div className="relative px-2 h-full overflow-y-auto">
          <div className="inline-flex justify-between sticky top-0 w-full bg-gradient-to-b from-white dark:from-zinc-800 from-60% py-2 z-10">
            <span className="font-semibold leading-tight ml-2">Economic Calendar</span>
            <FilterIcon
              className="cursor-pointer  fill-zinc-500 transition hover:fill-zinc-600 hover:-translate-y-1"
              onClick={() => setModalOpen(true)}
            />
          </div>
          <div className="divide-y divide-solid z-0 transition dark:divide-zinc-600" ref={ref}>
            {view.length ? (
              view.map((d, i) => <CalendarItem key={i} d={d} tz={tz} />)
            ) : (
              <div className="flex justify-center items-center w-full h-full text-zinc-400">
                No items to show...
              </div>
            )}
          </div>
          <div className="sticky bottom-0 w-full h-4 bg-gradient-to-t from-white dark:from-zinc-800 from-50%" />
        </div>
      </div>
    </>
  ) : (
    <Spinner />
  );
}

export default EconomicCalendar;
