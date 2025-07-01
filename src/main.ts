import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { urlencoded, json } from 'express'; 
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import express, { Request, Response } from 'express';


async function bootstrap() { 
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  //// console.log(process.env.CORS_POLICY)

  const corsOptions: CorsOptions = {
    origin: ['https://kgate.bc.gov.sa', 'http://localhost:4200','http://localhost:64747'], // Fixed trailing slash
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Enable cookies and credentials
  };
  app.enableCors(corsOptions);

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  app.use(json({ limit: '5000mb' })); 
  app.use(urlencoded({ limit: '5000mb', extended: true }))  

  // Use the Express adapter to set up the route
  app.getHttpAdapter().get('/', (_req: Request, res: Response) => {
    res.send('server is working');
  });

  setupSwagger(app);
  await app.listen(process.env.PORT || 5001);
  
  const serverAddress = app.getHttpServer().address();

  if (typeof serverAddress === 'string') {
      console.log(`Server start on ${serverAddress}\nConnected To Database`);
  } else if (serverAddress && typeof serverAddress === 'object') {
      console.log(`Server start on port ${serverAddress.address}:${serverAddress.port} \nConnected To Database`);
  }

  console.log(`port : ${process.env.PORT || 5001}`)
}

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('KGate Backend Enhancements')
    .setDescription('KGate API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const dOptions: SwaggerDocumentOptions = {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  }

  const options: SwaggerCustomOptions = {
    explorer: true,
    swaggerOptions: {
      requestBodyModels: {
        useDefinitionRef: true,
      },
    },
  }

  const document = SwaggerModule.createDocument(app, config, dOptions);
  SwaggerModule.setup('api-docs', app, document, options);
}

bootstrap();
