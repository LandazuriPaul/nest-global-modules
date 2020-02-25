type logging = (message: any) => void;

export interface ILogger {
  debug: logging;
  info: logging;
  log: logging;
  warn: logging;
  error: logging;
}
