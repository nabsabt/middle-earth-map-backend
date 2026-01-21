import { Module } from '@nestjs/common';
import { MiddleEarthController } from './@Controller/middleEarth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { MiddleEarthService } from './@Service/middleEarth.service';
import { ChatService } from './@Service/chat.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '../../.env'),
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_CONNECTION'),
      }),
    }),
  ],
  controllers: [MiddleEarthController],
  providers: [MiddleEarthService, ChatService],
})
export class AppModule {
  constructor() {}
}
