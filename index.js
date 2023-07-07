const https = require('node:https')
const http = require('node:http')
const { XMLParser } = require('fast-xml-parser')
const Papa = require('papaparse')
const { writeFileSync } = require('node:fs')
const [,, url, output] = process.argv

const URI = url || 'PATH_AL_XML'
const OUTPUT = output || './salida.csv'

const getXML = url => {
  console.log('downloading', url)
  const p = new Promise((resolve, reject) => {
    const data = []
    let protocol = http
    if (url.includes('https://')) protocol = https
    const req = protocol.request(new URL(url), res => {
      res.setEncoding('utf8')
      res.on('data', chunk => {data.push(chunk)})
      res.on('end', () => {resolve(data.join(''))})
    })
    req.on('error', error => {reject(error)})
    req.end()
  })
  return p
}

const findArray = input => {
  if (Array.isArray(input)) {
    return input
  }

  if (typeof input === 'object' && input !== null) {
    for (const key in input) {
      const result = findArray(input[key])
      if (Array.isArray(result)) {
        return result
      }
    }
  }

  return null
}

getXML(URI)
  .then(xml => {
    console.log('done downloading')
    const headers = {}
    const parser = new XMLParser()
    const parsed = parser.parse(xml)
    const array = findArray(parsed)
    array.forEach(item => {
      Object.keys(item).forEach(key => {
        headers[key] = 1
      })
    })
    const csv = Papa.unparse({
      fields: Object.keys(headers),
      data: array
    })
    writeFileSync(OUTPUT, csv)
    console.log('=> Done')
  })
  .catch(error => console.log(error))
