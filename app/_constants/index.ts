import DK_INSTRUMENTS from "./instruments.json";

const K = {
  SQ_BASE_URL: "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/",
  DK_BASE_URL: "https://freeserv.dukascopy.com/2.0/?path=api/",
  DK_KEY: "llwrniz2i8000000",
  DK_TIMEFRAMES: ["10sec", "1min", "10m", "1hour", "1day", "1day_eet"] as string[],
  DK_INSTRUMENTS,
  DK_INSTRUMENT_NAMES: DK_INSTRUMENTS.map(({ name }) => name),
  DELAY: 1,
  RETENTION: 6000,
  PERIOD: 60,
} as const;

export default K;
