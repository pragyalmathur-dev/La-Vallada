/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import L from 'leaflet';
import { Plus, Minus, CircleDot } from 'lucide-react';
import MapContainer from './components/MapContainer';
import { Unit, OverlayConfig } from './types';
import { UNITS } from './data';

export default function App() {
  // ─── STATE MANAGERS ───
  const [units, setUnits] = useState<Unit[]>(UNITS);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedNearbyCategories, setSelectedNearbyCategories] = useState<string[]>([]);
  const [mapTile, setMapTile] = useState<'osm' | 'satellite' | 'topo'>('satellite');
  const [activeCategory, setActiveCategory] = useState<string>('Overview');

  // Ground position for site plan overlay config
  const DEFAULT_LAT = 15.58885;
  const DEFAULT_LNG = 73.78605;

  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    scale: 0.87,
    widthScale: 1.2999999999999998,
    heightScale: 1.0,
    rotation: -3,
    opacity: 1.0,
    visible: true
  });

  // ─── REFS FOR MAP ACCESS ───
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.ImageOverlay | null>(null);

  // ─── TOOL ACTIONS ───
  const handleResetAlignment = () => {
    setOverlayConfig({
      lat: DEFAULT_LAT,
      lng: DEFAULT_LNG,
      scale: 0.87,
      widthScale: 1.2999999999999998,
      heightScale: 1.0,
      rotation: -3,
      opacity: 1.0,
      visible: true
    });
    if (mapRef.current) {
      mapRef.current.setView([DEFAULT_LAT, DEFAULT_LNG], 17, { animate: true });
    }
  };

  const handleFlyToUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    if (mapRef.current) {
      mapRef.current.setView(unit.coordinate, 18, { animate: true });
    }
  };

  return (
    <div id="vianaar-platform-app" className="h-screen w-screen flex overflow-hidden bg-[#FFFEF7] font-sans text-[#302F2C] select-none">

      {/* INTERACTIVE MAP AREA */}
      <main className="flex-1 h-full w-full relative flex flex-col bg-[#FFFEF7]">
        
        {/* TOP STATUS BAR OVER MAP */}
        <header className="absolute top-0 left-0 right-0 h-20 bg-[#234D3B]/95 backdrop-blur-md border-b border-[#BF9861]/35 flex items-center justify-between px-8 z-[900] pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="flex flex-col py-1.5">
              <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#BF9861] leading-none mb-1">
                Vianaar
              </span>
              <h1 className="font-serif text-2xl font-bold text-[#FFFEF7] leading-none mb-1.5">
                La Vallada
              </h1>
              <span className="text-[9px] uppercase tracking-wider text-[#E3D5C9]/85 font-semibold leading-none">
                Verla Canca, North Goa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen button removed as requested */}
          </div>
        </header>

        {/* MAP CONTAINER VIEW WRAPPER */}
        <MapContainer
          units={units}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          selectedNearbyCategories={selectedNearbyCategories}
          overlayConfig={overlayConfig}
          mapTile={mapTile}
          mapRef={mapRef}
          overlayRef={overlayRef}
          sidebarOpen={false}
        />

        {/* MAP NAVIGATION CONTROLS */}
        <div id="map-navigation-controls" className="absolute bottom-8 right-8 z-[900] flex flex-col gap-3">
          <button
            type="button"
            onClick={() => mapRef.current?.zoomIn()}
            className="w-12 h-12 rounded-xl bg-[#234D3B]/95 backdrop-blur-md border border-[#BF9861]/40 text-[#FFFEF7] flex items-center justify-center hover:bg-[#BF9861] hover:text-[#234D3B] hover:border-[#BF9861]/80 shadow-2xl cursor-pointer transition-all duration-300"
            title="Zoom In"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
          
          <button
            type="button"
            onClick={() => mapRef.current?.zoomOut()}
            className="w-12 h-12 rounded-xl bg-[#234D3B]/95 backdrop-blur-md border border-[#BF9861]/40 text-[#FFFEF7] flex items-center justify-center hover:bg-[#BF9861] hover:text-[#234D3B] hover:border-[#BF9861]/80 shadow-2xl cursor-pointer transition-all duration-300"
            title="Zoom Out"
          >
            <Minus size={20} strokeWidth={2.5} />
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([DEFAULT_LAT, DEFAULT_LNG], 17, { animate: true });
              }
            }}
            className="w-12 h-12 rounded-xl bg-[#234D3B]/95 backdrop-blur-md border border-[#BF9861]/40 text-[#FFFEF7] flex items-center justify-center hover:bg-[#BF9861] hover:text-[#234D3B] hover:border-[#BF9861]/80 shadow-2xl cursor-pointer transition-all duration-300"
            title="Recenter to Site Plan"
          >
            <CircleDot size={20} strokeWidth={3} />
          </button>
        </div>

      </main>
    </div>
  );
}
