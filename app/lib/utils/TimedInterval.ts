import sleep from "./sleep";

type AsyncFunction<TParameters extends any[], TReturn> = (...args: TParameters) => Promise<TReturn>;

export default class TimedInterval<TParameters extends any[], TReturn> {
  private f: AsyncFunction<TParameters, TReturn>;
  private delay: number;
  private immediateStart: boolean;
  private running: boolean;
  private earlierStart: number;

  constructor(
    f: AsyncFunction<TParameters, TReturn>,
    delay: number,
    immediateStart = true,
    earlierStart = 0,
  ) {
    this.f = f;
    this.delay = delay;
    this.immediateStart = immediateStart;
    this.earlierStart = earlierStart;
    this.running = true;
  }

  public async *stream(...args: Parameters<typeof this.f>): AsyncGenerator<TReturn> {
    this.running = true;
    const offset = ((Date.now() % this.delay) - this.earlierStart) * +this.immediateStart;
    while (this.running) {
      const now = Date.now();
      if (Math.trunc(now - offset) % this.delay > 100) {
        await sleep(50);
        continue;
      }
      yield this.f(...args);
      await sleep(this.delay - 400);
    }
  }
  public end() {
    if (this) this.running = false;
  }
}
