import * as S from "@effect/schema/Schema";


const Organisation = S.struct({
  id: S.number,
  name: S.string,
  tableName: S.string,
  columnName: S.string

})

export const Authentication = S.struct({
  token: S.string,
  refreshToken: S.string,
  type: S.literal("Bearer"),
  firstTimeLoggedIn: S.boolean,
  role: S.union(S.literal("ROLE_SUPER_ADMIN"), S.literal("ROLE_ADMIN")),
  organisation: S.union(Organisation, S.null)
});



// export const Authentication = S.struct({
//   token: S.string,
//   refreshToken: S.string,
//   type: S.literal("Bearer"),
//   firstTimeLoggedIn: S.boolean,
//   roles: S.array(
//     S.struct({ authority: S.union(S.literal("ADMIN"), S.literal("USER")) })
//   ),
// });


export type Authentication = S.To<typeof Authentication>;
