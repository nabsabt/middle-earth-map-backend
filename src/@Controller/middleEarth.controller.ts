import { Controller, Get, Post, Query } from '@nestjs/common';
import { SearchmapResultModel } from 'src/@Model/middleEarth.model';
import { MiddleEarthService } from 'src/@Service/middleEarth.service';

@Controller()
export class MiddleEarthController {
  constructor(private readonly middleEarthService: MiddleEarthService) {
    console.log('MiddleEarthController initialized');
  }

  @Get('test')
  public async getTestResult(): Promise<any> {
    console.log('Received query:');
    const result = await this.middleEarthService.postTest();
    return { result: result };
  }
}
