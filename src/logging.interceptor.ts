import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const rpc = context.switchToRpc();
    const data = rpc.getData();
    const metadata = rpc.getContext();
    const method = context.getClass().name;

    console.log('[gRPC Request]', {
      timestamp: new Date().toISOString(),
      method: method,
      data: data,
      metadata: metadata
    });

    return next.handle().pipe(
      tap(response => {
        console.log('[gRPC Response]', {
          timestamp: new Date().toISOString(),
          method: method,
          duration: `${Date.now() - now}ms`,
          response: response
        });
      }),
    );
  }
}