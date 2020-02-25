/* tslint:disable: max-line-length */
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { version, repository } from '../../package.json';

export function swaggerInit(app, { host, port, protocol }, endPoint: string) {
  let url = host;
  if (host === 'localhost') {
    url = `${url}:${port}`;
  }
  const swaggerOptions = new DocumentBuilder()
    .setTitle(`Opacity API documentation`)
    .setDescription(
      `<br/>
      This documentation describes the classical endpoint based API requests available on the Opacity API.
      <br/>
      <strong>N.B.:</strong> If you're looking for the GraphQL documentation, you'd better use the [dedicated playground](${protocol}://${url}/graphql). <em>Nevertheless, be aware that the playground is supposed to be disabled in production environment.</em>
      <br/>`,
    )
    .addServer(`${protocol}://${url}`)
    .setExternalDoc('Opacity API repository', `${repository.url}`)
    .setVersion(version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup(endPoint, app, document);
}
