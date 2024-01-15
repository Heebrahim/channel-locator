import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import { pipe } from "@effect/data/Function";

import { Stores, Variant, StoreRepository } from "./contract";
import { FeatureService } from "@/core/tags/spectrum";
import { filterSpectrumResult } from "../utils";
import { SpectrumError } from "@/core/exceptions/spectrum";

const stores_mapName = "/COVERAGES/NamedMaps/MTNN Walk-in Shops";

const momoAgents_mapName = "/COVERAGES/NamedMaps/MOMO_MTN";

const branches_mapName = "/STANBIC/NamedMaps/stabic_Stanbic_Stanbic_BANK_ADDRESS";

const POS_mapName = "/STANBIC/NamedMaps/stabic_Stanbic_POS_ready_agents";

const customers_mapName = "/STANBIC/NamedMaps/stabic_Stanbic_Ward Nigeria Pop Stanbic";



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
                variant === Variant.branch 
                ? branches_mapName 
                :variant === Variant.pos 
                ? POS_mapName : customers_mapName,
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
                variant === Variant.branch ? branches_mapName : POS_mapName,
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
