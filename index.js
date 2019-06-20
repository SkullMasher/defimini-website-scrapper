const Nightmare = require('nightmare')
// https://github.com/electron/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions
const nightmare = Nightmare({
  show: true,
  width: 1366,
  height: 768,
  title: 'Defimini jimbo extractor',
  darkTheme: true,
})

// Jimbo product extraction from defimini website : https://www.defimini.com
const pieceAutoLink = 'https://www.defimini.com/pieces-automobiles/'
const carPartList = '#mainNav2'
const carPartListLinks = '#mainNav2 a.level_2'

// get all car part page links
nightmare
  .goto(pieceAutoLink)
  // .type('#search_form_input_homepage', 'github nightmare')
  // .click('#search_button_homepage')
  .wait(carPartListLinks)
  .evaluate(carPartListLinks => {
    return Array.from(document.querySelectorAll(carPartListLinks)).map(elem => elem.href)
  }, carPartListLinks)
  .end()
  .then(console.log)
  .catch(error => {
    console.error('Search failed:', error)
  })
