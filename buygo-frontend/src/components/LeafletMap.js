'use client';
// src/components/LeafletMap.js

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useEffect, useState } from 'react';
import { useSubscription, useLazyQuery } from '@apollo/client';
import { DEALS_IN_VIEWPORT_QUERY } from '../graphql/dealsInViewport';
import { DEAL_CREATED_SUBSCRIPTION } from '../graphql/dealCreatedInViewport';

function isSameBoundingBox(bb1, bb2) {
  if (!bb1 || !bb2) return false;
  return (
    bb1.minLatitude === bb2.minLatitude &&
    bb1.maxLatitude === bb2.maxLatitude &&
    bb1.minLongitude === bb2.minLongitude &&
    bb1.maxLongitude === bb2.maxLongitude
  );
}

export default function LeafletMap() {
    const position = [13.0827, 80.2707]; // Chennai
    const [deals, setDeals] = useState([]);
    const [boundingBox, setBoundingBox] = useState(null);

    const [loadDealsInViewport] = useLazyQuery(DEALS_IN_VIEWPORT_QUERY, {
        onCompleted: (data) => {
            console.log("🧭 Deals loaded from viewport:", data.dealsInViewport);
            setDeals(data.dealsInViewport);
        },
    });

    useSubscription(DEAL_CREATED_SUBSCRIPTION, {
        variables: { boundingBox },
        skip: !boundingBox,
        onData: ({ data }) => {
            const deal = data?.data?.dealCreatedInViewport;
            if (deal) {
                console.log("💥 Tile38 event:", deal);
                setDeals(prev => [...prev, deal]);
            }
        },
    });

    function ViewportWatcher() {
        const map = useMap();

        useEffect(() => {
            const bounds = map.getBounds();
            const bb = {
                minLatitude: bounds.getSouth(),
                maxLatitude: bounds.getNorth(),
                minLongitude: bounds.getWest(),
                maxLongitude: bounds.getEast(),
            };
            if (!isSameBoundingBox(bb, boundingBox)) {
                setBoundingBox(bb);
                loadDealsInViewport({ variables: { boundingBox: bb } });
            }
        }, []);

        useMapEvents({
            moveend: () => {
                const bounds = map.getBounds();
                const bb = {
                    minLatitude: bounds.getSouth(),
                    maxLatitude: bounds.getNorth(),
                    minLongitude: bounds.getWest(),
                    maxLongitude: bounds.getEast(),
                };
                if (!isSameBoundingBox(bb, boundingBox)) {
                    setBoundingBox(bb);
                    loadDealsInViewport({ variables: { boundingBox: bb } });
                }
            },
        });

        return null;
    }

    return (
        <MapContainer
            center={position}
            zoom={13}
            style={{ height: '100vh', width: '100%' }}
            preferCanvas={true}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <ViewportWatcher />
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
