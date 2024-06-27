import * as Context from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
import { Err } from "http-kit";
import { JsonParseError, StatusError } from "http-kit/response";
import { DataLayer } from "../../models/data-layer";
import { APIRes } from "../../types/api";

import { LatLng } from "@/core/types/misc";
import { SearchAtPointOptions } from "@/libs/spectrum/services/FeatureService";
import { FeatureCollection, Geometry } from "geojson";
import { SpectrumError } from "@/core/exceptions/spectrum";

export interface DataLayerRepository {
  getAll(): Effect.Effect<
    never,
    Err | JsonParseError | StatusError,
    DataLayer[]
  >;


  getAllCompetitors (): Effect.Effect<
    never,
    Err | JsonParseError | StatusError,
    DataLayer[] 
  >

  searchAt(
    layer: DataLayer,
    latlng: LatLng,
    radius: number,
    options?: SearchAtPointOptions
  ): Effect.Effect<never, SpectrumError, FeatureCollection>;

  searchWithin(
    layer: DataLayer,
    geometry: Geometry
  ): Effect.Effect<never, SpectrumError, any>;
}

export const DataLayerRepository = Context.Tag<DataLayerRepository>();
