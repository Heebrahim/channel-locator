import { SpectrumError } from "@/core/exceptions/spectrum";
import { LatLng } from "@/core/types/misc";
import * as Context from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";

import { FeatureCollection, Geometry } from "geojson";

export type CoverageSignal = FeatureCollection<
  Geometry,
  {
    Distance: number;
    Signal_Class: string;
    Signal_Strength: number;
  }
>;

export interface CoverageSignalRepository {
  findAtPoint(
    table: string,
    point: LatLng
  ): Effect.Effect<never, SpectrumError, CoverageSignal>;
}

export const CoverageSignalRepository = Context.Tag<CoverageSignalRepository>();
