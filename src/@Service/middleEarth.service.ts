import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { join, resolve } from 'path';
import { promises as fs } from 'fs';
import { GISObject } from 'src/@Model/middleEarth.model';

@Injectable()
export class MiddleEarthService {
  constructor(@InjectConnection() private mongo: Connection) {}

  private searchMapCollection = this.mongo.collection('searchMap');
  /*   private uploadsDataDir = resolve(process.cwd(), '../uploads/data');
  private uploadsImagesDir = resolve(process.cwd(), '../uploads/images'); */

  /*  private uploadsDataDir = resolve(
    process.env.UPLOADS_DIR ?? resolve(process.cwd(), 'uploads'),
    'data',
  );

  private uploadsImagesDir = resolve(
    process.env.UPLOADS_DIR ?? resolve(process.cwd(), 'uploads'),
    'images',
  ); */

  private uploadsRoot =
    process.env.UPLOADS_DIR ?? resolve(process.cwd(), '..', 'uploads'); // from web/backend -> web/uploads

  private uploadsDataDir = resolve(this.uploadsRoot, 'data');
  private uploadsImagesDir = resolve(this.uploadsRoot, 'images');

  private gisDir = process.env.GIS_DIR ?? resolve(process.cwd(), '..', 'gis');

  public async postSearchResults(input: string, lang: string): Promise<any> {
    const fieldLang = `keywords_${lang.toUpperCase()}`;

    const res = await this.searchMapCollection
      .find({
        [fieldLang]: { $regex: input, $options: 'i' },
      })
      .toArray();

    return res;
  }

  public async postGISObject(gisID: string): Promise<GISObject> {
    const gisOBJ: GISObject = {
      gisID: Number(gisID),
      name: { EN: '', HU: '' },
      description: { EN: '', HU: '' },
      gallery: [],
    };

    const obj = await this.searchMapCollection.findOne(
      {
        gisID: Number(gisID),
      },
      { projection: { name: 1 } },
    );
    gisOBJ.name = obj.name;

    const description = await this.readDescriptionByPrefixAndLang(
      Number(gisID),
    );
    gisOBJ.description = description;

    const images = await this.listImages(gisID);
    gisOBJ.gallery = images;
    return gisOBJ;
  }

  private async listImages(gisID: string): Promise<string[]> {
    const dir = join(this.uploadsImagesDir, gisID);
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const files = entries.filter((e) => e.isFile()).map((e) => e.name);

      return files.map(
        (file) => `uploads/images/${gisID}/${encodeURIComponent(file)}`,
      );
    } catch {
      // no folder -> empty gallery
      return [];
    }
  }

  private async readDescriptionByPrefixAndLang(
    gisID: number,
  ): Promise<{ EN: string; HU: string }> {
    const result = { EN: '', HU: '' };
    const prefix = `${gisID}_`;
    try {
      const entries = await fs.readdir(this.uploadsDataDir, {
        withFileTypes: true,
      });

      const files = entries
        .filter((e) => e.isFile())
        .map((e) => e.name)
        .filter((name) => name.startsWith(prefix) && name.endsWith('.txt'));

      for (const file of files) {
        const content = await fs.readFile(
          join(this.uploadsDataDir, file),
          'utf8',
        );

        if (file.includes('_EN_')) result.EN = content;
        else if (file.includes('_HU_')) result.HU = content;
      }
      return result;
    } catch {
      throw new NotFoundException('Description files not found');
    }
  }

  public async postGeoJSONS(): Promise<{
    areas: any;
    paths: any;
    places: any;
  }> {
    try {
      const areas = JSON.parse(
        await fs.readFile(join(this.gisDir, 'areas.geojson'), 'utf8'),
      );
      const paths = JSON.parse(
        await fs.readFile(join(this.gisDir, 'paths.geojson'), 'utf8'),
      );
      const places = JSON.parse(
        await fs.readFile(join(this.gisDir, 'places.geojson'), 'utf8'),
      );

      return { areas: areas, paths: paths, places: places };
    } catch (error) {
      throw new NotFoundException('GeoJSON files not found');
    }
  }
}
