import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { EventSourceProvider } from "./lib/hooks/eventSource";

import "./style.css";
import { TimezoneProvider } from "./lib/hooks/useTimezone";
import { DarkThemeProvider } from "./lib/hooks/useDarkTheme";
export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

const DEFAULTS = [
  "XAU/USD",
  "EUR/USD",
  "GBP/USD",
  "EUR/GBP",
  "USD/JPY",
  "USD/CHF",
  "USD/CAD",
  "AUD/USD",
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>Forex Dashboard</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="transition duration-500 opacity-0">
        <EventSourceProvider defaults={DEFAULTS}>
          <TimezoneProvider>
            <DarkThemeProvider>
              <Outlet />
            </DarkThemeProvider>
          </TimezoneProvider>
        </EventSourceProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
