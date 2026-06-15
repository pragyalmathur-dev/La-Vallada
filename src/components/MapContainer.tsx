/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Unit, OverlayConfig } from '../types';
import { NearbyLocation, NEARBY_LOCATIONS } from '../data';

interface MapContainerProps {
  units: Unit[];
  selectedUnit: Unit | null;
  setSelectedUnit: (unit: Unit | null) => void;
  selectedNearbyCategories: string[];
  overlayConfig: OverlayConfig;
  mapTile: 'osm' | 'satellite' | 'topo';
  mapRef: React.MutableRefObject<L.Map | null>;
  overlayRef: React.MutableRefObject<L.ImageOverlay | null>;
  sidebarOpen: boolean;
}

// Tile configurations
const TILES = {
  osm: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  topo: 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png'
};

const TILE_ATTRIBUTIONS = {
  osm: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
  satellite: '&copy; Esri, Maxar, Earthstar Geographics',
  topo: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
};

interface CustomPOI {
  id: string;
  name: string;
  coordinate: [number, number];
  category: 'f&b' | 'education' | 'tourism' | 'other';
}

const CUSTOM_POI_CATEGORIES = {
  'f&b': {
    color: '#EA580C', // Vibrant Orange for Cafe and Restaurant (fork and spoon)
    borderColor: '#FFFEF7',
    label: 'Restaurant / Cafe',
    iconHtml: `
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#FFFEF7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v3c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    `
  },
  'education': {
    color: '#D4527B', // Soft pinkish-crimson rose for educational centers
    borderColor: '#FFFEF7',
    label: 'Education Center',
    iconHtml: `
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#FFFEF7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>
    `
  },
  'tourism': {
    color: '#1E6091', // Explorer royal blue for tourist landmarks
    borderColor: '#FFFEF7',
    label: 'Tourism & Landmark',
    iconHtml: `
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#FFFEF7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.2,7.8 14.2,13.4 8.6,15.4 10.6,9.8" fill="#FFFEF7" fill-opacity="0.25"/>
      </svg>
    `
  },
  'other': {
    color: '#BF9861', // Elegant brand gold
    borderColor: '#FFFEF7',
    label: 'Point of Interest',
    iconHtml: `
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="#FFFEF7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    `
  }
};

const CUSTOM_POIS: CustomPOI[] = [
  {
    id: 'poi-don-bosco',
    name: 'Don Bosco Youth Welfare Centre',
    coordinate: [15.587688, 73.789836],
    category: 'education'
  },
  {
    id: 'poi-st-xaviers',
    name: "St. Xavier's College",
    coordinate: [15.597929, 73.807901],
    category: 'education'
  },
  {
    id: 'poi-eds-goan-pub',
    name: "Ed's - The Goan Pub",
    coordinate: [15.582503, 73.782369],
    category: 'f&b'
  },
  {
    id: 'poi-parra-madanni',
    name: 'Parra Madanni Restaurant',
    coordinate: [15.577757, 73.779733],
    category: 'f&b'
  },
  {
    id: 'poi-kafi-lebanese',
    name: 'Kafi - Lebanese Cafe',
    coordinate: [15.591179, 73.770987],
    category: 'f&b'
  },
  {
    id: 'poi-bloom-brew',
    name: 'Bloom & Brew',
    coordinate: [15.591560, 73.773090],
    category: 'f&b'
  },
  {
    id: 'poi-diavola-art-cafe',
    name: 'Diavola - Art Cafe & Pizzeria.',
    coordinate: [15.587767, 73.760001],
    category: 'f&b'
  }
];

const REFERENCE_COORDS: [number, number] = [15.589494, 73.785820];

