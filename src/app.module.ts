import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BedrockProxyService } from './bedrock-proxy.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [BedrockProxyService],
})
export class AppModule {}
