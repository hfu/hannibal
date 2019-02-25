const config = require('config')
const shapefile = require('shapefile')
const { spawn } = require('child_process')
const reproject = require('reproject')
const modify = require('./modify.js')

const src = config.get('src')
const def = '+proj=tmerc +lat_0=36 +lon_0=134.3333333333333 +k=0.9999 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs'

const convert = (writable) => {
  return new Promise((resolve, reject) => {
    shapefile.open(
      `${src}.shp`, `${src}.dbf`, { encoding: 'Windows-31J' }
    ).then(source => source.read()
      .then(function filter (result) {
        if (result.done) {
          resolve(null)
        } else {
          let f = result.value
          f.geometry = reproject.toWgs84(f.geometry, def)
          f = modify(f)
          if (f) writable.write(`\x1e${JSON.stringify(f)}\n`)
          return source.read().then(filter)
        }
      })
    )
  })
}

const main = async () => {
  const tippecanoe = spawn('tippecanoe', [
    '--no-feature-limit', '--no-tile-size-limit',
    '--force', '--simplification=1',
    '--minimum-zoom=7', '--maximum-zoom=12',
    '--base-zoom=12', '--output-to-directory=tiles',
    '--no-tile-compression', '--hilbert',
    '--detect-shared-borders'
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  await convert(tippecanoe.stdin)
  tippecanoe.stdin.end()
}
main()
