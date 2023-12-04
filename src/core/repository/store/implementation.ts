import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import { pipe } from "@effect/data/Function";

import { Stores, Variant, StoreRepository } from "./contract";
import { FeatureService } from "@/core/tags/spectrum";
import { filterSpectrumResult } from "../utils";
import { SpectrumError } from "@/core/exceptions/spectrum";

const stores_mapName = "/COVERAGES/NamedMaps/MTNN Walk-in Shops";

const momoAgents_mapName = "/COVERAGES/NamedMaps/MOMO_MTN";

export const StoreRepositoryLive = Layer.effect(
  StoreRepository,
  Effect.gen(function* (_) {
    const service = yield* _(FeatureService);

    return {
      findAll(variant) {
        return pipe(
          Effect.tryPromise({
            catch: (e) => new SpectrumError(e),
            try: () =>
              service.searchNearest(
                variant === Variant.store ? stores_mapName : momoAgents_mapName,
                { type: "Point", coordinates: [1, 2] },
                { withinDistance: "50000000 mi", maxFeatures: "1000" }
              ),
          }),
          Effect.flatMap((_) => filterSpectrumResult<Stores>(_))
        );
      },
      findNearestTo({ lat, lng }, variant) {
        return pipe(
          Effect.tryPromise({
            catch: (e) => new SpectrumError(e),
            try: () =>
              service.searchNearest(
                variant === Variant.store ? stores_mapName : momoAgents_mapName,
                { type: "Point", coordinates: [lng, lat] },
                { withinDistance: "5000 mi", maxFeatures: "5" }
              ),
          }),
          Effect.flatMap((_) => filterSpectrumResult(_))
        );
      },
    };
  })
);
