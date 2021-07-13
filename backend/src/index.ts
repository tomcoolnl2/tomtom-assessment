import * as fs from 'fs'

const rawdata = fs.readFileSync(__dirname + '/data.json')
// To see what happens if the amount of data to process is way less, and therefore much faster, please use:
// const rawdata = fs.readFileSync(__dirname + '/data-partial.json');
let geodata = JSON.parse(rawdata.toString())
const featureData = geodata.features

console.log('Processing...') // Avaoid a void inside your node console ;)

type ScreenPixelCoords = [number, number]

type ScreenPixelCoordsGroup = {
  [key:string]: ScreenPixelCoords
}

const { PI: π, log, tan, sqrt } = Math
// static constant to have a start for calculations. 
const mapWidth: number = 800
const mapHeight: number = 600
const zoom: number = 9 // start zoom level
const threshold: number = 5 // some extra px to avoid markers glueing together
const r: number = 14 // radius for each point/marker
const sw: number = 1 // point/marker outline 
let coords: ScreenPixelCoordsGroup = {}

// convert degrees to radians
const degreesToRadians = (deg: number): number => deg * (π / 180)

// convert 
const longLatToOffset = (long: number, lat: number): ScreenPixelCoords => {

  const λ = degreesToRadians(long)
  const x = (mapWidth / (2 * π)) * (2 ** zoom) * (π + λ)

  const φ = degreesToRadians(lat)
  const y = (mapHeight / (2 * π)) * (2 ** zoom) * (π - log(tan((π / 4) + φ / 2)))

  return [ x, y ]
}

// calculate the actual distance between two points using screen pixel coordinates.
// because we choose to use circles as markers,
// we need to subtract the radian (r) of a marker twice, and also the
const calculateDistance = (
  [ x1, y1 ]: ScreenPixelCoords,
  [ x2, y2 ]: ScreenPixelCoords
): number => sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2)) - (2 * r) - (2 * sw)

// linear search might not be optimal,
// because it's time complexity is like the function name: linear
const linearSearch = (list: string[][], item1: string) => {
  let index = -1
  for (let i = 0, listItem; listItem = list[i]; i += 1) {
    if (listItem.includes(item1)) {
      index = i
      break; // assuming every "id" exists in one cluster only (it should!)
    }
  }
  return index
}

// ---------------------

// In order to prevent large geoJSON object to be sniffed for information,
// we create a flatter object structure, with the id of the point as object lookup property.
// The id points to the screen pixel coordinates x, y, which we need to measure distance

for (let i = 0, point; point = featureData[i]; i += 1) {
  const { geometry: { coordinates: [lat, long] }, properties: { id } } = point
  coords[id] = longLatToOffset(long, lat)
}

// We have to compare every screen pixel-coordinate-combination to all others.
// I considered using an algorithm to cluster coordinates.
// 'Hierarchical clustering' describes my siituation. But since that algorithm is heavy
// on both space and time complexity, I thought I could write my own O(n^2) complexity
// also fOr times sake

// an array containing combinations/pairs of id that cluster together
let clusters: Array<string[]> = []
// memoize id-combinations to prevent calculating distances more then once
// (if you calculate A to B, you don't need to calculate B to A)
// I prefer preventing calculations over preventing iterations here.
const cache: string[] = []
// make coords iterable
const flatCoords = Object.entries(coords)

let i = 0
for (const [id1, point1] of flatCoords) {
  for (const [id2, point2] of flatCoords) {
    // prevent comparison to itself
    if (id1 === id2) {
      continue
    }
    // if id-combination is stored in the cache,
    // we already desided if these two points need to be clustered
    if (cache.indexOf(`${id1}-${id2}`) > -1 || cache.indexOf(`${id2}-${id1}`) > -1) {
      continue
    }
    else { // we have never tested/calculated this two points before
      // so now for the actual calculation:
      // calculate the distance
      const distance: number = calculateDistance(point1, point2)
      // see if it returns a negative number in px, if so there is overlap
      const isOverlapping: boolean = distance - threshold < 0
      // if it's not overlapping, the point stays a feature
      // else we need to define a cluster
      if (isOverlapping) {
        // we test if one of the points is already tagged inside a cluster
        const index = linearSearch(clusters, id1)

        if (index > -1) {
          // we should add point 2 to the cluser
          clusters[index].push(id2)
          // avoid having duplicates, so this means it is not 100% bullet proof :(
          clusters[index] = [...new Set(clusters[index])] 
        }
        else {
          // we have to create a new cluster
          clusters.push([id1, id2])
        }
      }
      // add 2 combinations of id's to the cache
      cache.push(`${id1}-${id2}`)
      cache.push(`${id2}-${id1}`)
    }
  }
}

// quick and dirty way to generate an array objects:
//  - one for solitary features and one for clusters
// eventually each cluster will be represented by a geoJSON object for the center of that cluster

for (const cluster of clusters) {
    for (let i = 0, id: string; id = cluster[i]; i += 1) {
        // we need the index in the original feature data
        let index = -1
        const point = featureData.find((p: any) => { // any :(
            const pointId = p.properties.id
            index = pointId
            return id === String(pointId)
        })
        console.log(point)
        if (point) {
            // replace id for corresponding geoJSON data      
            cluster[i] = point
        }
    }
}

// Logical next steps:
// move over to new cluster data 
// then calculate every cluster geoJSON center
// create a feature from that

// write clusters and features into a json file
let output = []
// first, add all features (so yes we are about to almost duplicate the output data :( )
let features = {...geodata}
features.features = featureData
// put the features left outside of clustering on top
output.push(features)

for(let i = 0, cluster; cluster = clusters[i]; i += 1) {
    const clusterData = {...geodata}
    clusterData.features = cluster
    output.push(clusterData)
}

console.log('-------------')
console.log('output:', output)

fs.writeFile('build/output.json', JSON.stringify(output, null, 4), 'utf8', err => {
    if (err) {
        console.log('An error occured while writing JSON Object to File.')
        return console.error(err)
    }
})
