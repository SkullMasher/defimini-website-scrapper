const fs = require('fs')
const { promisify } = require('util')
const writeFileAsync = promisify(fs.writeFile)
const { csvFormat } = require('d3-dsv')
const Nightmare = require('nightmare')
// https://github.com/electron/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions
const nightmareOptions = {
  show: true,
  width: 1366,
  height: 768,
  title: 'Defimini Jimbo Extractor',
  darkTheme: true
}

const getCarPartUrls = async () => {
  const nightmare = new Nightmare(nightmareOptions)
  const pieceAutoLink = 'https://www.defimini.com/pieces-automobiles/'
  const $carPartLinks = '#mainNav2 a.level_2'
  console.log(`Grabbing URLS from ${pieceAutoLink}`)

  // Get all car part page links
  try {
    const result = await nightmare
      .goto(pieceAutoLink)
      .wait($carPartLinks)
      .evaluate($carPartLinks => {
        // same as Array.from, transforms a nodelist into an array using spread operator
        return [...document.querySelectorAll($carPartLinks)]
          .map(elem => elem.href)
      }, $carPartLinks)
      .end()

    console.log(`${result.length} urls found`)
    return result
  } catch (e) {
    console.error(e)
  }
}

getInfoFromURL = async (URL) => {
  const nightmare = new Nightmare(nightmareOptions)
  const $product = '.j-product'
  console.log(`Get info from ${URL}`)

  try {
    const result = await nightmare
      .goto(URL)
      .wait($product)
      .evaluate($product => {
        const allProducts = document.querySelectorAll($product)
        const $price = '.cc-shop-product-price-current'
        const $productName = '.cc-shop-product-desc .fn'
        const $productDescription = '.cc-shop-product-desc description'
        const category = document.title.split('- defimini')[0].trim()
        const data = []

        allProducts.forEach(product => {
          const price = `${product.querySelector($price).getAttribute('content')}€`
          const productName = product.querySelector($productName).textContent

          data.push({categorie: category, prix: price, nomproduit: productName})
        })

        return data
      }, $product)
      .end()

    console.log(`${result.length} product found`)
    return result
  } catch (e) {
    console.error(e)
  }
}

// Create an array of object, each obect will be a line in the CSV
const csvContent = async () => {
  const urls = await getCarPartUrls()

  const series = urls.reduce(async (accumulator, url) => {
    const dataArray = await accumulator
    dataArray.push(await getInfoFromURL(url))
    return dataArray
  // Reduce initial value is an already resolved Promise object, so that reduce
  // has a Promise to start with.
  }, Promise.resolve([]))

  const content = await series
  const mergeContent = content.flat()
  console.log('-------------------------------------------------------------')
  console.log(`${mergeContent.length} total product found across ${urls.length} pages`)

  return mergeContent
}

const createCSV = async () => {
  const csvData = csvFormat(await csvContent())
  try {
    console.log(`Product added to definimi.csv`)
    return await writeFileAsync('definimi.csv', csvData, { encoding: 'utf8' })
  } catch (e) {
    console.error(e)
  }
}

// run the entire thing ! MAGIC !
createCSV()
