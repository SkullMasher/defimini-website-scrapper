const { csvFormat } = require('d3-dsv')
const Nightmare = require('nightmare')
const { readFileSync, writeFileSync } = require('fs')

const numbers = readFileSync('./tesco-title-numbers.csv', {encoding: 'utf8'}).trim().split('\n')
const START = 'https://eservices.landregistry.gov.uk/wps/portal/Property_Search'

const getAddress = async id => {
  console.log(`Now checking ${id}`)
  const nightmare = new Nightmare({ show: true })

// Go to initial start page, navigate to Detail search
  try {
    await nightmare
      .goto(START)
      .wait('.bodylinkcopy:first-child')
      .click('.bodylinkcopy:first-child')
  } catch (e) {
    console.error(e)
  }
  // Type the title number into the appropriate box; click submit
  try {
    await nightmare
      .wait('input[name="titleNo"]')
      .type('input[name="titleNo"]', id)
      .click('input[value="Search »"]')
  } catch (e) {
    console.error(e)
  }

  try {
    const result = await nightmare
      .wait('.w80p')
      .evaluate(() => {
        return [...document.querySelectorAll('.w80p')]
          .map(el => el.innerText)
      })
      .end()

    return { id, address: result[0], lease: result[1] }
  } catch (e) {
    console.error(e)
    return undefined
  }
}

const series = numbers.reduce(async (queue, number) => {
  const dataArray = await queue
  dataArray.push(await getAddress(number))
  return dataArray
}, Promise.resolve([]))

series.then(data => {
  console.log(data)
  console.log('-------------------------')
  data.filter(i => {
    console.log(i)
  })
  const csvData = csvFormat(data)
  writeFileSync('./output.csv', csvData, { encoding: 'utf8' })
})
.catch(e => console.error(e))
