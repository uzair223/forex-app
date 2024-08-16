import React, { useEffect, useMemo, useState } from "react";
import type { ICalendarItem } from "./EconomicCalendar";
import Modal from "../Modal";
import { debounce, difference } from "lodash";
import countries from "@/_constants/countries.json";

export interface Filters {
  minImpact: 1 | 2 | 3;
  selected: string[];
}

interface FilterModalProps {
  defaultFilters: Filters;
  items: ICalendarItem[];
  setView: React.Dispatch<React.SetStateAction<ICalendarItem[]>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
function FilterModal({ defaultFilters, items, setView, open, setOpen }: FilterModalProps) {
  const [minImpact, setMinImpact] = useState<number>();
  const [selected, setSelected] = useState<string[]>();
  const [filteredList, setFilteredList] = useState<string[]>(Object.keys(countries));

  const debouncedOnChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilteredList(
      Object.entries(countries)
        .filter(([_, v]) => v.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1)
        .map(([k, _]) => k),
    );
  }, 200);

  useEffect(() => {
    if (!items.length) return;
    setView(
      items
        .filter(
          ({ title, impact }) =>
            !title.includes("Myfxbook") &&
            impact >= (minImpact ?? 0) &&
            (!selected?.length ||
              selected
                .map(code => title.includes(countries[code as keyof typeof countries]))
                .reduce((prev, curr) => prev || curr, false)),
        )
        .map(d => ({
          ...d,
          code: Object.entries(countries).find(([_, v]) => d.title.includes(v))?.[0],
        })),
    );
  }, [items, selected, minImpact, setView]);

  useEffect(() => {
    // @ts-ignore
    setMinImpact(+localStorage.getItem("minImpact") || defaultFilters.minImpact);
    setSelected(JSON.parse(localStorage.getItem("selected") ?? "null") || defaultFilters.selected);
  }, [defaultFilters?.minImpact, defaultFilters?.selected]);

  useEffect(() => {
    if (!minImpact) return;
    localStorage.setItem("minImpact", minImpact.toString());
  }, [minImpact]);

  useEffect(() => {
    if (!selected) return;
    localStorage.setItem("selected", JSON.stringify(selected));
  }, [selected]);

  const list = useMemo(
    () => difference(Object.values(filteredList), selected ?? []),
    [filteredList, selected],
  );

  return open ? (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div className="flex flex-col w-full h-full p-4 bg-white transition dark:bg-zinc-800 rounded-md">
        <div className="p-2">
          <p className="font-semibold text-lg">Economic Calendar &ndash; Filter</p>
          <div className="inline-block">
            <div className="inline-flex gap-1">
              <span className="flex rounded-full h-3 w-3 bg-green-500"></span>
              <span
                className={`flex rounded-full h-3 w-3 transition bg-orange-500 ${
                  minImpact! < 2 ? "opacity-20" : ""
                }`}
              ></span>
              <span
                className={`flex rounded-full h-3 w-3 transition bg-red-600 ${
                  minImpact! < 3 ? "opacity-20" : ""
                }`}
              ></span>
            </div>
            <select
              name="impact-select"
              value={minImpact}
              className="px-2 outline-none appearance-none transition dark:bg-zinc-800"
              onChange={e => setMinImpact(+e.currentTarget.value)}
            >
              <option value={1}>Low Impact</option>
              <option value={2}>Medium Impact</option>
              <option value={3}>High Impact</option>
            </select>
          </div>
        </div>

        <div className="border-y transition dark:border-zinc-600">
          <input
            name="country-search"
            type="text"
            className="w-full p-2 outline-none placeholder:text-zinc-400 transition dark:bg-zinc-800 rounded-md z-10"
            placeholder="Search country..."
            onChange={debouncedOnChange}
          />
        </div>

        <div className="p-2">
          <span>Selected countries:</span>
          <div className="flex flex-wrap gap-2 mb-2">
            {selected?.length ? (
              selected.map(code => (
                <div
                  className="inline-flex group gap-1 p-1 bg-zinc-100 transition dark:bg-zinc-900 rounded cursor-pointer hover:-translate-y-1 hover:drop-shadow"
                  key={code}
                  onClick={e => {
                    e.currentTarget.classList.add("hidden");
                    setSelected(v => {
                      const x = [...v!];
                      x.splice(x.indexOf(code), 1);
                      return x;
                    });
                  }}
                >
                  <img width="20px" height="15px" src={`flags/${code}.svg`} alt={code} />{" "}
                  <span className="font-semibold text-zinc-500 transition group-hover:text-zinc-600">
                    &#215;
                  </span>
                </div>
              ))
            ) : (
              <span className="text-zinc-400">No countries selected...</span>
            )}
          </div>
        </div>

        <div className="relative flex flex-wrap gap-2 p-2 pt-0 overflow-y-auto max-h-[40svh]">
          <div className="sticky top-0 w-full pb-2 bg-gradient-to-b from-white dark:from-zinc-800 from-60% z-10 -translate-y-1">
            <span>Add countries:</span>
          </div>
          {list.length ? (
            list.map(code => (
              <div
                className="z-0 -translate-y-4 inline-flex items-center group gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 cursor-pointer transition hover:-translate-y-5 hover:drop-shadow"
                key={code}
                onClick={() => setSelected(v => [...(v ?? []), code])}
              >
                <img width="20px" height="15px" src={`flags/${code}.svg`} alt={code} />
                <span>{countries[code as keyof typeof countries]}</span>{" "}
                <span className="font-semibold text-zinc-500 transition group-hover:text-zinc-600">
                  +
                </span>
              </div>
            ))
          ) : (
            <span className="text-zinc-400 -translate-y-4">No results...</span>
          )}
        </div>
      </div>
    </Modal>
  ) : null;
}

export default FilterModal;
