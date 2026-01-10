import { Controller, Get, Post, Query } from '@nestjs/common';
import { SearchResults } from 'src/@Model/middleEarth.model';
import { MiddleEarthService } from 'src/@Service/middleEarth.service';

@Controller()
export class MiddleEarthController {
  constructor(private readonly middleEarthService: MiddleEarthService) {
    console.log('MiddleEarthController initialized');
  }

  @Get('getSearchResults')
  public async getSearchResults(
    @Query() params: { input: string; lang: string },
  ): Promise<SearchResults[]> {
    console.log('Received query: ', params);
    const result = await this.middleEarthService.postSearchResults(
      params.input,
      params.lang,
    );
    return result;
  }
}
