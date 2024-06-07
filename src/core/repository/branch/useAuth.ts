
import { useMemo } from "react";
import { getAuth } from "@/common/authUtil";


export const useAuth = () => {
    const auth = useMemo(() => {
        return getAuth()}, [location.pathname])
      return auth
}