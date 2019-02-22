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
  await convert(process.stdout)
}
main()
