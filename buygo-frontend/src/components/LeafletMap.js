'use client';
// src/components/LeafletMap.js

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useSubscription, useLazyQuery } from '@apollo/client';
import { DEALS_IN_VIEWPORT_QUERY } from '../graphql/dealsInViewport';
import { DEAL_CREATED_SUBSCRIPTION } from '../graphql/dealCreatedInViewport';

export default function LeafletMap() {
    const position = [13.0827, 80.2707]; // Chennai
    const [deals, setDeals] = useState([]);
    const queryBoundsOnce = useRef(true);

    const [loadDealsInViewport] = useLazyQuery(DEALS_IN_VIEWPORT_QUERY, {
        onCompleted: (data) => {
            console.log("🧭 Deals loaded from viewport:", data.dealsInViewport);
            setDeals(data.dealsInViewport);
        },
    });

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
            console.log("💥 New deal received:", data.dealCreatedInViewport);
            setDeals((prev) => [...prev, data.dealCreatedInViewport]);
        }
    }, [data]);

    const handleLoadDeals = useCallback((bounds) => {
        // useLazyQuery is stable internally
        loadDealsInViewport({
            variables: {
                boundingBox: {
                    minLatitude: bounds.getSouth(),
                    maxLatitude: bounds.getNorth(),
                    minLongitude: bounds.getWest(),
                    maxLongitude: bounds.getEast(),
                },
            },
        });
    }, []);

    function ViewportWatcher({ onReady }) {
        const map = useMap();

        useEffect(() => {
            if (!queryBoundsOnce.current) return;

            const bounds = map.getBounds();

            setTimeout(() => {
                loadDealsInViewport({
                    variables: {
                        boundingBox: {
                            minLatitude: bounds.getSouth(),
                            maxLatitude: bounds.getNorth(),
                            minLongitude: bounds.getWest(),
                            maxLongitude: bounds.getEast(),
                        },
                    },
                });
            }, 0);

            queryBoundsOnce.current = false;
        }, []);

        useMapEvents({
            moveend: () => {
                const bounds = map.getBounds();
                loadDealsInViewport({
                    variables: {
                        boundingBox: {
                            minLatitude: bounds.getSouth(),
                            maxLatitude: bounds.getNorth(),
                            minLongitude: bounds.getWest(),
                            maxLongitude: bounds.getEast(),
                        },
                    },
                });
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
            <ViewportWatcher onReady={handleLoadDeals} />
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
