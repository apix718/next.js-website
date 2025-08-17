export type HandlerEvent = any;
export type HandlerContext = any;

export type Handler = (
  event: HandlerEvent,
  context: HandlerContext
) => Promise<{
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}>;