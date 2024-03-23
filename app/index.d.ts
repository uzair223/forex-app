interface Point {
  timestamp: number | Date;
  value: number;
}

interface TimeData {
  instrument?: string;
  period?: number;
  timestamp: Date | number;
}

interface SimpleCandleValues {
  open: number;
  high: number;
  low: number;
  close: number;
}

type BidCandleValues = {
  [Property in keyof SimpleCandleValues as `bid_${string & Property}`]: number;
};
type AskCandleValues = {
  [Property in keyof SimpleCandleValues as `ask_${string & Property}`]: number;
};

type Candle = TimeData & BidCandleValues & AskCandleValues;
type SimpleCandle = TimeData & SimpleCandleValues;
type BidCandle = TimeData & BidCandleValues;
type AskCandle = TimeData & AskCandleValues;

interface Tick extends TimeData {
  ask: number;
  bid: number;
}

type TimeFrameString = `${number}${"M" | "H" | "D"}`;

interface SendEvent {
  event: string;
  data: any;
}
type HistoricalTimeFrame = "10sec" | "1min" | "10m" | "1hour" | "1day" | "1day_eet";
type EventStreamSource = (send: ({ event, data }: SendEvent) => void) => () => void | Promise<void>;
