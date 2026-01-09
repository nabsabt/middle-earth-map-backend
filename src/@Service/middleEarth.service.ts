import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MiddleEarthService {
  constructor(@InjectConnection() private mongo: Connection) {}

  private searchMapCollection = this.mongo.collection('searchMap');

  public async postTest(): Promise<any> {
    const res = await this.searchMapCollection.find({}).toArray();
    const response = `Successful, data is ${res[3]['name']['EN']}`;
    return response;
  }
}
