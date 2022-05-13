import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const { statusCode, message } =
      exception instanceof HttpException
        ? {
            statusCode: exception.getStatus(),
            message: exception.getResponse(),
          }
        : {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Unkown error',
          };

    const responseBody = {
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: message.toString(),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
