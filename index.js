const config = require('config')
const shapefile = require('shapefile')
const { spawn } = require('child_process')

const src = config.get('src')

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
          delete f.properties['SHAPE_Leng']
          delete f.properties['SHAPE_Area']
          f.properties.name = f.properties.NAME
          delete f.properties['NAME']
          f.properties.f_no = f.properties.F_NO
          delete f.properties['F_NO']
          writable.write(`\x1e${JSON.stringify(f)}\n`)
          return source.read().then(filter)
        }
      })
    )
  })
}

const main = async () => {
  const tippecanoe = spawn('tippecanoe', [
    '--no-feature-limit', '--no-tile-size-limit',
    '--force', '--simplification=2',
    '--minimum-zoom=8', '--maximum-zoom=8',
    '--base-zoom=8', '--output-to-directory=tiles',
    '--no-tile-compression'
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  await convert(process.stdout)
  tippecanoe.stdin.end()
}
main()
