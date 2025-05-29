import { status } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

export interface App {
  id: number;
  name: string;
}

export interface AppById {
  id: number;
}

@Controller()
export class AppController {
  private readonly apps: App[] = [
    { id: 1, name: 'Superman' },
    { id: 2, name: 'Batman' },
  ];

  @GrpcMethod('AppService', 'FindOne')
  findOne(data: AppById): App {
    const app = this.apps.find(app => app.id === data.id);
    if (!app) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `App with id ${data.id} not found`,
      });
    }
    return app;
  }
}