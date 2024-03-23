import K from "@/_constants";
import { isWeekend } from "../utils/time";

export async function realtime(instrument: string) {
  if (isWeekend()) throw { message: "Data not available", status: 503 };
  if (!K.DK_INSTRUMENT_NAMES.includes(instrument)) throw { message: instrument, status: 400 };
  const res = await fetch(K.SQ_BASE_URL + instrument);
  if (!res.ok) throw { message: instrument, status: res.status };
  const {
    spreadProfilePrices: {
      0: { ask, bid },
    },
  } = (await res.json())[0];
  return { instrument, timestamp: Date.now(), bid, ask } as Tick;
}

export const realtimeMany = (instruments: string[]) => Promise.all(instruments.map(realtime));
