import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AlumniModule } from './modules/alumni/alumni.module';
import { EventsModule } from './modules/events/events.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { configuration } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    UsersModule,
    AlumniModule,
    EventsModule,
    JobsModule,
    NotificationsModule,
  ],
})
export class AppModule {}