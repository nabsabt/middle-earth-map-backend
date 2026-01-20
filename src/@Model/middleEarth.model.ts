export interface SearchResults {
  name: {
    EN: string;
    HU: string;
  };
  gisID: number;
}

export interface GISObject {
  gisID: number;
  name: {
    EN: string;
    HU: string;
  };
  description: {
    EN: string;
    HU: string;
  };
  gallery: string[];
  area?: {
    sqKm: number;
    sqMi: number;
  };
  length?: {
    Km: number;
    Mi: number;
  };
}

export interface SearchResultError {
  message: {
    HU: SEARCH_RESULT_NOT_FOUND;
    EN: SEARCH_RESULT_NOT_FOUND;
  };
}
type SEARCH_RESULT_NOT_FOUND =
  | 'Some error occured during searching!'
  | 'A keresés közben hiba történt!';

export interface getGISObjectError {
  message: {
    HU: GIS_OBJECT_NOT_FOUND;
    EN: GIS_OBJECT_NOT_FOUND;
  };
}
type GIS_OBJECT_NOT_FOUND =
  | 'Some error occured during object selection!'
  | 'A helyszín lekérés közben hiba történt!';

export interface getGeoJSONSError {
  message: {
    HU: GEOJSON_NOT_FOUND;
    EN: GEOJSON_NOT_FOUND;
  };
}
type GEOJSON_NOT_FOUND =
  | 'Some error occured during map element fetching!'
  | 'A térképi elemek lekérése közben hiba történt!';
