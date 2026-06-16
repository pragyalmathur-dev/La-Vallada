/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { Plus, Minus, CircleDot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MapContainer from './components/MapContainer';
import Sidebar from './components/Sidebar';
import { Unit, OverlayConfig } from './types';
import { UNITS } from './data';

// Helper for Villa custom blueprint drawing (Aesthetic vector architectural layout fallback)
function getVillaBlueprintSVG(number: string, isGroundFloor: boolean, withDimension: boolean, is3BHK: boolean) {
  return (
    <svg viewBox="0 0 500 380" className="w-full h-full text-stone-700 bg-[#FAF7F2] rounded-xl overflow-hidden shadow-inner">
      {/* Light Blueprint Grid */}
      <defs>
        <pattern id="modal-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(35, 77, 59, 0.04)" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#modal-grid)" />
      
      {/* Outer Boundary Wall */}
      <rect x="40" y="40" width="420" height="300" fill="none" stroke="#234D3B" strokeWidth="2.5" />
      
      {/* Compass Rose Header */}
      <g transform="translate(420, 75)" className="opacity-70 text-[#BF9861]">
        <circle cx="0" cy="0" r="14" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3" />
        <line x1="0" y1="-18" x2="0" y2="18" stroke="currentColor" strokeWidth="1.2" />
        <line x1="-18" y1="0" x2="18" y2="0" stroke="currentColor" strokeWidth="1.2" />
        <polygon points="0,-18 -4,-5 4,-5" fill="currentColor" />
        <polygon points="0,18 -3,5 3,5" fill="currentColor" className="opacity-50" />
        <text x="0" y="-22" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#BF9861">N</text>
      </g>

      {/* Floor Plan structural configurations */}
      {isGroundFloor ? (
        <>
          {/* Garden & Pool Yard */}
          <rect x="40" y="240" width="420" height="100" fill="rgba(191, 152, 97, 0.05)" stroke="#234D3B" strokeWidth="1" strokeDasharray="4" />
          
          {/* Plunge Pool */}
          <rect x="60" y="255" width="160" height="70" fill="rgba(84, 172, 179, 0.08)" stroke="#54ACB3" strokeWidth="1.5" />
          <rect x="65" y="260" width="150" height="60" fill="none" stroke="#54ACB3" strokeWidth="0.5" strokeDasharray="2" />
          <text x="140" y="295" fill="#257057" fontSize="9" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">PLUNGE POOL DECK</text>
          
          {/* Landscaped Garden */}
          <g transform="translate(320, 290)" className="text-[#257057] opacity-60">
            <circle cx="0" cy="0" r="12" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M 0 -12 C 4 -8, 8 -4, 0 0 C -8 4, -4 8, 0 12" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <text x="18" y="3" fontSize="8" fontWeight="bold" fill="#234D3B" className="font-sans uppercase tracking-wider">Lawn Garden</text>
          </g>

          {/* Living / Dining Room */}
          <rect x="40" y="40" width="220" height="200" fill="none" stroke="#234D3B" strokeWidth="1.5" />
          <text x="150" y="115" fill="#234D3B" fontSize="11" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">GREAT LIVING &amp; DINING</text>
          {withDimension && (
            <text x="150" y="132" fill="#AA783B" fontSize="9" fontWeight="bold" className="font-mono" textAnchor="middle">24&apos; - 0&quot; x 18&apos; - 6&quot;</text>
          )}

          {/* Guest Bedroom Suite */}
          <rect x="259" y="140" width="201" height="100" fill="none" stroke="#234D3B" strokeWidth="1.5" />
          <text x="360" y="185" fill="#234D3B" fontSize="11" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">GUEST SUITE</text>
          {withDimension && (
            <text x="360" y="202" fill="#AA783B" fontSize="9" fontWeight="bold" className="font-mono" textAnchor="middle">14&apos; - 0&quot; x 12&apos; - 6&quot;</text>
          )}

          {/* Kitchen Area */}
          <rect x="259" y="40" width="121" height="100" fill="none" stroke="#234D3B" strokeWidth="1.5" />
          <text x="320" y="90" fill="#234D3B" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-sans">FITTED KITCHEN</text>
          {withDimension && (
            <text x="320" y="105" fill="#AA783B" fontSize="8" className="font-mono" textAnchor="middle">9&apos; - 6&quot; x 10&apos; - 0&quot;</text>
          )}

          {/* Powder Room / Bath */}
          <rect x="380" y="40" width="80" height="100" fill="none" stroke="#234D3B" strokeWidth="1.5" />
          <text x="420" y="85" fill="#234D3B" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-sans">BATH</text>
          {withDimension && (
            <text x="420" y="98" fill="#AA783B" fontSize="7" className="font-mono" textAnchor="middle">5&apos; x 8&apos;</text>
          )}
        </>
      ) : (
        <>
          {/* Master Suite 01 */}
          <rect x="40" y="40" width="220" height="180" fill="none" stroke="#234D3B" strokeWidth="1.5" />
          <text x="150" y="120" fill="#234D3B" fontSize="11" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">OWNER&apos;S MASTER SUITE</text>
          {withDimension && (
            <text x="150" y="138" fill="#AA783B" fontSize="9" fontWeight="bold" className="font-mono" textAnchor="middle">18&apos; - 0&quot; x 15&apos; - 0&quot;</text>
          )}

          {/* Master Bath 01 */}
          <rect x="40" y="220" width="120" height="120" fill="none" stroke="#234D3B" strokeWidth="1.5" />
          <text x="100" y="275" fill="#234D3B" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-sans">EN-SUITE BATH</text>
          {withDimension && (
            <text x="100" y="290" fill="#AA783B" fontSize="8" className="font-mono" textAnchor="middle">8&apos; x 10&apos;</text>
          )}

          {/* Master Suite 02 */}
          <rect x="259" y="140" width="201" height="200" fill="none" stroke="#234D3B" strokeWidth="1.5" />
          <text x="360" y="230" fill="#234D3B" fontSize="11" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">BEDROOM SUITE 02</text>
          {withDimension && (
            <text x="360" y="248" fill="#AA783B" fontSize="9" fontWeight="bold" className="font-mono" textAnchor="middle">14&apos; - 0&quot; x 15&apos; - 0&quot;</text>
          )}

          {/* Sunset Balcony Deck */}
          <rect x="259" y="40" width="201" height="100" fill="rgba(191, 152, 97, 0.05)" stroke="#234D3B" strokeWidth="1.2" />
          <line x1="259" y1="40" x2="460" y2="140" stroke="#BF9861" strokeWidth="0.5" strokeDasharray="3" />
          <line x1="460" y1="40" x2="259" y2="140" stroke="#BF9861" strokeWidth="0.5" strokeDasharray="3" />
          <text x="360" y="85" fill="#234D3B" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-sans">SUNSET TIMBER DECK</text>
          {withDimension && (
            <text x="360" y="100" fill="#AA783B" fontSize="8" className="font-mono" textAnchor="middle">14&apos; x 8&apos;</text>
          )}

          {/* Walk-in Closet */}
          <rect x="160" y="220" width="100" height="120" fill="none" stroke="#234D3B" strokeWidth="1.5" />
          <text x="210" y="275" fill="#234D3B" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-sans">WALK-IN CLOSET</text>
          {withDimension && (
            <text x="210" y="290" fill="#AA783B" fontSize="8" className="font-mono" textAnchor="middle">7&apos; x 10&apos;</text>
          )}
        </>
      )}

      {/* Dynamic Dimensions markings / lines */}
      {withDimension && (
        <g stroke="#BF9861" strokeWidth="0.8" opacity="0.85">
          {/* Top wall dimension line */}
          <line x1="40" y1="28" x2="460" y2="28" />
          <path d="M40,24 L40,32 M460,24 L460,32" />
          
          {/* Left wall dimension line */}
          <line x1="28" y1="40" x2="28" y2="340" />
          <path d="M24,40 L32,40 M24,340 L32,340" />
        </g>
      )}

      {/* Extra detail: graphical touches */}
      <g stroke="#234D3B" strokeWidth="0.8" fill="none" opacity="0.3" className="font-sans">
        <path d="M 60 70 L 110 70 L 110 100" />
        <rect x="120" y="70" width="30" height="20" />
      </g>
    </svg>
  );
}

export default function App() {
  // ─── STATE MANAGERS ───
  const [units, setUnits] = useState<Unit[]>(UNITS);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedNearbyCategories, setSelectedNearbyCategories] = useState<string[]>([]);
  const [mapTile, setMapTile] = useState<'osm' | 'satellite' | 'topo'>('satellite');
  const [activeCategory, setActiveCategory] = useState<string>('Overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Villa/Apartment Floor Plan Modal states
  const [activeVillaModal, setActiveVillaModal] = useState<{ number: string; type: '2bhk-villas' | '3bhk-villas' | '2bhk-apts'; status: string } | null>(null);
  const [withDimension, setWithDimension] = useState<boolean>(true);
  const [isGroundFloor, setIsGroundFloor] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [imgErr, setImgErr] = useState<boolean>(false);

  // Ground position for site plan overlay config
  const DEFAULT_LAT = 15.588768;
  const DEFAULT_LNG = 73.786116;

  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    scale: 0.9749,
    widthScale: 1.3000,
    heightScale: 1.0000,
    rotation: -2.75,
    opacity: 1.00,
    visible: true
  });

  // ─── REFS FOR MAP ACCESS ───
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.ImageOverlay | null>(null);

  const handleFlyToUnit = (unit: Unit) => {
    setSelectedUnit(unit);
    if (mapRef.current) {
      mapRef.current.setView(unit.coordinate, 18, { animate: true });
    }
  };

  const handleOpenVillaFloorPlan = (villa: { number: string; type: '2bhk-villas' | '3bhk-villas' | '2bhk-apts'; status: string }) => {
    let resolvedType: '2bhk-villas' | '3bhk-villas' | '2bhk-apts' = villa.type;
    
    if (villa.type !== '2bhk-apts') {
      const num = parseInt(villa.number, 10);
      resolvedType = (num >= 1 && num <= 8) ? '3bhk-villas' : '2bhk-villas';
    }
    
    setActiveVillaModal({
      ...villa,
      type: resolvedType
    });
    setWithDimension(true);
    setIsGroundFloor(true);
    setZoomScale(1);
    setImgErr(false);
  };

  // Synchronize current floor plan PDF path naming structure
  useEffect(() => {
    if (!activeVillaModal) return;
    
    let baseName = '';
    if (activeVillaModal.type === '2bhk-apts') {
      // Remove whitespace for filename compliance
      const cleanNum = activeVillaModal.number.replace(/\s+/g, '');
      if (cleanNum.toLowerCase().startsWith('block')) {
        // Block-level floor plans
        baseName = `${cleanNum}_A_${isGroundFloor ? 'GF' : 'FF'}_WD`;
      } else {
        // Specific apartment unit floor plans
        baseName = `${cleanNum}_A_WD`;
      }
    } else {
      baseName = `${activeVillaModal.number}_V_${isGroundFloor ? 'GF' : 'FF'}_WD`;
    }
    
    const pdfUrl = `/assets/floorplans/${baseName}.pdf`;
    setImgSrc(pdfUrl);
    
    // Proactively verify if the PDF file exists on the server to prevent loading broken frames
    fetch(pdfUrl, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setImgErr(false);
        } else {
          // If the PDF file is missing, fallback to our architectural blueprint SVG layout
          setImgErr(true);
        }
      })
      .catch(() => {
        setImgErr(true);
      });
  }, [activeVillaModal, isGroundFloor]);

  return (
    <div id="vianaar-platform-app" className="h-screen w-screen flex overflow-hidden bg-[#FFFEF7] font-sans text-[#302F2C] select-none">

      {/* ESTATE CONFIGURATOR SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        units={units}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        onFlyToUnit={handleFlyToUnit}
        onOpenVillaFloorPlan={handleOpenVillaFloorPlan}
      />

      {/* INTERACTIVE MAP AREA */}
      <main className="flex-1 h-full w-full relative flex flex-col bg-[#FFFEF7]">
        
        {/* CIRCULAR SIDEBAR MENU TRIGGER (TOP LEFT) */}
        <button
          type="button"
          id="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-6 z-[1600] w-12 h-12 rounded-full border border-[#BF9861] bg-[#234D3B]/95 text-[#FFFEF7] hover:bg-[#BF9861] hover:text-[#234D3B] flex items-center justify-center shadow-2xl cursor-pointer transition-all duration-300 pointer-events-auto"
          title={sidebarOpen ? "Close Estate Configurator" : "Open Estate Configurator"}
        >
          <div className="flex flex-col gap-[4.5px] items-center justify-center">
            <div className={`h-[2px] w-5 bg-current rounded-full transition-all duration-300 ${sidebarOpen ? 'transform rotate-45 translate-y-[6.5px]' : ''}`}></div>
            <div className={`h-[2px] w-5 bg-current rounded-full transition-all duration-300 ${sidebarOpen ? 'opacity-0' : ''}`}></div>
            <div className={`h-[2px] w-5 bg-current rounded-full transition-all duration-300 ${sidebarOpen ? 'transform -rotate-45 -translate-y-[6.5px]' : ''}`}></div>
          </div>
        </button>

        {/* TOP STATUS BAR OVER MAP */}
        <header className="absolute top-0 left-0 right-0 h-20 bg-[#234D3B]/95 backdrop-blur-md border-b border-[#BF9861]/35 flex items-center justify-between pl-20 pr-8 z-[900] pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="flex flex-col py-1.5">
              <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#BF9861] leading-none mb-1">
                Vianaar
              </span>
              <h1 className="font-serif text-2xl font-bold text-[#FFFEF7] leading-none mb-1.5">
                La Velada
              </h1>
              <span className="text-[9px] uppercase tracking-wider text-[#E3D5C9]/85 font-semibold leading-none">
                Verla Canca, North Goa
              </span>
            </div>
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
          sidebarOpen={sidebarOpen}
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

      {/* ─── VILLA FLOOR PLAN MODAL ─── */}
      <AnimatePresence>
        {activeVillaModal && (
          // Backdrop Overlay
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-3 md:p-8 select-none pointer-events-auto"
            onClick={() => setActiveVillaModal(null)}
          >
            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full border border-[#BF9861]/35 flex flex-col h-[92vh] md:h-[90vh] max-h-[780px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header section with X */}
              <div className="flex justify-between items-start px-5 md:px-8 pt-5 md:pt-7 pb-3.5 border-b border-stone-100 flex-shrink-0">
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight text-[#234D3B] uppercase">
                    {activeVillaModal.type === '2bhk-apts' ? 'Residence' : 'Villa'} {activeVillaModal.number}
                  </h2>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-[9px] md:text-[10px] font-sans font-bold tracking-[2px] md:tracking-[3px] text-stone-400 uppercase leading-none">
                      FLOOR PLAN PERSPECTIVE
                    </span>
                    <span className="text-stone-300 leading-none pb-0.5">•</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#234D3B] bg-[#E7F2EE] text-[#234D3B] text-[9px] md:text-[10px] font-sans font-extrabold uppercase tracking-widest leading-none shadow-sm animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#234D3B]"></span>
                      AVAILABLE
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveVillaModal(null)}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-800 transition-all font-sans font-light text-lg cursor-pointer border border-stone-100 shadow-sm"
                >
                  ✕
                </button>
              </div>

              {/* Main Dialog Grid Panel */}
              <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-white overflow-y-auto md:overflow-hidden">
                
                {/* Left controls sidebar */}
                <div className="w-full md:w-[260px] p-5 md:p-8 md:border-r border-b md:border-b-0 border-stone-100 flex flex-col space-y-5 md:space-y-7 flex-shrink-0 bg-white select-none justify-start">

                  {/* Floor Level Vertical List Selection */}
                  <div className="space-y-2 md:space-y-3">
                    <span className="text-[10.5px] font-sans font-extrabold tracking-[2px] text-[#BF9861] uppercase block">
                      FLOOR LEVEL
                    </span>
                    <div className="grid grid-cols-2 md:flex md:flex-col gap-2.5 md:gap-3">
                      <button
                        type="button"
                        onClick={() => setIsGroundFloor(true)}
                        className={`flex items-center justify-between px-4 md:px-5 h-12 md:h-14 rounded-xl border text-left transition-all cursor-pointer ${
                          isGroundFloor
                            ? 'bg-[#234D3B] border-[#234D3B] text-white shadow-md font-bold'
                            : 'bg-[#FFFEF7] border-stone-200 text-stone-500 hover:border-[#BF9861]/60 hover:bg-stone-50/50'
                        }`}
                      >
                        <span className="text-[11.5px] md:text-xs font-sans font-bold tracking-wider uppercase">Ground Floor</span>
                        {isGroundFloor && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white block shadow-sm outline outline-offset-2 outline-white"></span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsGroundFloor(false)}
                        className={`flex items-center justify-between px-4 md:px-5 h-12 md:h-14 rounded-xl border text-left transition-all cursor-pointer ${
                          !isGroundFloor
                            ? 'bg-[#234D3B] border-[#234D3B] text-white shadow-md font-bold'
                            : 'bg-[#FFFEF7] border-stone-200 text-stone-500 hover:border-[#BF9861]/60 hover:bg-stone-50/50'
                        }`}
                      >
                        <span className="text-[11.5px] md:text-xs font-sans font-bold tracking-wider uppercase">First Floor</span>
                        {!isGroundFloor && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white block shadow-sm outline outline-offset-2 outline-white"></span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Premium PDF Launcher Button */}
                  {!imgErr && (
                    <div className="pt-4 border-t border-stone-100 md:mt-auto">
                      <a
                        href={imgSrc}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 h-11 md:h-12 px-4 rounded-xl border border-[#BF9861]/60 text-[#BF9861] hover:bg-[#BF9861]/10 text-[11px] md:text-xs font-sans font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer"
                        title="Open Original PDF Floor Plan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open PDF Floor Plan
                      </a>
                    </div>
                  )}
                </div>

                {/* Right Interactive Blueprint Canvas */}
                <div className="flex-grow flex flex-col p-5 md:p-8 min-h-0 bg-stone-50/30">
                  <div className="flex-grow relative rounded-2xl border border-stone-200/80 overflow-hidden bg-[#FAF7F2] shadow-sm flex items-center justify-center min-h-[300px] md:min-h-0 select-none">
                    
                    {/* Transforming Scale Render Holder */}
                    <div className="w-full h-full p-4 transition-transform duration-300 flex items-center justify-center" style={{
                      transform: `scale(${zoomScale})`
                    }}>
                      {imgErr ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center w-full h-full">
                          <p className="font-sans font-semibold text-[#BF9861] bg-[#142d22] border border-[#BF9861]/30 py-4 px-7 rounded-2xl shadow-xl text-sm leading-relaxed max-w-[325px]">
                            Oops! Please reach out to the admin.
                          </p>
                        </div>
                      ) : (
                        <iframe
                          src={imgSrc}
                          className="w-full h-full border-none bg-transparent rounded-xl"
                          title={`Villa ${activeVillaModal.number} Floor Plan Layout`}
                        />
                      )}
                    </div>

                    {/* Floating Zoom controls widget bottom right */}
                    {!imgErr && (
                      <div className="absolute bottom-6 right-6 flex flex-col rounded-xl bg-stone-900/95 shadow-2xl p-1 gap-1 border border-white/10 z-10">
                        <button
                          type="button"
                          onClick={() => setZoomScale(s => Math.min(3, s + 0.25))}
                          disabled={zoomScale >= 3}
                          className="w-9 h-9 rounded-lg hover:bg-white/10 text-white flex items-center justify-center cursor-pointer transition-all disabled:opacity-35 disabled:cursor-not-allowed font-bold"
                          title="Zoom In"
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setZoomScale(s => Math.max(1, s - 0.25))}
                          disabled={zoomScale <= 1}
                          className="w-9 h-9 rounded-lg hover:bg-white/10 text-white flex items-center justify-center cursor-pointer transition-all disabled:opacity-35 disabled:cursor-not-allowed font-bold"
                          title="Zoom Out"
                        >
                          <Minus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footnote matching design spec below container */}
                  <div className="pt-4 border-t border-stone-100 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 flex-shrink-0 text-stone-500 text-xs">
                    <div className="space-y-0.5">
                      <h4 className="font-serif text-lg font-bold text-[#234D3B] leading-none mb-1">
                        {activeVillaModal.type === '2bhk-apts' ? 'Residence' : 'Villa'} {activeVillaModal.number}
                      </h4>
                      <p className="text-[10px] font-sans font-bold tracking-wider text-stone-400 block uppercase">
                        {activeVillaModal.type === '2bhk-apts' ? 'SUITE DETAILED LAYOUT' : `${isGroundFloor ? 'GROUND' : 'FIRST'} FLOOR LAYOUT - COMPREHENSIVE PLAN`}
                      </p>
                    </div>
                    <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-stone-400">
                      Verla Canca · Vianaar Boutique Homes
                    </span>
                  </div>

                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
