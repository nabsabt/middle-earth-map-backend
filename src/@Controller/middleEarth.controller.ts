import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Request } from 'express';
import { GISObject, SearchResults } from 'src/@Model/middleEarth.model';
import { MiddleEarthService } from 'src/@Service/middleEarth.service';
import { getClientIp } from 'get-client-ip';
import { AI_CHAR, ChatParams, ChatService } from 'src/@Service/chat.service';

@Controller()
export class MiddleEarthController {
  constructor(
    private readonly middleEarthService: MiddleEarthService,
    private readonly chatService: ChatService,
  ) {}

  @Get('getSearchResults')
  public async getSearchResults(
    @Query() params: { input: string },
    @Req() req: Request,
  ): Promise<SearchResults[] | { message: string }> {
    const lang: string = req.headers['lang-header'].toString() ?? 'en';
    const result = await this.middleEarthService.postSearchResults(
      params.input,
      lang,
    );
    if (result && result.length > 0) {
      return result;
    } else if (result && result.length === 0) {
      return {
        message: lang === 'hu' ? 'Nincs találat!' : 'No result found!',
      };
    } else {
      throw new NotFoundException(
        lang === 'hu'
          ? 'A keresés közben hiba történt!'
          : 'Some error occured during searching!',
      );
    }
  }

  @Get('getGISObject')
  public async getGISObject(
    @Query() params: { gisID: string },
    @Req() req: Request,
  ): Promise<GISObject> {
    const lang = req.headers['lang-header'] ?? 'en';

    const result = await this.middleEarthService.postGISObject(params.gisID);
    if (result) {
      return result;
    } else {
      throw new NotFoundException(
        lang === 'hu'
          ? 'A helyszín lekérése közben hiba történt!'
          : 'Some error occured during object selection!',
      );
    }
  }

  @Get('getGeoJSONS')
  public async getGeoJSONS(@Req() req: Request): Promise<{
    areas: any;
    paths: any;
    places: any;
  }> {
    const lang = req.headers['lang-header'] ?? 'en';

    const result = await this.middleEarthService.postGeoJSONS();
    if (result.areas) {
      return result;
    } else {
      throw new NotFoundException(
        lang === 'hu'
          ? 'A térképi elemek lekérése közben hiba történt!'
          : 'Some error occured during map element fetching!',
      );
    }
  }

  @Get('checkEmailSend')
  public async checkEmailSend(
    @Req() req: Request,
  ): Promise<{ status: boolean; warningMessage: string | undefined }> {
    const ip = getClientIp(req);
    const lang = req.headers['lang-header'] ?? 'en';
    const postMail = await this.chatService.checkEmailSend(ip);

    switch (postMail.status) {
      case 'ok':
        return { status: true, warningMessage: undefined };
      case 'not ok':
        return {
          status: false,
          warningMessage:
            lang === 'hu'
              ? 'Kérlek, várj egy kicsit a következő üzenet küldésével!'
              : 'Please, wait a bit, till you send the next message!',
        };
      default:
        throw new NotFoundException('Could not get client ip data');
    }
  }

  @Post('postNewMail')
  public async postNewEmail(
    @Req() req: Request,
  ): Promise<{ status: boolean; message: string }> {
    const ip = getClientIp(req);
    const lang = req.headers['lang-header'] ?? 'en';

    const postMail = await this.chatService.postNewEmail(ip);

    switch (postMail.status) {
      case 'ok':
        return {
          status: true,
          message:
            lang === 'hu'
              ? 'Üzenet elküldve! Köszönöm!'
              : 'Message sent! Thank you!',
        };
      case 'not ok':
        return {
          status: false,
          message:
            lang === 'hu'
              ? 'Az üzenetküldés sikertelen! Kérlek, próbálkozz kicsit később!'
              : 'Could not send message! Please, try again a bit later!',
        };
      default:
        throw new NotFoundException(
          lang === 'hu'
            ? 'Az üzenetküldés sikertelen! Kérlek, próbálkozz kicsit később!'
            : 'Could not send message! Please, try again a bit later!',
        );
    }
  }

  @Post('postMessageToAI')
  public async postMessageToAI(
    @Req() req: Request,
    @Body() body: { message: string; replyAs: AI_CHAR },
  ): Promise<{ reply: string }> {
    const ip = getClientIp(req);
    const lang: string = (req.headers['lang-header'] as string) ?? 'en';
    const params: ChatParams = {
      message: body.message,
      replyAs: body.replyAs,
      lang: lang as 'en' | 'hu',
    };
    console.log('params: ', params);

    const result: { error: boolean; reply: string } =
      await this.chatService.streamChat(params);
    if (result.error) {
      throw new ServiceUnavailableException(
        lang === 'hu'
          ? `${body.replyAs} sajnos elfoglalt, jelenleg valamiért nem tud válaszolni!`
          : `${body.replyAs} is currently not available!`,
      );
    }
    return { reply: result.reply };
  }
}
