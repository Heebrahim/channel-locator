import { Button } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { LatLngLiteral } from "leaflet";
import { computeRoute } from "../utils";

import { constNull, pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as O from "@effect/data/Option";
import * as A from "@effect/data/ReadonlyArray";

import * as Http from "http-kit";
import * as Fetch from "http-kit/fetch";

type LatLng = LatLngLiteral;

const apiKey = import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY;

export function DistanceBetween({
  end,
  start,
}: {
  end: LatLng;
  start: LatLng;
}) {
  const query = useQuery({
    refetchInterval: false,
    refetchOnWindowFocus: false,
    queryKey: ["route", "approximate", start, end],
    async queryFn() {
      return pipe(
        computeRoute({
          apiKey,
          to: end,
          from: start,
          routeMask: ["duration", "distanceMeters"],
        }),
        Effect.map((_) => A.head(_.routes)),
        Http.provide(Fetch.adapter),
        Effect.runPromise,
      );
    },
  });

  return (
    <p>
      {query.data ? (
        pipe(
          query.data,
          O.match({
            onNone: constNull,
            onSome({ distanceMeters }) {
              return distanceMeters ? (
                <i>
                  Approx. Distance:{" "}
                  {(distanceMeters !== 0 ? distanceMeters / 1000 : 0) + "km"}
                </i>
              ) : (
                <span>Unable to calculate</span>
              );
            },
          }),
        )
      ) : query.isError ? (
        <span className="flex space-x-2 items-center">
          <i>An error occurred</i>
          <Button size="xs" onClick={() => query.refetch()}>
            Retry
          </Button>
        </span>
      ) : (
        <i>Calculating route...</i>
      )}
    </p>
  );
}
