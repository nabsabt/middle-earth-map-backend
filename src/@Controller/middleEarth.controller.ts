import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import {
  GISObject,
  SearchResults,
  SearchResultError,
  getGISObjectError,
  getGeoJSONSError,
} from 'src/@Model/middleEarth.model';
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
    if (result) {
      return result;
    } else {
      const errorMessage: SearchResultError = {
        message: {
          HU: 'A keresés közben hiba történt!',
          EN: 'Some error occured during searching!',
        },
      };
      throw new NotFoundException(errorMessage);
    }
  }

  @Get('getGISObject')
  public async getGISObject(
    @Query() params: { gisID: string },
  ): Promise<GISObject> {
    const result = await this.middleEarthService.postGISObject(params.gisID);
    if (result) {
      return result;
    } else {
      const errorMessage: getGISObjectError = {
        message: {
          HU: 'A helyszín lekérés közben hiba történt!',
          EN: 'Some error occured during object selection!',
        },
      };
      throw new NotFoundException(errorMessage);
    }
  }

  @Get('getGeoJSONS')
  public async getGeoJSONS(): Promise<{
    areas: any;
    paths: any;
    places: any;
  }> {
    const result = await this.middleEarthService.postGeoJSONS();
    if (result.areas) {
      return result;
    } else {
      const errorMessage: getGeoJSONSError = {
        message: {
          HU: 'A térképi elemek lekérése közben hiba történt!',
          EN: 'Some error occured during map element fetching!',
        },
      };
      throw new NotFoundException(errorMessage);
    }
  }
}
