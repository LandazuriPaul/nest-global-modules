import { LoggerService } from '@nestjs/common';
import {
  createLogger,
  Logger as WinstonLogger,
  LoggerOptions,
  transports,
  format,
} from 'winston';

import { ConfigService } from '~lib/config';

import { ILogger } from './logger.interface';
import { LoggerEnum } from './logger.enum';

const GlobalLoggerOptions: LoggerOptions = {
  level: 'info',
  defaultMeta: { name: 'global' },
  format: format.json(),
  transports: [new transports.Console()],
};

export class Logger implements ILogger, LoggerService {
  private logger: WinstonLogger;

  constructor(
    private readonly configService: ConfigService,
    private readonly name: LoggerEnum,
  ) {
    let options: LoggerOptions;
    if (!configService) {
      // NOTE: on initialization, configService is undefined
      options = GlobalLoggerOptions;
    } else {
      options = {
        ...configService.getLogOptions(),
        ...configService.getLogOptions(name),
      };
    }
    this.logger = createLogger(options);
  }

  debug(message: any) {
    this.logger.debug(message);
  }

  info(message: any) {
    this.logger.info(message);
  }

  log(message: any) {
    this.logger.info(message);
  }

  warn(message: any) {
    this.logger.warn(message);
  }

  error(message: any) {
    this.logger.error(message);
  }
}
