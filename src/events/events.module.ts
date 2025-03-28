import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { EventLog, EventLogSchema } from './schemas/event-log.schema/event-log.schema';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [MongooseModule.forFeature([{ name: EventLog.name, schema: EventLogSchema }])],
  providers: [EventsService, EventsGateway],
  exports: [EventsService, EventsGateway],
})
export class EventsModule {}
