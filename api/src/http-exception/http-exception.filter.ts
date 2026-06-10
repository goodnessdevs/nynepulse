import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  logger = new Logger()
  constructor() { }
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp()

    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()
    const status = exception.getStatus()

    this.logger.error(`${request.method} ${request.originalUrl} ${status} error: ${exception.message}`)

    const errorDetails = exception.getResponse()
    response.status(status).json({ success: false, errorDetails })
  }
}
