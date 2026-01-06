import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const Map = ({ center = [33.3152, 44.3661], zoom = 12, markers = [], height = '400px' }) => {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markersLayerRef = useRef(null)

    useEffect(() => {
        // Initialize map
        if (!mapInstanceRef.current && mapRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom)

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(mapInstanceRef.current)

            // Create layer for markers
            markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(center, zoom)
        }
    }, [center, zoom])

    useEffect(() => {
        if (markersLayerRef.current) {
            // Clear existing markers
            markersLayerRef.current.clearLayers()

            // Add new markers
            markers.forEach(marker => {
                const { position, popup, icon } = marker

                const leafletMarker = icon
                    ? L.marker(position, { icon }).addTo(markersLayerRef.current)
                    : L.marker(position).addTo(markersLayerRef.current)

                if (popup) {
                    leafletMarker.bindPopup(popup)
                }
            })
        }
    }, [markers])

    return (
        <div
            ref={mapRef}
            className="map-container"
            style={{ height, borderRadius: 'var(--border-radius-md)' }}
        />
    )
}

export default Map
