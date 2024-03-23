import { createContext, useContext, useEffect, useState } from "react";

const DarkThemeContext = createContext<[boolean | undefined, () => void] | null>(null);

export function DarkThemeProvider({ children }: React.PropsWithChildren) {
  const [isDark, setDark] = useState<boolean | undefined>();

  const toggleDark = () =>
    setDark(v => {
      localStorage.setItem("darkTheme", (!v).toString()); // toggle darkTheme locally
      return !v;
    });

  useEffect(() => {
    setDark(
      localStorage.darkTheme === "true" &&
        // default darkTheme to system theme
        !("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
  }, [setDark]);

  useEffect(() => {
    // add dark theme to DOM root
    if (typeof isDark === "undefined") return;
    document.body.classList.remove("opacity-0");
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  return (
    <DarkThemeContext.Provider value={[isDark, toggleDark]}>{children}</DarkThemeContext.Provider>
  );
}

export const useDarkTheme = () => useContext(DarkThemeContext)!;
