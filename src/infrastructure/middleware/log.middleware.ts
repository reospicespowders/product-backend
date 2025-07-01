import { Injectable, Logger, NestMiddleware, Response } from '@nestjs/common';
import { NextFunction,Request } from 'express';

/**
 * @export
 * @class LogMiddleware
 * @implements {NestMiddleware}
 */
@Injectable()
export class LogMiddleware implements NestMiddleware {
    private readonly logger = new Logger(LogMiddleware.name);

  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof LogMiddleware
   */
  use(req: Request,@Response() res: any, next: NextFunction) {
    const startTimestamp = Date.now();
    const requestData = {
      method: req.method,
      url: req.originalUrl,
      body: req.body
    };

    this.logger.log(`Received request: ${JSON.stringify(requestData)}`);
    res.on('finish', () => {
      const responseTime = Date.now() - startTimestamp;
      const responseData = {
        status: res.statusCode,
        body: res.body,
      };

      this.logger.log(`Response sent: ${JSON.stringify(responseData)}`);
      // this.logger.log(`Response sent: ${responseData}`);
      this.logger.log(`Response time: ${responseTime}ms`);
    });

    next();
  }

}
