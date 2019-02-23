module.exports = (f) => {
  delete f.properties['SHAPE_Leng']
  delete f.properties['SHAPE_Area']
  f.properties.name = f.properties.NAME
  delete f.properties['NAME']
  f.properties.f_no = f.properties.F_NO
  delete f.properties['F_NO']
  f.tippecanoe = {
    layer: 'hani',
    minzoom: 8,
    maxzoom: 8
  }
  return f
}
