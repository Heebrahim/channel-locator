import { Variant } from "@/core/repository/store/contract";

import { StoreRepositoryLive } from "@/core/repository/store/implementation";

import * as StoreService from "@/core/services/store";

import { pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";
import * as S from "@effect/data/String";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";

import { LoaderFunctionArgs } from "react-router-dom";

import { HttpClientLiveNoAuth } from "@/common/http-client";
import { getFeatureService, getTab, parseLatLng } from "./utils";
import { SearchType, Tab } from "./types";

const layer = StoreRepositoryLive.pipe(
  Layer.useMerge(HttpClientLiveNoAuth),
  Layer.useMerge(StoreRepositoryLive),
  Layer.useMerge(getFeatureService())
);

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams;


  if (search.get("clear") === "true") {
    return {
      branches: null,
      latlng: null,
    };
  }


  const tab = getTab(search.get("tab"));

  const latlng = parseLatLng(search.get("p"));

  const searchType = pipe(
    O.fromNullable(search.get("searchType")),
    O.filter(S.isNonEmpty)
  );

  const variant = pipe(
    O.fromNullable(search.get("variant")),
    O.filter(S.isNonEmpty),
    O.getOrElse(() => Variant.branch)
  ) as Variant;

  const storePro = Effect.gen (function* (_){
    const stores_ = yield* _(
      pipe(
        searchType,
        O.match({
          onNone: () => Effect.succeed(null),
          onSome: (searchType) =>
            pipe(
              searchType === SearchType.nearest 
                ? Effect.flatMap(latlng, (latlng) =>
                    StoreService.getNearestStores(latlng, variant)
                  )
                : StoreService.getStores(variant),
            ),
        })
      )

      )
    return stores_
  }).pipe(Effect.provideLayer(layer), Effect.either)


  

  const storesProgram = pipe(
    searchType,
    O.match({
      onNone: () => Effect.succeed(null),
      onSome: (searchType) =>
        pipe(
          searchType === SearchType.nearest 
            ? Effect.flatMap(latlng, (latlng) =>
                StoreService.getNearestStores(latlng, variant)
              )
            : StoreService.getStores(variant),
          Effect.provideLayer(layer),
          Effect.either
        ),
    })
  );

  
  // const defaultSearchType = isInternalUser() ? SearchType.all : SearchType.nearest;


  // const storesProgram = pipe(
  //   O.fromNullable(search.get("searchType")),
  //   O.getOrElse(() => defaultSearchType), 
  //   (searchType) => {
  //     return pipe(
  //       searchType === SearchType.nearest && parseLatLng(search.get("p"))
  //         ? Effect.flatMap(parseLatLng(search.get("p")), (latlng) =>
  //             StoreService.getNearestStores(latlng, variant)
  //           )
  //         : StoreService.getStores(variant),
  //       Effect.provideLayer(layer),
  //       Effect.either
  //     );
  //   }
  // );

  const result = await Effect.runPromise(
    Effect.all({
      // branches:tab === Tab.stores ? storesProgram : Effect.succeed(null),
      branches: tab === Tab.stores ? storePro : Effect.succeed(null), 
    })
  );


  return {
    ...result,
    branches: result.branches,
    latlng: O.getOrNull(latlng),   
  };
}
