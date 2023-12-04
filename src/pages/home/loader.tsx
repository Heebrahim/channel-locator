import { Variant } from "@/core/repository/store/contract";

import { CoverageSignalRepositoryLive } from "@/core/repository/coverage-signal/implementation";
import { NetworkRepositoryLive } from "@/core/repository/network/implementation";
import { StoreRepositoryLive } from "@/core/repository/store/implementation";

import * as CoverageSignalService from "@/core/services/coverage-signal";
import * as NetworkService from "@/core/services/network";
import * as StoreService from "@/core/services/store";

import * as E from "@effect/data/Either";
import { pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";
import * as A from "@effect/data/ReadonlyArray";
import * as S from "@effect/data/String";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";

import { LoaderFunctionArgs } from "react-router-dom";

import { HttpClientLiveNoAuth } from "@/common/http-client";
import { getFeatureService, getTab, parseLatLng } from "./utils";
import { SearchType, Tab } from "./types";

const layer = NetworkRepositoryLive.pipe(
  Layer.useMerge(HttpClientLiveNoAuth),
  Layer.useMerge(StoreRepositoryLive),
  Layer.useMerge(CoverageSignalRepositoryLive),
  Layer.useMerge(getFeatureService())
);

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams;

  const tab = getTab(search.get("tab"));

  const latlng = parseLatLng(search.get("p"));

  const networkId = pipe(
    O.fromNullable(search.get("network")),
    O.filter(S.isNonEmpty),
    O.map(S.trim)
  );

  const userActive = pipe(
    O.fromNullable(search.get("ua")),
    O.map(Boolean),
    O.getOrElse(() => false)
  );

  const networksProgram = Effect.gen(function* (_) {
    const networks = yield* _(NetworkService.getNetworks());

    let counter = 0;
    let coverage: O.Option<string> = O.none();
    const sortedNetworks = networks.sort((a, b) => b.priority - a.priority);

    let network = pipe(
      networkId,
      O.map(parseFloat),
      O.flatMap((id) => A.findFirst(networks, (_) => _.id === id))
    );

    while (counter < networks.length - 1) {
      const coverage_ = yield* _(
        Effect.zipWith(network, latlng, (n, p) => [n, p] as const),
        Effect.flatMap((args) => CoverageSignalService.getCoverage(...args)),
        Effect.either
      );

      if (E.isRight(coverage_)) {
        coverage = coverage_.right;

        // stop once we find one or the user selected a specific network
        if (userActive || O.isSome(coverage)) break;
      }

      network = O.some(sortedNetworks[counter]);

      counter++;
    }

    if (!userActive && O.isNone(coverage)) {
      network = O.none();
    }

    return { networks, coverage, network: O.getOrNull(network) };
  }).pipe(Effect.provideLayer(layer), Effect.either);

  const searchType = pipe(
    O.fromNullable(search.get("searchType")),
    O.filter(S.isNonEmpty)
  );

  const variant = pipe(
    O.fromNullable(search.get("variant")),
    O.filter(S.isNonEmpty),
    O.getOrElse(() => Variant.store)
  ) as Variant;

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

  const result = await Effect.runPromise(
    Effect.all({
      stores: tab === Tab.stores ? storesProgram : Effect.succeed(null),
      networks: tab === Tab.coverages ? networksProgram : Effect.succeed(null),
    })
  );

  const [network_and_coverage, networks] = result.networks
    ? [
        E.getOrNull(result.networks),
        E.mapRight(result.networks, (_) => _.networks),
      ]
    : [];

  return {
    ...result,
    networks,
    latlng: O.getOrNull(latlng),
    network: network_and_coverage?.network,
    coverageSignal: network_and_coverage?.coverage,
  };
}
