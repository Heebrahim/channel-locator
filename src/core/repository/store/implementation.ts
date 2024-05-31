import * as Effect from "@effect/io/Effect";
import * as Either from "@effect/data/Either"
import * as Layer from "@effect/io/Layer";
import { pipe } from "@effect/data/Function";

import { Stores, Variant, StoreRepository } from "./contract";
import { FeatureService } from "@/core/tags/spectrum";
import { filterSpectrumResult } from "../utils";
import { SpectrumError } from "@/core/exceptions/spectrum";
import { getAuth } from "@/common/authUtil";


export const StoreRepositoryLive = Layer.effect(
  StoreRepository,
  Effect.gen(function* (_) {
    const service = yield* _(FeatureService);

    const auth = getAuth()

    Either.isRight(auth) ? console.log(auth.right.roles) : null


    

    const branches_mapName = `/CHANNELS/NamedMaps/FIRST_BANK`;

    const POS_mapName = `/CHANNELS/NamedMaps/ZENITH_BANK`;

    const ATM_mapName = `/CHANNELS/NamedMaps/UNION_BANK`;


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
                ? POS_mapName : ATM_mapName,
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
                variant === Variant.branch 
                ? branches_mapName
                :variant === Variant.pos  
                ? POS_mapName : ATM_mapName,
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
