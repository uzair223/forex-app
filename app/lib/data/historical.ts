import K from "@/_constants";
import { json } from "@remix-run/node";

async function _historical({
  instrument,
  ...rest
}: {
  instrument: string;
  timeFrame: string;
  start?: number | string;
  end?: number | string;
  count?: number | string;
  offerSide?: string;
}) {
  if (!K.DK_INSTRUMENT_NAMES.includes(instrument)) throw json("Invalid instrument", 400);
  const { id } = K.DK_INSTRUMENTS.find(({ name }) => name === instrument)!;
  const params = Object.entries({ key: K.DK_KEY, instrument: id, ...rest })
    .map(([k, v]) => (v ? `&${k}=${v}` : ""))
    .join("");
  const res = await fetch(K.DK_BASE_URL + "historicalPrices" + params, {
    headers: {
      Connection: "close",
      "Cache-Control": "no-store, no-cache, no-transform",
      Pragma: "no-cache",
    },
  });
  if (!res.ok) throw json(res.statusText, res.status);
  const data = await res.json();
  // if fetched data is not the intended data then repeat fetch
  if (data.id !== id) return _historical({ instrument, ...rest });
  return data;
}

const timeFrames = {
  "10sec": 10,
  "1min": 60,
  "10m": 600,
  "1hour": 3600,
  "1day": 86400,
  "1day_eet": 86400,
};

export async function historical(params: {
  instrument: string;
  timeFrame: HistoricalTimeFrame;
  start?: number | string;
  end?: number | string;
  count?: number | string;
}): Promise<Candle[]> {
  const { candles: candles_bid }: { candles: ({ bid_volume: number } & BidCandle)[] } =
    await _historical({
      ...params,
      offerSide: "B",
    });
  const { candles: candles_ask }: { candles: ({ ask_volume: number } & AskCandle)[] } =
    await _historical({
      ...params,
      offerSide: "A",
    });
  return candles_ask.map((v, i) => {
    const { ask_volume, ...ask } = v;
    const { bid_volume, ...bid } = candles_bid[i];
    return { period: timeFrames[params.timeFrame], ...ask, ...bid };
  });
}

export async function ticks(params: {
  instrument: string;
  start?: number;
  end?: number;
  count?: number;
}) {
  const { ticks } = await _historical({ timeFrame: "tick", ...params });
  return (ticks as Tick[]).map(({ timestamp, bid, ask }) => ({
    timestamp,
    bid,
    ask,
  }));
}
