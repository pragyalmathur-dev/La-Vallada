/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UnitStatus = 'Available' | 'Reserved' | 'Sold';
export type UnitType = 'Villa' | 'Apartment';

export interface Unit {
  id: string; // e.g., 'V-01', 'A-101'
  name: string;
  type: UnitType;
  beds: number;
  baths: number;
  sqft: number;
  price: string; // Price in INR (Crores/Lakhs)
  status: UnitStatus;
  coordinate: [number, number];
  block?: string;
  floor?: number;
  facing?: string;
  features: string[];
}

export interface FloorPlan {
  id: string;
  title: string;
  type: UnitType;
  beds: number;
  sqft: number;
  description: string;
  specs: { label: string; value: string }[];
}

export interface RenderImage {
  id: string;
  title: string;
  url: string;
  description: string;
  category: 'Exterior' | 'Interior' | 'Lobby' | 'Amenities';
}

export interface OverlayConfig {
  lat: number;
  lng: number;
  scale: number;
  widthScale: number;
  heightScale: number;
  rotation: number;
  opacity: number;
  visible: boolean;
}
