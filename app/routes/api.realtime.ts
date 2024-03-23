import { type LoaderArgs, json } from "@remix-run/node";
import EventStream from "@/lib/utils/EventStream";

import TimedInterval from "@/lib/utils/TimedInterval";
import { realtimeMany } from "@/lib/data/realtime";
import OHLC from "@/lib/data/ohlc";

export async function loader({ request }: LoaderArgs) {
  const { instruments, delay, period } = Object.fromEntries(
    new URLSearchParams(request.url.split("?")[1]),
  );
  if (!instruments?.length || isNaN(+delay) || isNaN(+period))
    throw json("Invalid parameters", 400);

  return new EventStream(request, send => {
    const interval = new TimedInterval(realtimeMany, +delay * 1000, true);
    (async () => {
      try {
        for await (const { instrument, ...data } of new OHLC(
          interval.stream(instruments.split(",")),
          +period,
        ).compute()) {
          send({ event: instrument!, data });
        }
      } catch (e) {
        send({
          event: "error",
          data: {
            // @ts-ignore
            message: e.message ?? "Unexpected error occured",
            // @ts-ignore
            status: e.status ?? 500,
          },
        });
      }
    })();
    return interval.end;
  });
}
