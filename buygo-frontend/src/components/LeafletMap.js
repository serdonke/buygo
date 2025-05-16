'use client';
// src/components/LeafletMap.js

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useEffect, useState } from 'react';
import { useSubscription } from '@apollo/client';
import { DEAL_CREATED_SUBSCRIPTION } from '../graphql/dealCreatedInViewport';

export default function LeafletMap() {
    const position = [13.0827, 80.2707]; // Chennai

    const [deals, setDeals] = useState([]);

    const { data } = useSubscription(DEAL_CREATED_SUBSCRIPTION, {
        variables: {
            boundingBox: {
                minLatitude: 0,
                maxLatitude: 90,
                minLongitude: -180,
                maxLongitude: 180,
            },
        },
    });

    useEffect(() => {
        if (data?.dealCreatedInViewport) {
            console.log("💥 New deal received:", data.dealCreatedInViewport); // 👈 Add this
            setDeals((prev) => [...prev, data.dealCreatedInViewport]);
        }
    }, [data]);

    return (
        <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {deals.map((deal) => (
            <Marker
            key={deal.id}
            position={[deal.location.latitude, deal.location.longitude]}
            >
            <Popup>{deal.title}</Popup>
            </Marker>
        ))}
        </MapContainer>
    );
}
