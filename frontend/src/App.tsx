import { FC, useState } from 'react'
import MapboxGL from 'mapbox-gl'
import ReactMapboxGl, { GeoJSONLayer, Popup } from 'react-mapbox-gl'
import geojson from './output.json'

// static for now
const mapWidth: number = 800
const mapHeight: number = 600
const zoom: number = 9 // start zoom level
const r: number = 7 // radius for each point/marker
const sw: number = 1 // point/marker outline 


const Map = ReactMapboxGl({
  accessToken:
    'pk.eyJ1IjoidG9tY29vbG5sIiwiYSI6ImNrcXhvMzBxYzEwNmoycXFhdzB6c3NoangifQ.bMz4uHh9gMUzZIBqZR_4ag',
    scrollZoom: false, // locked for now
    doubleClickZoom: false // locked for now
})

const symbolLayout: MapboxGL.SymbolLayout = {
  'text-field': '{place}',
  'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
  'text-offset': [0, 0.6],
  'text-anchor': 'top'
}

const symbolPaint: MapboxGL.SymbolPaint = { 'text-color': 'white' }

const circleLayout: MapboxGL.CircleLayout = { visibility: 'visible' }

const circlePaintFeature: MapboxGL.CirclePaint = {
  'circle-color': 'lightblue',
  'circle-stroke-width': sw,
  'circle-stroke-color': 'black',
  'circle-radius': r
}

const circlePaintCluster: MapboxGL.CirclePaint = {
  ...circlePaintFeature,
  'circle-color': 'blue',
}

export interface PopupState {
  id: number
  lngLat: [number, number]
}

export const App: FC = () => {

  const [popupState, setPopupState] = useState<PopupState | null>(null)

  const onClickCircle = (event: any) => {
    const { lngLat, features } = event
    const [ { properties: { id } } ] = features
    setPopupState({ lngLat, id })
  }

  return (
    <div>
      <header>
        <h1>Welcome</h1>
      </header>
      {/* <pre>{JSON.stringify(geojson, null, 4)}</pre> */}
      <main>
        <Map
          style="mapbox://styles/mapbox/streets-v9"
          containerStyle={{
            height: `${mapHeight}px`,
            width: `${mapWidth}px`
          }}
          zoom={[zoom]}
        >
          <>
            {geojson.map((json, i) => {
              return ( // return a layer for each cluster
                <GeoJSONLayer
                  data={json}
                  circleLayout={circleLayout}
                  circlePaint={i === 0 ? circlePaintFeature : circlePaintCluster}
                  circleOnClick={onClickCircle}
                  symbolLayout={symbolLayout}
                  symbolPaint={symbolPaint}
                />
              )
            })}
          </>
          <>
            {!!popupState && (
              <Popup key={popupState?.id} coordinates={popupState?.lngLat}>
                <div>{popupState?.id}</div>
              </Popup>
            )}
          </>
        </Map>
      </main>
    </div>
  )
}
