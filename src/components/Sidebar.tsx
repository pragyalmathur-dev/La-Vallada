/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  MapPin, 
  Compass, 
  Maximize2, 
  Layers, 
  Eye, 
  Building2
} from 'lucide-react';
import { Unit } from '../types';

interface SidebarProps {
  isOpen: boolean;
  units: Unit[];
  selectedUnit: Unit | null;
  setSelectedUnit: (unit: Unit | null) => void;
  onFlyToUnit: (unit: Unit) => void;
  onOpenVillaFloorPlan?: (villa: { number: string; type: '2bhk-villas' | '3bhk-villas' | '2bhk-apts'; status: string; mode?: 'floorplan' | 'render' }) => void;
}

type NavCategory = 'floorplans' | 'renders';
type NavItem = '2bhk-villas' | '3bhk-villas' | '2bhk-apts';

export default function Sidebar({
  isOpen,
  units,
  selectedUnit,
  setSelectedUnit,
  onFlyToUnit,
  onOpenVillaFloorPlan
}: SidebarProps) {
  // Navigation states
  const [activeCategory, setActiveCategory] = useState<NavCategory | null>(null);
  const [activeItem, setActiveItem] = useState<NavItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; desc: string } | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  const [selectedSubSubItem, setSelectedSubSubItem] = useState<string | null>(null);
  const [renderImgErr, setRenderImgErr] = useState<boolean>(false);

  // Responsive state for mobile adaptation
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sub-items mappings
  const subItemsMap: Record<NavItem, string[]> = {
    '2bhk-villas': ['9', '10', '11', '12', '14', '15', '16', '17', '18', '19', '20', '21'],
    '3bhk-villas': ['1', '2', '3', '4', '5', '6', '7', '8'],
    '2bhk-apts': ['Block A', 'Block B', 'Block C']
  };

  // Sub-sub-items mappings for 2 BHK Apartments Blocks
  const subSubItemsMap: Record<string, string[]> = {
    'Block A': ['A101', 'A102', 'A103', 'A104', 'A201', 'A202', 'A203', 'A204', 'A301', 'A302', 'A303', 'A304', 'A401', 'A402', 'A403', 'A404'],
    'Block B': ['B101', 'B102', 'B103', 'B104', 'B201', 'B202', 'B203', 'B204', 'B301', 'B302', 'B303', 'B304', 'B401', 'B402', 'B403', 'B404'],
    'Block C': ['C01', 'C02', 'C03', 'C04', 'C101', 'C102', 'C103', 'C104', 'C201', 'C202', 'C203', 'C204', 'C301', 'C302', 'C303', 'C304']
  };

  // Filter matching units for map interactions
  const getMatchingUnits = (item: NavItem): Unit[] => {
    if (item === '3bhk-villas') {
      return units.filter(u => u.type === 'Villa' && u.beds === 3);
    } else if (item === '2bhk-apts') {
      return units.filter(u => u.type === 'Apartment' && u.beds === 2);
    }
    // 2 BHK villas: none exist in UNITS, return empty list
    return [];
  };

  const handleItemSelect = (category: NavCategory, item: NavItem) => {
    setActiveCategory(category);
    setActiveItem(item);
    setSelectedSubItem(null); // Reset sub item on main item change
    setSelectedSubSubItem(null); // Reset sub-sub item
    setRenderImgErr(false);

    if (category === 'renders') {
      if (onOpenVillaFloorPlan) {
        onOpenVillaFloorPlan({
          number: item === '3bhk-villas' ? '3 BHK Villa' : item === '2bhk-villas' ? '2 BHK Villa' : 'Apartment',
          type: item,
          status: 'Available',
          mode: 'render'
        });
      }
    }
  };

  const handleSubItemClick = (subItem: string) => {
    setSelectedSubItem(subItem);
    setSelectedSubSubItem(null); // Reset sub-sub item on different block selection
    
    // Determine unit status and properties
    let status = 'Available';
    const paddedNum = subItem.padStart(2, '0');
    
    if (activeCategory === 'floorplans' && activeItem) {
      if (activeItem === '2bhk-villas' || activeItem === '3bhk-villas') {
        // Find matching unit status
        const cleanId = `V-${paddedNum}`;
        const foundUnit = units.find(u => u.id === cleanId || u.id === `V-0${subItem}`);
        if (foundUnit) {
          status = foundUnit.status;
        } else {
          const numVal = parseInt(subItem, 10);
          status = numVal % 3 === 0 ? 'Available' : numVal % 3 === 1 ? 'Reserved' : 'Sold';
        }
        
        if (onOpenVillaFloorPlan) {
          onOpenVillaFloorPlan({
            number: paddedNum,
            type: activeItem,
            status: status
          });
        }
      } else if (activeItem === '2bhk-apts') {
        if (onOpenVillaFloorPlan) {
          onOpenVillaFloorPlan({
            number: subItem, // e.g., "Block A"
            type: '2bhk-apts',
            status: 'Available'
          });
        }
      }
    } else if (activeCategory === 'renders' && activeItem) {
      // Directly trigger lightbox with render for the selected category of residences
      const details = renderDetails[activeItem];
      if (details) {
        setRenderImgErr(false);
        setLightboxImage({
          url: details.url,
          title: `${details.title} (Residence ${subItem})`,
          desc: details.desc
        });
      }
    }

    // Locate match on map
    if (activeItem === '3bhk-villas') {
      const paddedId = `V-0${subItem}`;
      const foundUnit = units.find(u => u.id === paddedId);
      if (foundUnit) {
        setSelectedUnit(foundUnit);
      }
    } else if (activeItem === '2bhk-apts') {
      // Find First available apartment in selected block
      const foundUnit = units.find(u => u.type === 'Apartment' && u.block === subItem);
      if (foundUnit) {
        setSelectedUnit(foundUnit);
      }
    } else if (activeItem === '2bhk-villas') {
      // Generate a coordinate near properties for pre-launch 2bhk villas
      const num = parseInt(subItem, 10);
      const angle = (num * 30) * (Math.PI / 180);
      const radius = 0.0003;
      const mockLat = 15.5891 + Math.sin(angle) * radius;
      const mockLng = 73.7852 + Math.cos(angle) * radius;
      
      const tempUnit: Unit = {
        id: `mock-V-${num}`,
        name: `Villa ${num} (2 BHK)`,
        type: 'Villa',
        beds: 2,
        baths: 2,
        sqft: 2600,
        price: '₹4.85 Cr',
        status: num % 3 === 0 ? 'Available' : num % 3 === 1 ? 'Reserved' : 'Sold',
        coordinate: [mockLat, mockLng],
        block: 'Phase II (Proposed)',
        facing: 'East',
        features: ['Bespoke sunset deck', 'Tropical outdoor shower', 'Double clearance ceiling']
      };
      
      setSelectedUnit(tempUnit);
    }
  };

  const handleSubSubItemClick = (subSubItem: string) => {
    setSelectedSubSubItem(subSubItem);
    
    // Look up in database or mock a coordinate
    let foundUnit = units.find(u => u.id.replace('-', '') === subSubItem.replace('-', ''));
    if (!foundUnit) {
      // Try name match
      foundUnit = units.find(u => u.name.includes(subSubItem));
    }
    
    if (foundUnit) {
      setSelectedUnit(foundUnit);
    } else {
      // Create a mock unit near the block coordinates to fly to
      let baseLat = 15.58860;
      let baseLng = 73.78650;
      if (subSubItem.startsWith('B')) {
        baseLat = 15.58850;
        baseLng = 73.78570;
      } else if (subSubItem.startsWith('C')) {
        baseLat = 15.58840;
        baseLng = 73.78610;
      }
      
      // Add a small deterministic offset based on characters
      const charCodeSum = subSubItem.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const angle = (charCodeSum * 15) * (Math.PI / 180);
      const offset = 0.00015;
      const mockLat = baseLat + Math.sin(angle) * offset;
      const mockLng = baseLng + Math.cos(angle) * offset;
      
      const tempUnit: Unit = {
        id: `mock-${subSubItem}`,
        name: `Apartment ${subSubItem}`,
        type: 'Apartment',
        beds: 2,
        baths: 2,
        sqft: 1450,
        price: '₹2.30 Cr',
        status: charCodeSum % 3 === 0 ? 'Available' : charCodeSum % 3 === 1 ? 'Reserved' : 'Sold',
        coordinate: [mockLat, mockLng],
        block: selectedSubItem || 'Block A',
        facing: 'East',
        features: ['Forest-facing views', 'Spacious Balcony', 'Premium Fittings']
      };
      setSelectedUnit(tempUnit);
    }

    // Trigger Floor Plan Modal for Apartments when clicked under floorplans category
    if (activeCategory === 'floorplans' && activeItem === '2bhk-apts') {
      if (onOpenVillaFloorPlan) {
        onOpenVillaFloorPlan({
          number: subSubItem, // e.g. "A101"
          type: '2bhk-apts',
          status: 'Available'
        });
      }
    }
  };

  // Render modern architectural vector SVGs for floorplans
  const renderFloorPlanSVG = (item: NavItem) => {
    if (item === '2bhk-villas') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-44 border border-[#BF9861]/25 bg-[#142d22] rounded-xl overflow-hidden p-2">
          {/* Grid Background */}
          <defs>
            <pattern id="grid-2bhk" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(191, 152, 97, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-2bhk)" />
          
          {/* Boundary Walls */}
          <rect x="50" y="40" width="300" height="150" fill="none" stroke="#BF9861" strokeWidth="2.5" strokeDasharray="380" />
          <line x1="200" y1="40" x2="200" y2="190" stroke="#BF9861" strokeWidth="1.5" strokeDasharray="4" />
          
          {/* Deck & Lawn Outlines */}
          <rect x="50" y="160" width="300" height="30" fill="rgba(191, 152, 97, 0.05)" stroke="#BF9861" strokeWidth="1" />
          <text x="200" y="178" fill="#E3D5C9" fontSize="9" fontWeight="bold" letterSpacing="0.1em" textAnchor="middle" className="font-sans">
            TROPICAL GREEN DECK & OUTDOOR SHOWER
          </text>

          {/* Rooms */}
          {/* Suite Left */}
          <rect x="70" y="60" width="110" height="85" fill="rgba(255, 254, 247, 0.02)" stroke="#BF9861" strokeWidth="1" />
          <circle cx="125" cy="100" r="16" fill="none" stroke="#BF9861" strokeWidth="1" strokeDasharray="2" />
          <text x="125" y="99" fill="#FFFEF7" fontSize="10" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">SUITE 01</text>
          <text x="125" y="112" fill="#BF9861" fontSize="8" textAnchor="middle" className="font-mono">14&apos; x 12&apos;</text>

          {/* Living & Kitchen Right */}
          <rect x="220" y="60" width="110" height="85" fill="rgba(255, 254, 247, 0.02)" stroke="#BF9861" strokeWidth="1" />
          <path d="M 230 110 L 255 110" stroke="#BF9861" strokeWidth="1.5" />
          <path d="M 230 110 L 230 130" stroke="#BF9861" strokeWidth="1.5" />
          <text x="275" y="99" fill="#FFFEF7" fontSize="10" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">LIVING ROOM</text>
          <text x="275" y="112" fill="#BF9861" fontSize="8" textAnchor="middle" className="font-mono">16&apos; x 14&apos;</text>
          
          {/* Text annotations */}
          <text x="345" y="32" fill="#E3D5C9" fontSize="8" fontWeight="bold" textAnchor="end" className="font-mono">BOUTIQUE 2BHK</text>
        </svg>
      );
    } else if (item === '3bhk-villas') {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-44 border border-[#BF9861]/25 bg-[#142d22] rounded-xl overflow-hidden p-2">
          {/* Grid Background */}
          <defs>
            <pattern id="grid-3bhk" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(191, 152, 97, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-3bhk)" />

          {/* Walls */}
          <rect x="40" y="40" width="320" height="150" fill="none" stroke="#BF9861" strokeWidth="2.5" />
          
          {/* Room separators */}
          <line x1="160" y1="40" x2="160" y2="190" stroke="#BF9861" strokeWidth="1.5" />
          <line x1="260" y1="40" x2="260" y2="190" stroke="#BF9861" strokeWidth="1.5" />

          {/* Pool Deck Area */}
          <rect x="40" y="150" width="120" height="40" fill="rgba(84, 172, 179, 0.08)" stroke="#54ACB3" strokeWidth="1" />
          <rect x="50" y="158" width="100" height="24" fill="none" stroke="#54ACB3" strokeWidth="1.2" strokeDasharray="3" />
          <text x="100" y="173" fill="#54ACB3" fontSize="8" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">PLUNGE POOL</text>
          
          {/* Great Room - Middle */}
          <text x="210" y="95" fill="#FFFEF7" fontSize="10" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">GREAT ROOM</text>
          <text x="210" y="110" fill="#E3D5C9" fontSize="8" textAnchor="middle" className="font-sans">DOUBLE HEIGHT</text>
          <text x="210" y="123" fill="#BF9861" fontSize="8" textAnchor="middle" className="font-mono">18&apos; x 22&apos;</text>

          {/* Master Bedroom */}
          <text x="312" y="99" fill="#FFFEF7" fontSize="10" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">MASTER SUITE</text>
          <text x="312" y="112" fill="#BF9861" fontSize="8" textAnchor="middle" className="font-mono">15&apos; x 15&apos;</text>

          {/* Guest Room - Left Top */}
          <rect x="40" y="40" width="120" height="75" fill="rgba(255, 254, 247, 0.02)" stroke="#BF9861" strokeWidth="0.8" />
          <text x="100" y="75" fill="#FFFEF7" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-sans">GUEST ROOM 02</text>
          <text x="100" y="87" fill="#BF9861" fontSize="7" textAnchor="middle" className="font-mono">12&apos; x 14&apos;</text>

          {/* Scale annotations */}
          <text x="355" y="32" fill="#E3D5C9" fontSize="8" fontWeight="bold" textAnchor="end" className="font-mono">VILLA SERENE 3BHK</text>
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 400 240" className="w-full h-44 border border-[#BF9861]/25 bg-[#142d22] rounded-xl overflow-hidden p-2">
          {/* Grid Background */}
          <defs>
            <pattern id="grid-apt" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(191, 152, 97, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-apt)" />

          {/* Layout walls */}
          <rect x="40" y="50" width="320" height="120" fill="none" stroke="#BF9861" strokeWidth="2.5" />
          <line x1="200" y1="50" x2="200" y2="170" stroke="#BF9861" strokeWidth="1.5" />

          {/* Balcony */}
          <rect x="40" y="170" width="320" height="25" fill="rgba(191, 152, 97, 0.05)" stroke="#BF9861" strokeWidth="1" />
          <text x="200" y="186" fill="#E3D5C9" fontSize="8" fontWeight="bold" letterSpacing="0.1em" textAnchor="middle" className="font-sans">
            LINEAR FOREST BALCONY
          </text>

          {/* Living/Dining - Left */}
          <text x="120" y="99" fill="#FFFEF7" fontSize="10" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">LIVING &amp; DINING</text>
          <text x="120" y="114" fill="#BF9861" fontSize="8" textAnchor="middle" className="font-mono">18&apos; x 14&apos;</text>

          {/* Suite Right */}
          <text x="280" y="99" fill="#FFFEF7" fontSize="10" fontWeight="bold" letterSpacing="0.05em" textAnchor="middle" className="font-sans">MASTER BEDROOM</text>
          <text x="280" y="114" fill="#BF9861" fontSize="8" textAnchor="middle" className="font-mono">14&apos; x 15&apos;</text>

          {/* Amenities details */}
          <text x="355" y="42" fill="#E3D5C9" fontSize="8" fontWeight="bold" textAnchor="end" className="font-mono">SUITE APARTMENT 2BHK</text>
        </svg>
      );
    }
  };

  // Curated floor plan details mapping
  const floorPlanDetails = {
    '2bhk-villas': {
      title: 'Boutique Contemporary Villa',
      area: '2,600 Sq.Ft.',
      desc: 'An exclusive pre-launch, low-density villa layout encapsulating Goa\'s quiet woodland beauty. Prioritizes open volumes, custom sunset timber decks, private landscaped lawns, and high-specifications.',
      specs: [
        { label: 'Built-up Area', value: '2,600 Sq.Ft.' },
        { label: 'Bedrooms', value: '2 En-suites' },
        { label: 'Ceiling Clearance', value: '16 Feet' },
        { label: 'Private Swimming Deck', value: 'Included' }
      ]
    },
    '3bhk-villas': {
      title: 'Villa Serene Signature Layout',
      area: '3,500 Sq.Ft.',
      desc: 'Our flagship 3 BHK layout creating a completely seamless architectural transition between the double-height great room and your private teal-stone plunge pool deck.',
      specs: [
        { label: 'Built-up Area', value: '3,500 Sq.Ft.' },
        { label: 'Bedrooms', value: '3 En-suites' },
        { label: 'Ceiling Clearance', value: '18 Feet' },
        { label: 'Teak Wooden Louvers', value: 'Included' }
      ]
    },
    '2bhk-apts': {
      title: 'Premium Suite Residence',
      area: '1,450 Sq.Ft.',
      desc: 'Extravagant residential flat featuring spacious linear sky-level forest balconies, optimized space arrangements, modular wardrobes, and sliding glass grids to capture Goan morning lights.',
      specs: [
        { label: 'Carpet Area', value: '1,250 Sq.Ft.' },
        { label: 'Veranda Balcony', value: '200 Sq.Ft.' },
        { label: 'Orientation', value: 'North-East' },
        { label: 'Dedicated Parking', value: '1 Secured Bay' }
      ]
    }
  };

  // Curated render showcase mapping
  const renderDetails = {
    '3bhk-villas': {
      title: 'Villa Serene Tropical Elevation',
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      desc: 'Modern structural concrete slabs paired with warm vertical tropical hard-teak louvers. Features perfect integration with local foliage and private warm-lit swimming decks.'
    },
    '2bhk-villas': {
      title: 'Boutique Villa Sunset Deck',
      url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      desc: 'An intimate contemporary elevation displaying local basalt stonemasonry details, floor-to-ceiling sliding glass units, and a peaceful green garden layout.'
    },
    '2bhk-apts': {
      title: 'Suite Residences Linear Balcony',
      url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      desc: 'Bespoke linear great room focusing on premium Italian statuario marble accents, raw linen wall fabrics, and floating glass doors overlooking beautiful forest horizons.'
    }
  };

  return (
    <>
      <motion.aside
        id="sidebar"
        initial={isMobile ? { x: '-100%', opacity: 0 } : { width: 0, opacity: 0 }}
        animate={
          isOpen 
            ? (isMobile ? { x: 0, opacity: 1, width: '100vw' } : { width: 380, opacity: 1 }) 
            : (isMobile ? { x: '-100%', opacity: 0, width: '0vw' } : { width: 0, opacity: 0 })
        }
        exit={isMobile ? { x: '-100%', opacity: 0 } : { width: 0, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`h-full bg-white border-r border-[#BF9861]/25 flex flex-col z-[1500] ${
          isMobile ? 'fixed inset-y-0 left-0 shadow-2xl w-full' : 'relative shrink-0'
        } text-[#302F2C] select-none overflow-hidden`}
      >
        <div className="w-full md:w-[380px] h-full flex flex-col">
          {/* ─── BRAND HEADER ─── */}
          <div className="p-6 pt-10 pb-5 border-b border-[#BF9861]/25 bg-[#FFFEF7] flex-shrink-0">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-sans font-bold tracking-[6px] text-[#BF9861] uppercase block leading-none">
                VIANAAR
              </span>
              <h1 className="font-serif text-3xl font-bold text-[#234D3B] tracking-wide leading-none pb-0.5">
                La Velada
              </h1>
              <p className="text-[10px] font-sans font-light tracking-[2px] text-[#302F2C]/70 uppercase pt-0.5">
                Verla Canca, North Goa
              </p>
            </div>
          </div>

          {/* ─── SCROLLABLE CORE MENU & CONFIGURATOR ─── */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 custom-scrollbar bg-white">
            
            {/* SECTION 1: FLOOR PLANS */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#BF9861]" />
                <h3 className="text-[13.5px] font-serif font-extrabold uppercase tracking-[0.18em] text-[#234D3B]">
                  Floor Plans
                </h3>
              </div>
              
              {/* Grid with 3 big buttons from left to right */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="btn-fp-2bhk-villas"
                  onClick={() => handleItemSelect('floorplans', '2bhk-villas')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-lg border text-center transition-all duration-300 shadow-sm cursor-pointer h-[92px] ${
                    activeCategory === 'floorplans' && activeItem === '2bhk-villas'
                      ? 'bg-[#234D3B] border-[#234D3B] text-white'
                      : 'bg-[#FFFEF7]/40 border-[#BF9861]/20 text-[#302F2C] hover:border-[#BF9861]/60 hover:bg-[#FFFEF7]/80'
                  }`}
                >
                  <Building size={18} className="mb-1.5 opacity-90" />
                  <span className="text-[11.5px] font-sans font-extrabold leading-tight uppercase tracking-wider">2 BHK</span>
                  <span className="text-[9px] font-sans font-medium tracking-wide uppercase leading-none opacity-80">Villas</span>
                </button>

                <button
                  type="button"
                  id="btn-fp-3bhk-villas"
                  onClick={() => handleItemSelect('floorplans', '3bhk-villas')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-lg border text-center transition-all duration-300 shadow-sm cursor-pointer h-[92px] ${
                    activeCategory === 'floorplans' && activeItem === '3bhk-villas'
                      ? 'bg-[#234D3B] border-[#234D3B] text-white'
                      : 'bg-[#FFFEF7]/40 border-[#BF9861]/20 text-[#302F2C] hover:border-[#BF9861]/60 hover:bg-[#FFFEF7]/80'
                  }`}
                >
                  <Building2 size={18} className="mb-1.5 opacity-90" />
                  <span className="text-[11.5px] font-sans font-extrabold leading-tight uppercase tracking-wider">3 BHK</span>
                  <span className="text-[9px] font-sans font-medium tracking-wide uppercase leading-none opacity-80">Villas</span>
                </button>

                <button
                  type="button"
                  id="btn-fp-2bhk-apts"
                  onClick={() => handleItemSelect('floorplans', '2bhk-apts')}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-lg border text-center transition-all duration-300 shadow-sm cursor-pointer h-[92px] ${
                    activeCategory === 'floorplans' && activeItem === '2bhk-apts'
                      ? 'bg-[#234D3B] border-[#234D3B] text-white'
                      : 'bg-[#FFFEF7]/40 border-[#BF9861]/20 text-[#302F2C] hover:border-[#BF9861]/60 hover:bg-[#FFFEF7]/80'
                  }`}
                >
                  <Building size={18} className="mb-1.5 opacity-90" />
                  <span className="text-[11.5px] font-sans font-extrabold leading-tight uppercase tracking-wider">2 BHK</span>
                  <span className="text-[9px] font-sans font-medium tracking-wide uppercase leading-none opacity-80">Apartments</span>
                </button>
              </div>

              {/* Sub-buttons for Floor Plans */}
              <AnimatePresence mode="wait">
                {activeCategory === 'floorplans' && activeItem && (
                  <motion.div
                    key={`fp-sub-${activeItem}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-stone-50/80 p-3.5 rounded-lg border border-[#BF9861]/15 mt-1.5 space-y-3 shadow-inner">
                      <span className="text-[10.5px] font-sans font-extrabold text-[#234D3B]/70 uppercase tracking-widest block">
                        {activeItem === '2bhk-apts' ? 'SELECT RESIDENCE BLOCK' : 'SELECT RESIDENCE NUMBER'}
                      </span>
                      <div className={`grid gap-1.5 ${
                        activeItem === '2bhk-villas' ? 'grid-cols-6' :
                        activeItem === '3bhk-villas' ? 'grid-cols-4' : 'grid-cols-3'
                      }`}>
                        {subItemsMap[activeItem].map((subItem) => (
                          <button
                            key={subItem}
                            type="button"
                            onClick={() => handleSubItemClick(subItem)}
                            className={`py-2 text-[12px] font-sans font-bold rounded border text-center transition-all cursor-pointer ${
                              selectedSubItem === subItem
                                ? 'bg-[#BF9861] border-[#BF9861] text-white shadow font-extrabold'
                                : 'bg-white border-[#BF9861]/15 text-[#302F2C] hover:border-[#BF9861]/60 hover:bg-[#FFFEF7]'
                            }`}
                          >
                            {subItem}
                          </button>
                        ))}
                      </div>

                      {/* Third Level Sub-sub-buttons for Apartment Numbers */}
                      <AnimatePresence mode="wait">
                        {activeItem === '2bhk-apts' && selectedSubItem && (
                          <motion.div
                            key={`fp-subsub-${selectedSubItem}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-3.5 pt-3 border-t border-[#BF9861]/15 space-y-2.5"
                          >
                            <span className="text-[10px] font-sans font-extrabold text-[#234D3B]/70 uppercase tracking-widest block">
                              SELECT RESIDENCE IN {selectedSubItem.toUpperCase()}
                            </span>
                            <div className="grid grid-cols-4 gap-1.5">
                              {subSubItemsMap[selectedSubItem]?.map((aptCode) => (
                                <button
                                  key={aptCode}
                                  type="button"
                                  onClick={() => handleSubSubItemClick(aptCode)}
                                  className={`py-2 text-[11px] font-sans font-bold rounded border text-center transition-all cursor-pointer ${
                                    selectedSubSubItem === aptCode
                                      ? 'bg-[#234D3B] border-[#234D3B] text-white shadow font-extrabold'
                                      : 'bg-white border-[#BF9861]/15 text-[#302F2C] hover:border-[#BF9861]/50 hover:bg-[#FFFEF7]'
                                  }`}
                                >
                                  {aptCode}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SECTION 2: RENDERS */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#BF9861]" />
                <h3 className="text-[13.5px] font-serif font-extrabold uppercase tracking-[0.18em] text-[#234D3B]">
                  Renders
                </h3>
              </div>

              {/* Grid of 3 buttons in a single line */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="btn-render-3bhk-villas"
                  onClick={() => handleItemSelect('renders', '3bhk-villas')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all duration-300 shadow-sm cursor-pointer h-[80px] ${
                    activeCategory === 'renders' && activeItem === '3bhk-villas'
                      ? 'bg-[#234D3B] border-[#234D3B] text-white'
                      : 'bg-[#FFFEF7]/40 border-[#BF9861]/20 text-[#302F2C] hover:border-[#BF9861]/60 hover:bg-[#FFFEF7]/80'
                  }`}
                >
                  <span className="text-[10.5px] font-sans font-extrabold uppercase tracking-wide leading-tight">3 BHK</span>
                  <span className="text-[9px] font-sans font-medium tracking-widest leading-none opacity-80">Villas</span>
                </button>

                <button
                  type="button"
                  id="btn-render-2bhk-villas"
                  onClick={() => handleItemSelect('renders', '2bhk-villas')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all duration-300 shadow-sm cursor-pointer h-[80px] ${
                    activeCategory === 'renders' && activeItem === '2bhk-villas'
                      ? 'bg-[#234D3B] border-[#234D3B] text-white'
                      : 'bg-[#FFFEF7]/40 border-[#BF9861]/20 text-[#302F2C] hover:border-[#BF9861]/60 hover:bg-[#FFFEF7]/80'
                  }`}
                >
                  <span className="text-[10.5px] font-sans font-extrabold uppercase tracking-wide leading-tight">2 BHK</span>
                  <span className="text-[9px] font-sans font-medium tracking-widest leading-none opacity-80">Villas</span>
                </button>

                <button
                  type="button"
                  id="btn-render-2bhk-apts"
                  onClick={() => handleItemSelect('renders', '2bhk-apts')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all duration-300 shadow-sm cursor-pointer h-[80px] ${
                    activeCategory === 'renders' && activeItem === '2bhk-apts'
                      ? 'bg-[#234D3B] border-[#234D3B] text-white'
                      : 'bg-[#FFFEF7]/40 border-[#BF9861]/20 text-[#302F2C] hover:border-[#BF9861]/60 hover:bg-[#FFFEF7]/80'
                  }`}
                >
                  <span className="text-[10.5px] font-sans font-extrabold uppercase tracking-wide leading-tight">2 BHK</span>
                  <span className="text-[9px] font-sans font-medium tracking-widest leading-none opacity-80">Apartments</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </motion.aside>

      {/* FULL SCREEN LIGHTBOX DIALOG */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[2100] flex items-center justify-center p-6 select-none"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              type="button" 
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all border border-white/10 font-bold"
              onClick={() => setLightboxImage(null)}
            >
              ✕
            </button>
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="max-w-4xl w-full bg-white border border-[#BF9861]/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="md:w-3/5 h-64 md:h-[480px] bg-stone-900 border-b md:border-b-0 md:border-r border-[#BF9861]/25 flex items-center justify-center overflow-hidden">
                {renderImgErr ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center">
                    <p className="font-sans font-semibold text-[#BF9861] bg-[#142d22] border border-[#BF9861]/30 py-3.5 px-6 rounded-xl shadow-md text-sm leading-relaxed max-w-[280px]">
                      Oops! Please reach out to the admin.
                    </p>
                  </div>
                ) : (
                  <img 
                    src={lightboxImage.url} 
                    alt={lightboxImage.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setRenderImgErr(true)}
                  />
                )}
              </div>
              <div className="p-6 md:w-2/5 flex flex-col justify-between bg-white text-[#302F2C]">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans font-bold text-[#BF9861] uppercase tracking-[0.2em]">photorealistic render</span>
                    <h3 className="font-serif text-2xl font-bold leading-tight text-[#234D3B]">{lightboxImage.title}</h3>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans font-light">{lightboxImage.desc}</p>
                </div>
                
                <div className="pt-6 border-t border-[#BF9861]/25 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-stone-500 font-mono">architect</span>
                    <span className="text-[10px] font-sans font-bold text-[#BF9861] uppercase">Vianaar Design Studio</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setLightboxImage(null)}
                    className="px-4 py-2 bg-[#BF9861] hover:bg-[#a67d4a] text-white text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer leading-none"
                  >
                    Close View
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
