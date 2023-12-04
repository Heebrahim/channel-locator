import { Button } from "@chakra-ui/react";
import { Navigate, useRouteError } from "react-router-dom";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import { StatusError } from "http-kit/response";
import { Unauthorized } from "./core/exceptions/authentication";
import { invalidate } from "./core/services/authentication";
import { SessionStorageLive } from "./core/adapters/storage/implementation";

export function AppError() {
  const error = useRouteError();

  if (
    (error instanceof StatusError &&
      (error.response.status === 401 || error.response.status === 403)) ||
    error instanceof Unauthorized
  ) {
    pipe(invalidate(), Effect.provideLayer(SessionStorageLive), Effect.runFork);

    return <Navigate replace to="/login" />;
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-2">
      <h1 className="text-3xl font-semibold text-gray-400">
        An error occurred
      </h1>

      <Button size="sm" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}
