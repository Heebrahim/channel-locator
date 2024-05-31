import * as Context from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";

import { SpectrumError } from "@/core/exceptions/spectrum";
import { LatLng } from "@/core/types/misc";
import { FeatureCollection, Geometry } from "geojson";

export enum Variant {
  store = "store",
  branch = "branch",
  pos = "pos",
  atm = "atm"
  
}

export type Stores = FeatureCollection<Geometry, unknown>;

export interface StoreRepository {
  findAll(variant: Variant): Effect.Effect<never, SpectrumError, Stores>;

  findNearestTo(
    point: LatLng,
    variant: Variant
  ): Effect.Effect<never, SpectrumError, Stores>;
}

export const StoreRepository = Context.Tag<StoreRepository>();