const calculateDistanceAndDriveTime = (coordinate: [number, number]) => {
  const R = 6371; // Earth's radius in km
  const lat1 = REFERENCE_COORDS[0] * Math.PI / 180;
  const lat2 = coordinate[0] * Math.PI / 180;
  const dLat = (coordinate[0] - REFERENCE_COORDS[0]) * Math.PI / 180;
  const dLon = (coordinate[1] - REFERENCE_COORDS[1]) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineDistance = R * c; // in km

  // Apply routing winding coefficient for actual driving distance
  // (Standard Goan roads have around 1.35x winding coefficient relative to straight lines)
  const windingFactor = straightLineDistance > 3 ? 1.45 : 1.3;
  const driveDistance = straightLineDistance * windingFactor;
  
  // Driving speeds in Goa:
  // - Local routes (distance < 5 km): average 22 km/h (approx 2.7 mins per km)
  // - Highway/Airport routes: average 45-50 km/h (approx 1.2 - 1.3 mins per km)
  const speedKmh = driveDistance > 7 ? 48 : 22;
  const driveMinutes = Math.max(1, Math.round((driveDistance / speedKmh) * 60));

  return {
    distanceStr: `${driveDistance.toFixed(1)} KM AWAY`,
    driveTimeStr: `${driveMinutes} MIN DRIVE`
  };
};

