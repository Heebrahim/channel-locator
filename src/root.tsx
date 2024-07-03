import { Progress } from "@chakra-ui/react";
import { Outlet, useLocation, useNavigation } from "react-router-dom";

import { useMemo } from "react";

import { Navigate } from "react-router-dom";

import * as Either from "@effect/data/Either";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import { SessionStorageLive } from "@/core/adapters/storage/implementation";
import { getAuthentication } from "@/core/services/authentication";

// const internalApp = import.meta.env.INTERNAL_APP_HOSTNAME;



export function Root() {
  const navigation = useNavigation();

  const location = useLocation();

  const auth = useMemo(() => {
    return pipe(
      getAuthentication(),
      Effect.provideLayer(SessionStorageLive),
      Effect.either,
      Effect.runSync
    );
  }, [location.pathname]); // We use the pathname to ensure that this runs everytime the route changes



  // if (window.location.href === internalApp) {
    if (Either.isLeft(auth)) {
      return <Navigate state={{ from: location }} replace to="/login" />;
    } else if (auth.right.firstTimeLoggedIn) {
      return (
        <Navigate state={{ from: location }} replace to="/change-password" />
      );
    }
  // }

  return (
    <>
      {navigation.state === "loading" && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Progress size="xs" isIndeterminate className="w-full" />
        </div>
      )}
      <Outlet />
    </>
  );
}
