import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Connection } from 'mongoose';

@Injectable()
export class SchedulerService {
  /**
   * This class is to check client requests, and to clean request time stamps,
   * older than 24h
   */
  private clientRequestsCollection = this.mongo.collection('clientRequests');

  constructor(@InjectConnection() private mongo: Connection) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1) Remove emailMessageSent if older than 24 hours
    const unsetEmail = await this.clientRequestsCollection.updateMany(
      { emailMessageSent: { $type: 'date', $lt: cutoff } },
      { $unset: { emailMessageSent: '' } },
    );

    // 2) Remove AIChat entirely if lastMessageSent older than 24 hours
    const unsetAIChat = await this.clientRequestsCollection.updateMany(
      { 'AIChat.lastMessageSent': { $type: 'date', $lt: cutoff } },
      { $unset: { AIChat: '' } },
    );

    // 3) If neither emailMessageSent nor AIChat exists => delete whole document
    const deleted = await this.clientRequestsCollection.deleteMany({
      emailMessageSent: { $exists: false },
      AIChat: { $exists: false },
    });
  }
}
