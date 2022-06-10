const https = require('node:https')
const { XMLParser } = require('fast-xml-parser')
const Papa = require('papaparse')
const { writeFileSync } = require('node:fs')
const [,, url, output] = process.argv

const URI = url || 'PATH_AL_XML'
const OUTPUT = output || './salida.csv'

const getXML = url => {
  const p = new Promise((resolve, reject) => {
    const data = []
    const req = https.request(new URL(url), res => {
      res.setEncoding('utf8')
      res.on('data', chunk => {data.push(chunk)})
      res.on('end', () => {resolve(data.join(''))})
    })
    req.on('error', error => {reject(error)})
    req.end()
  })
  return p
}

getXML(URI)
  .then(xml => {
    const headers = {}
    const parser = new XMLParser()
    const { oficinas: { oficina } } = parser.parse(xml)
    oficina.forEach(item => {
      Object.keys(item).forEach(key => {
        headers[key] = 1
      })
    })
    const csv = Papa.unparse({
      fields: Object.keys(headers),
      data: oficina
    })
    console.log(csv)
    writeFileSync(OUTPUT, csv)
    console.log('=> Done')
  })
  .catch(error => console.error)
