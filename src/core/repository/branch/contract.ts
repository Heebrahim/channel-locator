import * as Context from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";

import { SpectrumError } from "@/core/exceptions/spectrum";
import { LatLng } from "@/core/types/misc";
import { FeatureCollection, Geometry } from "geojson";

export enum Variant {
  branch = "branch",
  pos = "pos",
  atm = "atm"
  
}

export type Branches = FeatureCollection<Geometry, unknown>;
export interface BranchRepository {
  findAll(variant: Variant): Effect.Effect<never, SpectrumError, Branches>;

  findNearestTo(
    point: LatLng,
    variant: Variant
  ): Effect.Effect<never, SpectrumError, Branches>;

  findAllCompetitors(variant: Variant): Effect.Effect<never, SpectrumError, Branches>;

  findNearestToCompetitors(
    point: LatLng,
    variant: Variant
  ): Effect.Effect<never, SpectrumError, Branches>;

}

export const BranchRepository = Context.Tag<BranchRepository>();