export default function MapContainer({
  units,
  selectedUnit,
  setSelectedUnit,
  selectedNearbyCategories,
  overlayConfig,
  mapTile,
  mapRef,
  overlayRef,
  sidebarOpen
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  
  // Marker layers refs to allow dynamic removal / updates
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const nearbyMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const projectMarkerRef = useRef<L.Marker | null>(null);

  // Core coordinates
  const PROJECT_LAT = 15.58885;
  const PROJECT_LNG = 73.78605;

  // 1. Initial Map Creation
  useEffect(() => {
    if (!containerRef.current) return;

    // Create Map
    const map = L.map(containerRef.current, {
      center: [PROJECT_LAT, PROJECT_LNG],
      zoom: 17,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });
    
    mapRef.current = map;

    // Force size check on next tick to ensure parent flex dimensions are computed
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);

    // Initial tile layer standard is Satellite
    const tileLayer = L.tileLayer(TILES.satellite, {
      attribution: TILE_ATTRIBUTIONS.satellite,
      maxZoom: 18
    }).addTo(map);
    
    currentTileLayerRef.current = tileLayer;

    // Initialize layer groups for markers
    markersGroupRef.current = L.layerGroup().addTo(map);
    nearbyMarkersGroupRef.current = L.layerGroup().addTo(map);

    // 1.5. Persistent Vianaar "La Merida" Property Pin & Hover tooltip
    const laMeridaIconHtml = `
      <div class="la-merida-pin-inner vianaar-map-pin-inner" style="
        position: relative;
        width: 24px;
        height: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0px 3px 6px rgba(35, 77, 59, 0.35));
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        transform-origin: 12px 28px;
      ">
        <svg width="100%" height="100%" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
          <path d="M16 40C25 28 28 23 28 16C28 9.37 22.63 4 16 4C9.37 4 4 9.37 4 16C4 23 7 28 16 40Z" fill="#234D3B" stroke="#FFFEF7" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cx="16" cy="16" r="4.5" fill="#FFFEF7" />
        </svg>
      </div>
    `;

    const laMeridaIcon = L.divIcon({
      className: 'la-merida-pin-wrapper',
      html: laMeridaIconHtml,
      iconSize: [24, 30],
      iconAnchor: [12, 28]
    });

    const laMeridaCoords: [number, number] = [15.589611, 73.786444];
    const laMeridaMarker = L.marker(laMeridaCoords, { icon: laMeridaIcon }).addTo(map);

    const laMeridaTooltipHtml = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Mulish', sans-serif;">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.08em; color: #234D3B; text-transform: uppercase; line-height: 1.1;">
          LA MERIDA
        </div>
        <div style="font-size: 8px; font-weight: 700; letter-spacing: 0.1em; color: #AA783B; margin-top: 4px; text-transform: uppercase; line-height: 1.1;">
          VIANAAR PROPERTY
        </div>
        <div style="width: 100%; border-top: 1px solid rgba(191, 152, 97, 0.3); margin: 6px 0;"></div>
        <div style="font-size: 9px; font-style: italic; font-family: 'Cardo', serif; color: rgba(48, 47, 44, 0.8); text-transform: lowercase; line-height: 1.1;">
          luxury design residences & villas
        </div>
      </div>
    `;

    laMeridaMarker.bindTooltip(laMeridaTooltipHtml, {
      direction: 'top',
      permanent: false, // Hidden by default, shown on deskop hover / mobile tap
      sticky: true,
      opacity: 1.0,
      className: 'la-merida-tooltip',
      offset: L.point(0, -28)
    });

    // 1.6. Naikawado Rd. Curved Polyline (Solid White Line)
    const roadCoordinates: [number, number][] = [
      [15.589402, 73.785265],
      [15.589185, 73.784766],
      [15.588896, 73.783948],
      [15.588823, 73.783511],
      [15.588782, 73.782886],
      [15.588542, 73.781824],
      [15.588555, 73.780625],
      [15.588369, 73.780196],
      [15.588113, 73.779906],
      [15.587893, 73.779614],
      [15.587296, 73.779140],
      [15.586396, 73.778611],
      [15.585879, 73.778387],
      [15.585855, 73.778260],
      [15.585843, 73.778027],
      [15.585772, 73.777966],
      [15.585225, 73.777813],
      [15.584623, 73.777124],
      [15.584512, 73.777137],
      [15.584386, 73.777389],
      [15.584291, 73.777408],
      [15.583677, 73.777159]
    ];

    // Casing (outline) for high visibility on satellite map
    L.polyline(roadCoordinates, {
      color: '#143024',
      weight: 6.5,
      opacity: 0.5,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Crisp white road overlay
    L.polyline(roadCoordinates, {
      color: '#FFFFFF',
      weight: 3.5,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 1.6b. Second Road Curved Polyline (Solid White Line)
    const secondRoadCoordinates: [number, number][] = [
      [15.589415, 73.785500],
      [15.589465, 73.785750],
      [15.589535, 73.786100],
      [15.589620, 73.786529],
      [15.589949, 73.787665],
      [15.589954, 73.787733],
      [15.589802, 73.788677],
      [15.589727, 73.788738],
      [15.588986, 73.788660],
      [15.588836, 73.788618],
      [15.587824, 73.788631],
      [15.587292, 73.788631], // Corner point
      [15.587331, 73.788851], // Continuing fourth road seamlessly
      [15.587364, 73.789221],
      [15.587369, 73.789336],
      [15.587689, 73.790045],
      [15.587772, 73.790402]
    ];

    // Casing (outline) for second road
    L.polyline(secondRoadCoordinates, {
      color: '#143024',
      weight: 6.5,
      opacity: 0.5,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Crisp white road overlay
    L.polyline(secondRoadCoordinates, {
      color: '#FFFFFF',
      weight: 3.5,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 1.6c. Third Road Curved Polyline (Solid White Line)
    const thirdRoadCoordinates: [number, number][] = [
      [15.583649, 73.777146],
      [15.583987, 73.776326],
      [15.584679, 73.775459],
      [15.585620, 73.773499],
      [15.586267, 73.773148],
      [15.587169, 73.772609],
      [15.588997, 73.771204],
      [15.589764, 73.770485],
      [15.590343, 73.769822],
      [15.590531, 73.769720]
    ];

    // Casing (outline) for third road
    L.polyline(thirdRoadCoordinates, {
      color: '#143024',
      weight: 6.5,
      opacity: 0.5,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Crisp white road overlay for third road
    L.polyline(thirdRoadCoordinates, {
      color: '#FFFFFF',
      weight: 3.5,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 1.6d. Anjuna Geographic Label (Always shown, no location pin, clean typography)
    const anjunaCoords: [number, number] = [15.587740, 73.770485];
    const anjunaLabelIcon = L.divIcon({
      className: 'anjuna-label-wrapper',
      html: `
        <div style="
          transform: translate(-50%, -50%);
          display: inline-block;
          white-space: nowrap;
          color: #FFFEF7;
          font-family: 'Mulish', 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-shadow: 0 2px 6px rgba(17, 50, 37, 0.95), 0 0 4px rgba(17, 50, 37, 0.82);
          pointer-events: none;
        ">
          Anjuna
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    L.marker(anjunaCoords, { icon: anjunaLabelIcon }).addTo(map);

    // 1.6e. Assagao Geographic Label (Always shown, no location pin, clean typography)
    const assagaoCoords: [number, number] = [15.588463, 73.773516];
    const assagaoLabelIcon = L.divIcon({
      className: 'assagao-label-wrapper',
      html: `
        <div style="
          transform: translate(-50%, -50%);
          display: inline-block;
          white-space: nowrap;
          color: #FFFEF7;
          font-family: 'Mulish', 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-shadow: 0 2px 6px rgba(17, 50, 37, 0.95), 0 0 4px rgba(17, 50, 37, 0.82);
          pointer-events: none;
        ">
          ASSAGAO
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    L.marker(assagaoCoords, { icon: assagaoLabelIcon }).addTo(map);

    // 1.6f. Verla Canca Geographic Label (Always shown, no location pin, clean typography)
    const verlaCancaCoords: [number, number] = [15.587212, 73.783294];
    const verlaCancaLabelIcon = L.divIcon({
      className: 'verla-canca-label-wrapper',
      html: `
        <div style="
          transform: translate(-50%, -50%);
          display: inline-block;
          white-space: nowrap;
          color: #FFFEF7;
          font-family: 'Mulish', 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-shadow: 0 2px 6px rgba(17, 50, 37, 0.95), 0 0 4px rgba(17, 50, 37, 0.82);
          pointer-events: none;
        ">
          Verla Canca
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    L.marker(verlaCancaCoords, { icon: verlaCancaLabelIcon }).addTo(map);



    // 1.7. Naikawado Rd. Premium Floating Labels
    const roadLabelCoords1: [number, number] = [15.588860, 73.783806];
    const roadLabelCoords2: [number, number] = [15.589920, 73.788143];
    
    const roadLabelIcon = L.divIcon({
      className: 'road-label-wrapper',
      html: `
        <div class="road-label-inner" style="
          transform: translate(-50%, -50%);
          display: inline-block;
          white-space: nowrap;
          background-color: #113225;
          color: #FFFEF7;
          font-family: 'Mulish', 'Inter', sans-serif;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid #234D3B;
          box-shadow: 0 3px 8px rgba(0,0,0,0.35);
          pointer-events: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        ">
          NAIKAWADO RD.
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    const roadLabelMarker1 = L.marker(roadLabelCoords1, { icon: roadLabelIcon }).addTo(map);
    const roadLabelMarker2 = L.marker(roadLabelCoords2, { icon: roadLabelIcon }).addTo(map);

    // 1.8. Custom Dynamic Categorized Pins (Restaurants/Bar/Cafe, Education, Tourist Places, and Others)
    const customPoiMarkers: { marker: L.Marker; category: string }[] = [];

    CUSTOM_POIS.forEach(poi => {
      const catConfig = CUSTOM_POI_CATEGORIES[poi.category] || CUSTOM_POI_CATEGORIES['other'];
      const { distanceStr, driveTimeStr } = calculateDistanceAndDriveTime(poi.coordinate);
      
      const pinHtml = `
        <div class="custom-poi-pin-inner vianaar-map-pin-inner" style="
          position: relative;
          width: 24px;
          height: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.25));
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: 12px 28px;
        ">
          <svg width="100%" height="100%" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
            <path d="M16 40C25 28 28 23 28 16C28 9.37 22.63 4 16 4C9.37 4 4 9.37 4 16C4 23 7 28 16 40Z" fill="${catConfig.color}" stroke="${catConfig.borderColor}" stroke-width="2.5" stroke-linejoin="round"/>
          </svg>
          <div style="
            position: absolute;
            top: 6px;
            width: 12px;
            height: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${catConfig.iconHtml}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-poi-pin-wrapper',
        html: pinHtml,
        iconSize: [24, 30],
        iconAnchor: [12, 28]
      });

      const marker = L.marker(poi.coordinate, { icon: customIcon }).addTo(map);

      // Add a clean hover-triggered brand-themed tooltip using the user-specified 3-line format
      const labelHtml = `
        <div class="custom-poi-label-inner" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Mulish', 'Inter', sans-serif;
          background: #FFFEF7;
          border: 1.5px solid ${catConfig.color};
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(17, 50, 37, 0.15);
          padding: 10px 16px;
          pointer-events: none;
          text-align: center;
        ">
          <div style="
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: #234D3B;
            text-transform: uppercase;
            line-height: 1.2;
            white-space: nowrap;
          ">
            ${poi.name}
          </div>
          <div style="
            font-size: 8.5px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #AA783B;
            margin-top: 5px;
            text-transform: uppercase;
            line-height: 1.2;
            white-space: nowrap;
          ">
            ${driveTimeStr}
          </div>
          <div style="
            font-size: 8.5px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #8E8A85;
            margin-top: 3px;
            text-transform: uppercase;
            line-height: 1.2;
            white-space: nowrap;
          ">
            ${distanceStr}
          </div>
        </div>
      `;

      marker.bindTooltip(labelHtml, {
        direction: 'top',
        permanent: false,
        sticky: true,
        className: 'custom-poi-tooltip',
        offset: L.point(0, -28) // Positioned nicely centered above the point of pin
      });

      customPoiMarkers.push({ marker, category: poi.category });
    });

    const matchLabelToZoom = () => {
      const markers = [roadLabelMarker1, roadLabelMarker2];
      const currentZoom = map.getZoom();

      markers.forEach(marker => {
        const el = marker.getElement();
        if (!el) return;
        const inner = el.querySelector('.road-label-inner') as HTMLElement;
        if (!inner) return;

        if (currentZoom <= 14) {
          inner.style.fontSize = '6.5px';
          inner.style.padding = '1px 3px';
          inner.style.borderRadius = '3px';
          inner.style.borderWidth = '0.5px';
          inner.style.letterSpacing = '0.04em';
        } else if (currentZoom === 15) {
          inner.style.fontSize = '7px';
          inner.style.padding = '2px 5px';
          inner.style.borderRadius = '4px';
          inner.style.borderWidth = '0.75px';
          inner.style.letterSpacing = '0.06em';
        } else if (currentZoom === 16) {
          inner.style.fontSize = '8px';
          inner.style.padding = '3px 7px';
          inner.style.borderRadius = '5px';
          inner.style.borderWidth = '1px';
          inner.style.letterSpacing = '0.08em';
        } else {
          // Zoom 17 and above
          inner.style.fontSize = '9px';
          inner.style.padding = '4px 10px';
          inner.style.borderRadius = '6px';
          inner.style.borderWidth = '1.2px';
          inner.style.letterSpacing = '0.08em';
        }
      });

      // Unified, dynamic zoom-scaling for ALL custom map pins with .vianaar-map-pin-inner
      const allPins = document.querySelectorAll('.vianaar-map-pin-inner') as NodeListOf<HTMLElement>;
      allPins.forEach(inner => {
        if (currentZoom <= 13) {
          inner.style.transform = 'scale(0.4)';
        } else if (currentZoom === 14) {
          inner.style.transform = 'scale(0.5)';
        } else if (currentZoom === 15) {
          inner.style.transform = 'scale(0.6)';
        } else if (currentZoom === 16) {
          inner.style.transform = 'scale(0.75)';
        } else {
          // Zoom 17 and above (full crisp design close-up)
          inner.style.transform = 'scale(0.9)';
        }
      });
    };

    map.on('zoomend moveend viewreset', matchLabelToZoom);
    // Initial sync
    setTimeout(matchLabelToZoom, 150);

    // Main Project Landmark Marker disabled by user request to keep the map clean and load instantly.
    projectMarkerRef.current = null;

    // Ensure entire map renders properly by invalidating size on startup
    const mapTimers = [100, 350, 700, 1500].map(delay => 
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, delay)
    );

    return () => {
      mapTimers.forEach(clearTimeout);
      map.remove();
    };
  }, []);

  // 2. Tile Swapping Reactivity
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const tileUrl = TILES[mapTile];
    const tileAttr = TILE_ATTRIBUTIONS[mapTile];

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: tileAttr,
      maxZoom: 18
    }).addTo(map);

    currentTileLayerRef.current = tileLayer;
    tileLayer.bringToBack();
  }, [mapTile]);

  // 3. Render Villas & Apartments Property Pins (Disabled to clean up clutter and avoid excessive overlapping pins)
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    // Markers are removed by user request to preserve standard high-speed rendering
  }, [units]);

  // 4. Handle Programmatic Clicking FlyTo
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedUnit) return;

    // Center map and open its popup
    map.setView(selectedUnit.coordinate, 18, { animate: true });

    // Open target marker popup after a short transition delay
    setTimeout(() => {
      const markersGroup = markersGroupRef.current;
      if (!markersGroup) return;

      // Find matching marker base on position match
      markersGroup.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          const latLng = layer.getLatLng();
          if (
            Math.abs(latLng.lat - selectedUnit.coordinate[0]) < 0.0001 &&
            Math.abs(latLng.lng - selectedUnit.coordinate[1]) < 0.0001
          ) {
            layer.openPopup();
          }
        }
      });
    }, 400);
  }, [selectedUnit]);

  // 5. Render Dynamic Nearby Locations
  useEffect(() => {
    const map = mapRef.current;
    const nearbyGroup = nearbyMarkersGroupRef.current;
    if (!map || !nearbyGroup) return;

    nearbyGroup.clearLayers();

    // Render if we have active filter categories
    const activeLocations = NEARBY_LOCATIONS.filter(loc => 
      selectedNearbyCategories.includes(loc.category)
    );

    activeLocations.forEach(loc => {
      const categoryColors = {
        Transport: '#1E6091', // Indigo / Blue
        Beach: '#0EA5E9',     // Sky Blue
        Market: '#EAB308',    // Yellow
        Healthcare: '#EF4444', // Red
        'F&B': '#D95D39'      // Orange / Coral
      };
      
      const pinColor = categoryColors[loc.category] || '#BF9861';
      const { distanceStr, driveTimeStr } = calculateDistanceAndDriveTime(loc.coordinate);

      const iconHtml = `
        <div class="nearby-location-pin-inner vianaar-map-pin-inner" style="
          position: relative;
          width: 24px;
          height: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.25));
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: 12px 28px;
        ">
          <svg width="100%" height="100%" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
            <path d="M16 40C25 28 28 23 28 16C28 9.37 22.63 4 16 4C9.37 4 4 9.37 4 16C4 23 7 28 16 40Z" fill="${pinColor}" stroke="#FFFEF7" stroke-width="2.5" stroke-linejoin="round"/>
          </svg>
          <div style="
            position: absolute;
            top: 5px;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${loc.emoji}
          </div>
        </div>
      `;

      const divIcon = L.divIcon({
        className: 'nearby-location-pin-wrapper',
        html: iconHtml,
        iconSize: [24, 30],
        iconAnchor: [12, 28]
      });

      const marker = L.marker(loc.coordinate, { icon: divIcon })
        .addTo(nearbyGroup);

      // Add a clean hover-triggered brand-themed tooltip using the user-specified 3-line format
      const labelHtml = `
        <div class="custom-poi-label-inner" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Mulish', 'Inter', sans-serif;
          background: #FFFEF7;
          border: 1.5px solid ${pinColor};
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(17, 50, 37, 0.15);
          padding: 10px 16px;
          pointer-events: none;
          text-align: center;
        ">
          <div style="
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: #234D3B;
            text-transform: uppercase;
            line-height: 1.2;
            white-space: nowrap;
          ">
            ${loc.name}
          </div>
          <div style="
            font-size: 8.5px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #AA783B;
            margin-top: 5px;
            text-transform: uppercase;
            line-height: 1.2;
            white-space: nowrap;
          ">
            ${driveTimeStr}
          </div>
          <div style="
            font-size: 8.5px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #8E8A85;
            margin-top: 3px;
            text-transform: uppercase;
            line-height: 1.2;
            white-space: nowrap;
          ">
            ${distanceStr}
          </div>
        </div>
      `;

      marker.bindTooltip(labelHtml, {
        direction: 'top',
        permanent: false,
        sticky: true,
        className: 'custom-poi-tooltip',
        offset: L.point(0, -28) // Positioned nicely centered above the point of pin
      });
    });

    // Force scale sync for newly rendered nearby location markers immediately
    const currentZoom = map.getZoom();
    const allPins = document.querySelectorAll('.vianaar-map-pin-inner') as NodeListOf<HTMLElement>;
    allPins.forEach(inner => {
      if (currentZoom <= 13) {
        inner.style.transform = 'scale(0.4)';
      } else if (currentZoom === 14) {
        inner.style.transform = 'scale(0.5)';
      } else if (currentZoom === 15) {
        inner.style.transform = 'scale(0.6)';
      } else if (currentZoom === 16) {
        inner.style.transform = 'scale(0.75)';
      } else {
        inner.style.transform = 'scale(0.9)';
      }
    });

    // Fit map bounds to show nearby items if multiple active
    if (activeLocations.length > 0) {
      const allCoords = [
        [PROJECT_LAT, PROJECT_LNG] as [number, number],
        ...activeLocations.map(l => l.coordinate)
      ];
      map.fitBounds(L.latLngBounds(allCoords), { padding: [80, 80] });
    }
  }, [selectedNearbyCategories]);

  // 6. SITE PLAN IMAGE OVERLAY GIS RENDERING & ALIGNMENT (SVG VIEWBOX PREVENTS DRIFT ON ZOOM)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Delete existing overlay first
    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }

    if (!overlayConfig.visible) return;

    // Compute bounding box coordinates based on scale, widthScale and heightScale
    // Base box around the target pin of about ~200 meters.
    // 0.001 degrees is approx ~110m.
    const baseLatSpan = 0.0015;
    const baseLngSpan = 0.002;
    const scaledLatSpan = baseLatSpan * overlayConfig.scale * (overlayConfig.heightScale ?? 1.0);
    const scaledLngSpan = baseLngSpan * overlayConfig.scale * (overlayConfig.widthScale ?? 1.0);

    const bounds: L.LatLngBoundsExpression = [
      [overlayConfig.lat - scaledLatSpan, overlayConfig.lng - scaledLngSpan],
      [overlayConfig.lat + scaledLatSpan, overlayConfig.lng + scaledLngSpan]
    ];

    // Create the SVG container element
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgElement.setAttribute('viewBox', '0 0 1000 1000');
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', '100%');

    // Create the image element inside the SVG
    const imgElement = document.createElementNS("http://www.w3.org/2000/svg", "image");
    imgElement.setAttribute('href', '/assets/siteplan/site-plan.png');
    imgElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/assets/siteplan/site-plan.png');
    imgElement.setAttribute('x', '0');
    imgElement.setAttribute('y', '0');
    imgElement.setAttribute('width', '1000');
    imgElement.setAttribute('height', '1000');
    
    // Apply premium mix-blend-mode for seamless integration on street/satellite tiles
    imgElement.style.mixBlendMode = 'multiply';
    
    // Rotate of -3 degrees around center of coordinate space (500,500)
    imgElement.setAttribute('transform', `rotate(${overlayConfig.rotation}, 500, 500)`);

    svgElement.appendChild(imgElement);

    // Create SVG Overlay
    const overlay = L.svgOverlay(svgElement, bounds, {
      opacity: overlayConfig.opacity,
      interactive: false
    }).addTo(map);

    overlayRef.current = overlay as any;

    return () => {
      map.removeLayer(overlay);
      if (overlayRef.current === overlay) {
        overlayRef.current = null;
      }
    };

  }, [
    overlayConfig.scale, 
    overlayConfig.widthScale,
    overlayConfig.heightScale,
    overlayConfig.rotation, 
    overlayConfig.lat, 
    overlayConfig.lng, 
    overlayConfig.opacity, 
    overlayConfig.visible
  ]);

  // 7. Handle Sidebar toggle resizing
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    // Invalidate size immediately, and also programmatically on animation transition steps
    map.invalidateSize();
    
    // Invalidate multiple times as the transition animates (typically 300ms)
    const intervals = [50, 100, 150, 200, 250, 300, 400, 500];
    const timers = intervals.map(delay => setTimeout(() => {
      map.invalidateSize();
    }, delay));

    return () => timers.forEach(clearTimeout);
  }, [sidebarOpen]);

  return (
    <div id="map-frame" className={`absolute inset-0 w-full h-full z-0 map-tile-${mapTile}`}>
      {/* MAP ROOT VIEWPORT */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
