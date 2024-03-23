import { ticks } from "./historical";

export default class OHLC {
  stream: AsyncGenerator<Tick[]>;
  period: number;
  buf: Record<string, [number[], number[]]>;
  open: Record<string, number>;

  constructor(stream: AsyncGenerator<Tick[]>, period: number) {
    this.stream = stream;
    this.period = period;
    this.buf = {};
    this.open = {};
  }

  async *compute(): AsyncGenerator<Candle> {
    for await (const x of this.stream) {
      for (let { instrument, ...data } of x) {
        instrument = instrument!;
        const { timestamp, bid, ask } = data;
        if (!this.buf[instrument]) {
          this.open[instrument] = +timestamp - (+timestamp % this.period);
          const t = await ticks({
            instrument,
            start: this.open[instrument],
            end: +timestamp,
          });
          this.buf[instrument] = [t.map(({ bid }) => bid), t.map(({ ask }) => ask)];
        }
        this.buf[instrument][0].push(ask);
        this.buf[instrument][1].push(bid);
        yield {
          instrument,
          period: this.period,
          timestamp: this.open[instrument],
          ask_open: this.buf[instrument][0][0],
          ask_high: Math.max(...this.buf[instrument][0]),
          ask_low: Math.min(...this.buf[instrument][0]),
          ask_close: ask,
          bid_open: this.buf[instrument][1][0],
          bid_high: Math.max(...this.buf[instrument][1]),
          bid_low: Math.min(...this.buf[instrument][1]),
          bid_close: bid,
        };
        if (!(Math.trunc(+timestamp / 1000) % this.period)) {
          this.buf[instrument] = [[], []];
          this.open[instrument] = +timestamp;
        }
      }
    }
  }
}
