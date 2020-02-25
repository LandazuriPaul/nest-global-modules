import { Module } from '@nestjs/common';

import { ConfigModule } from '~lib/config';
import { LoggerModule } from '~lib/logger';
import { HelloModule } from '~modules/hello';

@Module({
  imports: [ConfigModule, HelloModule, LoggerModule],
})
export class AppModule {}
