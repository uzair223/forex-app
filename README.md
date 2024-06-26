# Forex App

Basic implementation of a Forex dashboard which allows user to select up to 8 different instruments as a part of their watchlist (displayed as mini charts).
Central candlestick chart with functionality to change timeframes, and add/remove indicators. Implemented using d3.js.
Economic calendar also included which subscribes to an RSS feed and parses in order to display in a panel to the left.

Data is pulled from Dukascopy API as `bid_high`, `bid_low`, `ask_high`, `ask_low` every second and transformed into `bid` and `ask` OHLC values.
Results are streamed to the client using Server-Sent Events.

## Screenshots
![dashboard](readme_img/ss_dashboard.png)
![indicators](readme_img/ss_indicator.png)
![economic calendar filters](readme_img/ss_filter.png)

## Run project
```sh
git clone https://github.com/uzair223/forex-app
cd forex-app
npm install
npm run dev
```
