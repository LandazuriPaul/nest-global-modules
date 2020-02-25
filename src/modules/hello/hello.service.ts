import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  getHello(): string {
    const message = 'Hello World!';
    return message;
  }
}
