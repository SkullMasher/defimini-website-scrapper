# Defimini.com Website Scrapper
Jimbo product info extraction from defimini website : https://www.defimini.com.
Uses the [Nightmare library](https://github.com/segmentio/nightmare) to automate a browser (electron/chromium) with "modern" javascript : async/await, promise, spread operator, template string...

I have received full client permission to scrap this website.

## Usage
Intall the dependencies
```
npm i
```
Execute the scrapper. After a while you will have a defimini.csv with all the info.

```
npm start
```
### Configuration
Show the browser window. Great to flex in front of your mates but get's boring overtime. Also great for debugging...

See the [Electron browser window option](https://github.com/electron/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions) for more information
```
const nightmareOptions = {
  show: true,
  width: 1366,
  height: 768,
  title: 'Defimini Jimbo Extractor',
  darkTheme: true
}
```
