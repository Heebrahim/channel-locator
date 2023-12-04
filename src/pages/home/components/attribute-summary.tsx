import { useCallback, useMemo } from "react";
import { toNumber } from "../utils";
import { pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";
import * as A from "@effect/data/ReadonlyArray";
import { DataLayer } from "@/core/models/data-layer";
import Formula from "@hapi/formula";
import { Feature } from "geojson";

const constants = { E: Math.E, PI: Math.PI };

const round = (x: number) => Math.round(x);
const floor = (x: number) => Math.floor(x);
const pow = (x: number, y: number) => Math.pow(x, y);

export function AttributeSummary({
  attribute,
  features,
}: {
  attribute: DataLayer["attributes"][number];
  features: Feature[];
}) {
  const sum = useCallback(
    (name: string) =>
      features.reduce(
        (acc, feature) => acc + (feature.properties?.[name] ?? 0),
        0
      ),
    [features]
  );

  const concat = useCallback(
    (name: string, delimiter = " / ") => {
      const result = pipe(
        features,
        A.reduceRight([] as string[], (acc, feature) => [
          ...acc,
          feature.properties?.[name],
        ]),
        A.filter(Boolean)
      );

      return [...new Set(result)].join(delimiter);
    },
    [features]
  );

  const count = useCallback(
    (name: string) => {
      return pipe(
        features,
        A.reduceRight([] as string[], (acc, feature) => [
          ...acc,
          feature.properties?.[name],
        ]),
        A.filter(Boolean),
        A.length
      );
    },
    [features]
  );

  const collect = useCallback(
    (name: string) => {
      return features.reduceRight((acc, feature) => {
        const value = feature.properties?.[name];
        return [
          ...acc,
          pipe(
            O.fromNullable(value),
            O.flatMap(toNumber),
            O.getOrElse(() => 0)
          ),
        ];
      }, [] as number[]);
    },
    [features]
  );

  const min = useCallback(
    (name: string) => Math.min(...collect(name)),
    [collect]
  );

  const max = useCallback(
    (name: string) => Math.max(...collect(name)),
    [collect]
  );

  const parser = useMemo(() => {
    const formula = attribute.formula?.trim() ?? "";

    const functions = {
      round,
      floor,
      min,
      max,
      pow,

      sum,
      count,
      concat,
    };

    return formula !== ""
      ? new Formula.Parser(formula, { constants, functions })
      : null;
  }, [attribute.formula, concat, count, max, min, sum]);

  return (
    <p className="text-sm font-medium">{parser ? parser.evaluate() : "Nil"}</p>
  );
}
