import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { LoggingInterceptor } from './logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'app',
      protoPath: join(__dirname, 'proto/app.proto'),
      url: '0.0.0.0:50051',
    },
  });

  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen();
  console.log('gRPC microservice is listening...');
  console.log('Proto file path:', join(__dirname, 'proto/app.proto'));

}
bootstrap().catch(err => {
  console.error('Failed to start gRPC server:', err);
});;
