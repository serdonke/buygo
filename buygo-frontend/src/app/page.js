"use client"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

export default function Home() {
  const position = [13.0827, 80.2707]

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={position}>
          <Popup>Vanakkam!</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
