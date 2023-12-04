import * as S from "zod";

export const CoverageSignal = S.object({
  id: S.number(),
  colour: S.string(),
  minLevel: S.number(),
  maxLevel: S.number(),
  description: S.optional(S.string()),
  signalClass: S.union([
    S.literal("LOW"),
    S.literal("MODERATE"),
    S.literal("GOOD"),
    S.literal("EXCELLENT"),
  ]),
});

export type CoverageSignal = S.infer<typeof CoverageSignal>;
