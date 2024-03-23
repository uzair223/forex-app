import { createContext, useState, useEffect, useContext } from "react";

const TimezoneContext = createContext<
  [number, React.Dispatch<React.SetStateAction<number>>] | null
>(null);

export function TimezoneProvider({ children }: React.PropsWithChildren) {
  const [tz, setTz] = useState(0);
  useEffect(() => {
    setTz(-(new Date().getTimezoneOffset() / 60));
  }, [setTz]);

  return <TimezoneContext.Provider value={[tz, setTz]}>{children}</TimezoneContext.Provider>;
}

export const useTimezone = () => useContext(TimezoneContext);
