import { Module, Global } from '@nestjs/common';

import { LoggerProvider } from './logger.provider';
import { Logger } from './logger.service';

@Global()
@Module({
  providers: [LoggerProvider, Logger],
  exports: [Logger, LoggerProvider],
})
export class LoggerModule {}
