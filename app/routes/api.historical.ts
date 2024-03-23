import K from "@/_constants";
import { historical } from "@/lib/data/historical";
import { type LoaderArgs, json } from "@remix-run/node";

function isTimeFrame(timeFrame: string): timeFrame is HistoricalTimeFrame {
  return K.DK_TIMEFRAMES.includes(timeFrame);
}

export async function loader({ request }: LoaderArgs) {
  const { instruments, timeFrame, start, end, count } = Object.fromEntries(
    new URLSearchParams(request.url.split("?")[1]),
  );
  if (!instruments?.length || !isTimeFrame(timeFrame)) throw json("Invalid parameters", 400);
  if (!isNaN(+start) && +start >= Date.now()) throw json("'start' must not be in the future", 400);
  if (!isNaN(+start + +end) && +start >= +end) throw json("'start' must be before 'end'");
  if (!isNaN(+count) && +count > 5000)
    throw json("'count' must be less than or equal to 5000", 400);
  return json(
    Object.fromEntries(
      await Promise.all(
        instruments
          .split(",")
          .map(async instrument => [
            instrument,
            await historical({ instrument, timeFrame, start: +start, end: +end, count: +count }),
          ]),
      ),
    ),
    200,
  );
}
