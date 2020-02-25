import { Injectable } from '@nestjs/common';

import { ConfigService } from '~lib/config';

import { Logger } from './logger.service';
import { LoggerEnum } from './logger.enum';

@Injectable()
export class LoggerProvider {
  private loggerList: { [name: string]: Logger } = {};

  constructor(private readonly configService: ConfigService) {}

  getLogger(name: LoggerEnum = LoggerEnum.DEFAULT): Logger {
    const logger = this.loggerList[name];
    if (logger) {
      return logger;
    }
    return this.instantiateLogger(name);
  }

  instantiateLogger(name: LoggerEnum): Logger {
    // const logger = new Logger(null, name);
    const logger = new Logger(this.configService, name);
    this.loggerList[name] = logger;
    return logger;
  }
}
