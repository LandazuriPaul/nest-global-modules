import { NestFactory } from '@nestjs/core';

import { AppModule } from '~/modules/app';

import { Logger } from '~/lib/logger';
import { swaggerInit } from '~lib/swagger';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(Logger));
  const env = app.get('ConfigService')['envConfig'];
  const host = env['HOST'];
  const port = env['PORT'];
  const protocol = env['PROTOCOL'];
  swaggerInit(
    app,
    {
      host,
      port,
      protocol,
    },
    'docs',
  );
  app.enableCors();
  await app.listen(port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
