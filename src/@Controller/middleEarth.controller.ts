import { Controller, Get, Post, Query, Res } from '@nestjs/common';
import { GISObject, SearchResults } from 'src/@Model/middleEarth.model';
import { MiddleEarthService } from 'src/@Service/middleEarth.service';

@Controller()
export class MiddleEarthController {
  constructor(private readonly middleEarthService: MiddleEarthService) {}

  @Get('getSearchResults')
  public async getSearchResults(
    @Query() params: { input: string; lang: string },
  ): Promise<SearchResults[]> {
    const result = await this.middleEarthService.postSearchResults(
      params.input,
      params.lang,
    );
    return result;
  }

  @Get('getGISObject')
  public async getGISObject(
    @Query() params: { gisID: string },
  ): Promise<GISObject> {
    console.log('Received query: ', params);

    const result = await this.middleEarthService.postGISObject(params.gisID);
    return result;
  }

  @Get('getGeoJSONS')
  public async getGeoJSONS(): Promise<{
    areas: any;
    paths: any;
    places: any;
  }> {
    const result = await this.middleEarthService.postGeoJSONS();
    console.log('getGeoJSONS');
    return result;
  }
}
