import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventLog, EventLogDocument } from './schemas/event-log.schema/event-log.schema';

@Injectable()
export class EventsService {
  constructor(@InjectModel(EventLog.name) private eventLogModel: Model<EventLogDocument>) {}

  async logEvent(log: Partial<EventLog>): Promise<EventLog> {
    const createdLog = new this.eventLogModel(log);
    return createdLog.save();
  }
}
