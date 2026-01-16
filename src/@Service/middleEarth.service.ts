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

    const spatialDimensions: any = await this.getGeoPropsByGisId(gisID);
    if (spatialDimensions) {
      if (spatialDimensions.area_sqkm) {
        gisOBJ.area = {
          sqKm: spatialDimensions.area_sqkm,
          sqMi: spatialDimensions.area_sqmile,
        };
      } else if (spatialDimensions.length_km) {
        gisOBJ.length = {
          Km: spatialDimensions.length_km,
          Mi: spatialDimensions.length_mi,
        };
      }
    }
    return gisOBJ;
  }

  private async listImages(gisID: string): Promise<string[]> {
    const dir = join(this.uploadsImagesDir, gisID);
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const files = entries.filter((e) => e.isFile()).map((e) => e.name);

      /* return files.map(
        (file) => `uploads/images/${gisID}/${encodeURIComponent(file)}`,
      ); */
      return files.map(
        (file) =>
          `${process.env.SERVER_URL}:${process.env.PORT ?? 3000}/uploads/images/${gisID}/${encodeURIComponent(file)}`,
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

  private async getGeoPropsByGisId(
    gisID: number | string,
  ): Promise<
    | { length_km: number; length_mi: number }
    | { area_sqkm: number; area_sqmile: number }
    | null
  > {
    const idStr = String(gisID);

    if (idStr.startsWith('2')) {
      const paths = JSON.parse(
        await fs.readFile(join(this.gisDir, 'paths.geojson'), 'utf8'),
      );

      const feature = paths.features.find(
        (f: any) => f?.properties?.gisID === parseInt(gisID as string),
      );
      if (!feature) return null;

      const { length_km, length_mi } = feature.properties;

      return { length_km, length_mi };
    }

    if (idStr.startsWith('3')) {
      const areas = JSON.parse(
        await fs.readFile(join(this.gisDir, 'areas.geojson'), 'utf8'),
      );

      const feature = areas.features.find(
        (f: any) => f?.properties?.gisID === parseInt(gisID as string),
      );
      if (!feature) return null;

      const { area_sqkm, area_sqmile } = feature.properties;

      return { area_sqkm, area_sqmile };
    }

    return null;
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
