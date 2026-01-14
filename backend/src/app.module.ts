import { Module } from '@nestjs/common';
import { LeafsModule } from './leafs/leafs.module';
import { EspnModule } from './espn/espn.module';
import { CacheModule } from './cache/cache.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LeafsModule,
    EspnModule,
    CacheModule,
  ],
})
export class AppModule {}
