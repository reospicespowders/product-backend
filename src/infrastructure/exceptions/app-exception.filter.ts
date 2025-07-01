// Error Handling


import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { writeFile } from "fs/promises";
import { join } from "path";
import MessageResources from '../../resources/message-resources.json';

/**
 * @export
 * @class AppExceptionFilter
 * @implements {ExceptionFilter}
 */
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private httpAdapterHost: HttpAdapterHost) { }

  /**
   * @param {unknown} exception
   * @param {ArgumentsHost} host
   * @memberof AppExceptionFilter
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let msg = MessageResources.INTERNAL_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      msg = exception.message;
    }

    const { httpAdapter } = this.httpAdapterHost;

    const body = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: msg,
    };

    this.writeHttpLog(body);

    httpAdapter.reply(ctx.getResponse(), body, status);
  }

  private async writeHttpLog(data: Record<string, any>) {
    let LOGS_DIR: string;
    if (process.env.LOG_DIRECTORY) {
      LOGS_DIR = join(__dirname, `${process.env.LOG_DIRECTORY}`, `${Date.now()}-log.json`);
    } else {
      LOGS_DIR = join(__dirname, `${Date.now()}-log.json`);
    }

    try {
      await writeFile(LOGS_DIR, JSON.stringify(data));
    } catch (err) {
      return;
    }
  }
}