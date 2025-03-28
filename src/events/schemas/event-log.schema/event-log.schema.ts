import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventLogDocument = EventLog & Document;

@Schema({ timestamps: true })
export class EventLog {
  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true, type: Object })
  payload: any;
}

export const EventLogSchema = SchemaFactory.createForClass(EventLog);
