const Nightmare = require('nightmare')
// https://github.com/electron/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions
const nightmareOptions = {
  show: true,
  width: 1366,
  height: 768,
  title: 'Defimini Jimbo Extractor',
  darkTheme: true
}

// Get all info into the car part page
// put into a csv
// add the info to the csv

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
        // same as Array.from, transforms a nodelist into an array
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
const evaluateProduct = ($product) => {
  // selectors list
  const allProducts = document.querySelectorAll($product)
  const $price = '.cc-shop-product-price-current'
  const $productName = '.cc-shop-product-desc .fn'
  const $productDescription = '.cc-shop-product-desc description'
  const data = []

  allProducts.forEach(product => {
    const price = `${product.querySelector($price).getAttribute('content')}€`
    const productName = product.querySelector($productName).textContent

    data.push({prix: price, nomproduit: productName})
  })

  return data
}
const getInfoFromURL = async (URL) => {
  const nightmare = new Nightmare(nightmareOptions)
  // let URL = 'https://www.defimini.com/pieces-automobiles/anciennes-1-50/'
  const $product = '.j-product'
  console.log(`Get info from ${URL}`)

  try {
    const result = await nightmare
      .goto(URL)
      .wait($product)
      .evaluate($product => {
        // selectors list
        const allProducts = document.querySelectorAll($product)
        const $price = '.cc-shop-product-price-current'
        const $productName = '.cc-shop-product-desc .fn'
        const $productDescription = '.cc-shop-product-desc description'
        const data = []

        allProducts.forEach(product => {
          const price = `${product.querySelector($price).getAttribute('content')}€`
          const productName = product.querySelector($productName).textContent

          data.push({prix: price, nomproduit: productName})
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
  // const urls = await getCarPartUrls()
  const urls = [
    'https://www.defimini.com/pieces-automobiles/anciennes-1-50/',
    'https://www.defimini.com/pieces-automobiles/anciennes-2-50/'
    // 'https://www.defimini.com/pieces-automobiles/anciennes-3/'
  ]
  const series = urls.reduce(async (queue, url) => {
    const dataArray = await queue
    dataArray.push(await getInfoFromURL(url))
    return dataArray
  }, Promise.resolve([]))

  series.then(res => {
    console.log('Series result')
    console.log(res.length)
  })
}

csvContent()
// console.log(getCarPartUrls())
// getCarPartUrls()
//   .then(urls => {
//     console.log(`${urls.length} urls found`)
    // urls.reduce((accumulator, url) => {
    //   return accumulator.then(titles => {
    //     return nightmare.goto(url)
    //       .wait('body')
    //       .title()
    //       .then(result => {
    //         titles.push(result)
    //         return titles
    //       })
    //   })
    // }, Promise.resolve([])).then(titles => {
    //   nightmare.end(() => {
    //     console.table(titles)
    //   })
    // })
  // })
  // .catch(err => console.log(err))

  // var urls = ['https://skullmasher.io', 'https://www.heartlessgaming.com', 'https://github.com']
  // urls.reduce((accumulator, url) => {
  //   return accumulator.then(titles => {
  //     return nightmare.goto(url)
  //       .wait('body')
  //       .title()
  //       .then(result => {
  //         titles.push(result)
  //         return titles
  //       })
  //   })
  // }, Promise.resolve([])).then(titles => {
  //   nightmare.end(() => {
  //     console.table(titles)
  //   })
  // })
