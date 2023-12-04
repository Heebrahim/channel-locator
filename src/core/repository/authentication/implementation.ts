import * as Http from "http-kit";
import { json } from "http-kit/body";
import * as Res from "http-kit/response";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as S from "@effect/schema/Schema";

import { HttpClient } from "@/common/http-client";
import { Authentication } from "../../models/authentication";
import { AuthenticationRepository } from "./contract";

// export const signIn: IAuthenticationRepository["signIn"] = (user) => {
//   return pipe(
//     Http.post("/auth/signin", json(user)),
//     Effect.flatMap((res) => {
//       return res.status === 401
//         ? Effect.fail(new Unauthorized("Wrong username or password"))
//         : Effect.succeed(res);
//     }),
//     Res.toJson<Authentication | ApiError>(),
//     Effect.flatMap(S.parseEither(Authentication))
//   );
// };

// export const refreshToken: IAuthenticationRepository["refreshToken"] = (
//   token
// ) => {
//   return pipe(
//     Http.request(`/auth/signin?token=${token}`, { method: "POST" }),
//     Effect.flatMap((res) => {
//       return res.status === 401
//         ? Effect.fail(new ExpiredRefreshToken())
//         : Effect.succeed(res);
//     }),
//     Res.toJson<Authentication | ApiError>(),
//     Effect.flatMap(S.parseEither(Authentication))
//   );
// };

// export const AuthenticationRepositoryLive = AuthenticationRepository.of({
//   signIn,
//   refreshToken,
// });

export const AuthenticationRepositoryLive = Layer.effect(
  AuthenticationRepository,
  Effect.gen(function* (_) {
    const httpClient = yield* _(HttpClient);

    return {
      signIn(user) {
        return pipe(
          Http.post("/auth/signin", json(user)),
          Res.filterStatusOk(),
          Res.toJson(),
          Effect.flatMap(S.parseEither(Authentication)),
          httpClient.make
        );
      },
      refreshToken(token) {
        return pipe(
          Http.request(`/auth/signin?token=${token}`, { method: "POST" }),
          Res.filterStatusOk(),
          Res.toJson(),
          Effect.flatMap(S.parseEither(Authentication)),
          httpClient.make
        );
      },
    };
  })
);
