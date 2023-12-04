import * as S from "@effect/schema/Schema";

export const Authentication = S.struct({
  token: S.string,
  refreshToken: S.string,
  type: S.literal("Bearer"),
  firstTimeLoggedIn: S.boolean,
  roles: S.array(
    S.struct({ authority: S.union(S.literal("ADMIN"), S.literal("USER")) })
  ),
});

export type Authentication = S.To<typeof Authentication>;
