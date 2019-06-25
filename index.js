const fs = require('fs')
const { promisify } = require('util')
const writeFileAsync = promisify(fs.writeFile)
const { csvFormat } = require('d3-dsv')
const xmlFormat = require('xmlbuilder')
const Nightmare = require('nightmare')
// https://github.com/electron/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions
const nightmareOptions = {
  show: false,
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

getInfoFromURL = async (URL, index, urlsLength) => {
  const nightmare = new Nightmare(nightmareOptions)
  const $product = '.j-product'
  console.log(`[${index}/${urlsLength}] Get info from ${URL}`)

  try {
    const result = await nightmare
      .goto(URL)
      .wait($product)
      .evaluate($product => {
        const category = document.title.split('- defimini')[0].trim()
        // $ means a selector (shoutout to jquery)
        const $productName = '.cc-shop-product-desc .fn'
        const $productDescription = '.cc-shop-product-desc .description'
        const $price = '.cc-shop-product-price-current'
        const $weight = '.j-product-weight'
        const $pictures = '.cc-shop-product-img img'
        const data = []

        document.querySelectorAll($product).forEach(product => {
          const productFind = selector => {
            return product.querySelector(selector)
          }
          // get & format product info using the previously mention selector
          const productName = productFind($productName).textContent
          const productDescription = productFind($productDescription).innerText.replace(/\n/g, ' ').trim()
          const price = `${productFind($price).getAttribute('content')}€`
          const weight = (productFind($weight) !== null) ? productFind($weight).textContent.trim() : ''
          const pictures = [...product.querySelectorAll($pictures)].map(img => img.src)

          data.push({
            category: category,
            productName: productName,
            productDescription: productDescription,
            price: price,
            weight: weight,
            pictures: pictures
          })
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

// Create an array of object, each object contains a single product data
const defiminiData = async () => {
  const urls = await getCarPartUrls()
  // const urls = ['https://www.defimini.com/pieces-automobiles/anciennes-1-50']
  const series = urls.reduce(async (accumulator, url, index, urls) => {
    const urlsLength = urls.length
    const dataArray = await accumulator
    dataArray.push(await getInfoFromURL(url, index + 1, urlsLength))
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

const createCSV = async (data) => {
  const outFile = 'definimi.csv'
  const csvData = csvFormat(data)

  try {
    console.log(`Product added to ${outFile}`)
    return await writeFileAsync(outFile, csvData, { encoding: 'utf8' })
  } catch (e) {
    console.error(e)
  }
}

const createXML = async (data) => {
  const outFile = 'definimi.xml'
  const xmlData = {
    wannonce: {
      annonce: data.map((annonce, index) => {
        return {
          id: index,
          category: '17',
          country: 'fr',
          address: 'Ruelle du Pre Didier',
          city: 'Rambervillers',
          postcode: '88700',
          region: 'Grand Est',
          title: annonce.category,
          content: annonce.productDescription,
          price: annonce.price.slice(0, -1), // remove curency
          phone: '06 59 47 59 02',
          pictures: {
            picture_url: annonce.pictures.map(image => image)
          }
        }
      })
    }
  }

  try {
    const xml = xmlFormat.create(xmlData, { encoding: 'utf-8' }).end({ pretty: true })
    console.log(`Product added to ${outFile}`)
    return await writeFileAsync(outFile, xml, { encoding: 'utf8' })
  } catch (e) {
    console.err(e)
  }
}

const run = async () => {
  const data = await defiminiData()
  // createCSV(data)
  createXML(data)
}

run()
