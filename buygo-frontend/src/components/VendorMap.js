'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMap } from 'react-leaflet';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_DEAL_MUTATION } from '../graphql/createDeal';
import L from 'leaflet';

import RedirectControl from './RedirectControl';

function FlyToUserLocationControl({ setClickEnabled }) {
    const map = useMap();

    useEffect(() => {
        const control = L.control({ position: 'topleft' });

        control.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const button = L.DomUtil.create('a', '', div);
            button.innerHTML = '📍';
            button.title = 'Go to your location';
            button.href = '#';

            L.DomEvent.on(button, 'click', (e) => {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);

                setClickEnabled(false);

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        map.flyTo([latitude, longitude], 14);
                        setClickEnabled(true);
                    },
                    () => {
                        alert('Could not get your location');
                        setClickEnabled(true);
                    }
                );
            });

            return div;
        };

        control.addTo(map);

        return () => {
            control.remove();
        };
    }, [map, setClickEnabled]);

    return null;
}

function ClickToPlaceMarker({ setPosition, clickEnabled }) {
    useMapEvents({
        click(e) {
            if (clickEnabled) {
                setPosition(e.latlng);
            }
        }
    });
    return null;
}

export default function VendorMap() {
    const [markerPosition, setMarkerPosition] = useState(null);
    const [clickEnabled, setClickEnabled] = useState(true);
    const [form, setForm] = useState({
        title: '',
        description: '',
        vendorId: 'demo-vendor',
        price: '',
        originalPrice: '',
        ttlMinutes: ''
    });

    const [createDeal] = useMutation(CREATE_DEAL_MUTATION);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { title, description, vendorId, price, originalPrice, ttlMinutes } = form;

        if (!title || !description || !price || !markerPosition) {
            alert("Please fill all required fields.");
            return;
        }

        const input = {
            title,
            description,
            vendorId,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            location: {
                latitude: markerPosition.lat,
                longitude: markerPosition.lng
            },
            expiresAt: ttlMinutes
            ? new Date(Date.now() + ttlMinutes * 60000).toISOString()
            : null
        };

        try {
            await createDeal({ variables: { input } });
            alert("Deal created!");
            setMarkerPosition(null);
            setForm({
                title: '',
                description: '',
                vendorId: 'demo-vendor',
                price: '',
                originalPrice: '',
                ttlMinutes: ''
            });
        } catch (err) {
            console.error(err);
            alert("Failed to create deal.");
        }
    };

    const handleCancel = () => {
        setMarkerPosition(null);
        setForm({
            title: '',
            description: '',
            vendorId: 'demo-vendor',
            price: '',
            originalPrice: '',
            ttlMinutes: ''
        });
    };

    return (
        <div style={{
            height: '100vh',
                width: '100vw'
        }}>
        <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        >
        <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        />
        <ClickToPlaceMarker setPosition={setMarkerPosition} clickEnabled={clickEnabled} />
        {markerPosition && <Marker position={markerPosition} />}
        <FlyToUserLocationControl setClickEnabled={setClickEnabled} />
        <RedirectControl label="🏠" title="Go to user view" to="/" />
        </MapContainer>


        {markerPosition && (
            <div
            style={{
                position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#f0f8ff', // light blue background
                    padding: '1rem',
                    zIndex: 1000,
                    border: '1px solid #b3d4fc',
                    borderRadius: '8px',
                    width: '320px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontFamily: 'sans-serif',
            }}
            >
            <form onSubmit={handleSubmit}>
            <h3
            style={{
                marginBottom: '0.75rem',
                    fontSize: '1.1rem',
                    color: '#0366d6',
                    borderBottom: '1px solid #b3d4fc',
                    paddingBottom: '0.25rem',
            }}
            >
            Create Deal
            </h3>

            <div style={{ marginBottom: '0.75rem' }}>
            <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            style={{
                width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
            }}
            />
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
            <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={3}
            style={{
                width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
            }}
            />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            style={{
                width: '50%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
            }}
            />
            <input
            type="number"
            placeholder="Original Price"
            value={form.originalPrice}
            onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            style={{
                width: '50%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
            }}
            />
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
            <input
            type="number"
            placeholder="TTL (minutes)"
            value={form.ttlMinutes}
            onChange={(e) => setForm({ ...form, ttlMinutes: e.target.value })}
            style={{
                width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
            }}
            />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
            type="submit"
            style={{
                background: '#0366d6',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
            }}
            >
            Create
            </button>
            <button
            type="button"
            onClick={handleCancel}
            style={{
                background: '#ff6600',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
            }}
            >
            Cancel
            </button>
            </div>
            </form>
            </div>
        )}
        </div>
    );
}
