/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sliders, ShieldCheck } from 'lucide-react';
import { Unit } from '../types';

interface SidebarProps {
  isOpen: boolean;
  units: Unit[];
  selectedUnit: Unit | null;
  setSelectedUnit: (unit: Unit | null) => void;
  onFlyToUnit: (unit: Unit) => void;
}

export default function Sidebar({
  isOpen,
  units,
  selectedUnit,
  setSelectedUnit,
  onFlyToUnit
}: SidebarProps) {
  // Suppress warnings for unused props but keep them in signature to prevent breakage in App.tsx
  const _unused = { units, selectedUnit, setSelectedUnit, onFlyToUnit };

  return (
    <motion.aside
      id="sidebar"
      initial={{ width: 0, opacity: 0 }}
      animate={isOpen ? { width: 380, opacity: 1 } : { width: 0, opacity: 0 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-full bg-[#234D3B] border-r border-[#257057] flex flex-col z-[1000] relative text-[#FFFEF7] select-none overflow-hidden shrink-0"
    >
      <div className="w-[380px] h-full flex flex-col">
        {/* ─── BRAND HEADER ─── */}
        <div className="p-8 pt-10 border-[#257057]/40 bg-[#234D3B] flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-[6px] text-[#BF9861] uppercase block font-sans">
                VIANAAR
              </span>
              <h1 className="font-serif text-3xl font-bold text-[#FFFEF7] tracking-wide leading-none pb-0.5">
                La Vallada
              </h1>
              <p className="text-[10px] font-medium tracking-[2.5px] text-[#E3D5C9] uppercase pt-0.5">
                Verla Canca, North Goa
              </p>
            </div>
          </div>
        </div>

        {/* ─── BLANK SOLID CONTENT BODY (REST OF SIDEBAR) ─── */}
        <div className="flex-1 bg-[#234D3B]">
          {/* Entirely blank as requested */}
        </div>
      </div>
    </motion.aside>
  );
}
