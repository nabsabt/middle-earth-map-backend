import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MiddleEarthService {
  constructor(@InjectConnection() private mongo: Connection) {}

  private searchMapCollection = this.mongo.collection('searchMap');

  public async postSearchResults(input: string, lang: string): Promise<any> {
    const fieldLang = `keywords_${lang.toUpperCase()}`;

    console.log('Searching in field:', fieldLang);
    const res = await this.searchMapCollection
      .find({
        [fieldLang]: { $regex: input, $options: 'i' },
      })
      .toArray();

    return res;
  }
}
