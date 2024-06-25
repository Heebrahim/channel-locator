import { Variant } from "@/core/repository/branch/contract";

import { BranchRepositoryLive } from "@/core/repository/branch/implementation";

import * as BranchService from "@/core/services/branch";

import { pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";
import * as S from "@effect/data/String";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";

import { LoaderFunctionArgs } from "react-router-dom";

import { HttpClientLiveNoAuth } from "@/common/http-client";
import { getFeatureService, getTab, parseLatLng } from "./utils";
import { SearchType, Tab } from "./types";

const layer = BranchRepositoryLive.pipe(
  Layer.useMerge(HttpClientLiveNoAuth),
  Layer.useMerge(BranchRepositoryLive),
  Layer.useMerge(getFeatureService())
);

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams;


  if (search.get("clear") === "true") {
    return {
      branches: null,
      competitors: null,
      latlng: null
    };
  }


  const tab = getTab(search.get("tab"));

  const latlng = parseLatLng(search.get("p"));

  const searchType = pipe(
    O.fromNullable(search.get("searchType")),
    O.filter(S.isNonEmpty),
    O.getOrElse(() => SearchType.all)
  );

  const variant = pipe(
    O.fromNullable(search.get("variant")),
    O.filter(S.isNonEmpty),
    O.getOrElse(() => Variant.branch)
  ) as Variant;

  // const branchesProgram = Effect.gen (function* (_){
  //   const branches_ = yield* _(
  //     pipe(
  //       searchType,
  //       O.match({
  //         onNone: () => Effect.succeed(null),
  //         onSome: (searchType) =>
  //           pipe(
  //             searchType === SearchType.nearest 
  //               ? Effect.flatMap(latlng, (latlng) =>
  //                   BranchService.getNearestBranches(latlng, variant)
  //                 )
  //               : BranchService.getBranches(variant),
  //           ),
  //       })
  //     ) )
  //   return branches_
  // }).pipe(Effect.provideLayer(layer), Effect.either)


  // const competitorProgram = pipe(
  //   searchType,
  //   O.match({
  //     onNone: () => Effect.succeed(null),
  //     onSome: (searchType) =>
  //       pipe(
  //         searchType === SearchType.nearest 
  //           ? Effect.flatMap(latlng, (latlng) =>
  //               BranchService.getNearestCompetitors(latlng, variant)
  //             )
  //           : BranchService.getCompetitors(variant),
  //         Effect.provideLayer(layer),
  //         Effect.either
  //       ),
  //   })
  // );

  const branchesProgram = Effect.gen(function* (_) {
    if (searchType === SearchType.nearest) {
      return yield* _(Effect.flatMap(latlng, (latlng) =>
        BranchService.getNearestBranches(latlng, variant)
      ));
    } else {
      return yield* _(BranchService.getBranches(variant));
    }
  }).pipe(Effect.provideLayer(layer), Effect.either);


  const competitorProgram = Effect.gen(function* (_) {
    if (searchType === SearchType.nearest) {
      return yield* _(Effect.flatMap(latlng, (latlng) =>
        BranchService.getNearestCompetitors(latlng, variant)
      ));
    } else {
      return yield* _(BranchService.getCompetitors(variant));
    }
  }).pipe(Effect.provideLayer(layer), Effect.either);



  const result = await Effect.runPromise(
    Effect.all({
      // branches:tab === Tab.Branches ? BranchesProgram : Effect.succeed(null),
      branches: tab === Tab.branches ? branchesProgram : Effect.succeed(null),
      competitors: tab === Tab.branches? competitorProgram : Effect.succeed(null)
    })
  );


  return {
    ...result,
    branches: result.branches,
    competitors: result.competitors,
    latlng: O.getOrNull(latlng),   
  };
}
