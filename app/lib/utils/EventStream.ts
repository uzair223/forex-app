export default class EventStream extends Response {
  constructor(request: Request, source: EventStreamSource, init?: ResponseInit) {
    const stream = new ReadableStream({
      start: controller => {
        let closed = false;

        controller.enqueue("event: connected\n\n");
        const send = ({ event, data }: SendEvent) => {
          if (closed) return;
          controller.enqueue(`event: ${event ?? "ping"}\n`);
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        };
        const cleanup = source(send);
        const close = async () => {
          if (closed) return;
          closed = true;
          cleanup?.();
          request.signal.removeEventListener("abort", close);
          controller.close();
        };
        request.signal.addEventListener("abort", close);
      },
    });
    const { headers, ...rest } = init ?? {};
    super(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        ...headers,
      },
      ...rest,
    });
  }
}
