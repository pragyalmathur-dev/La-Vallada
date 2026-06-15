/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Unit, FloorPlan, RenderImage } from './types';

export const UNITS: Unit[] = [
  // Luxury Villas (Cluster A)
  {
    id: 'V-01',
    name: 'Villa Royale 01',
    type: 'Villa',
    beds: 4,
    baths: 5,
    sqft: 4200,
    price: '₹7.50 Cr',
    status: 'Available',
    coordinate: [15.59020, 73.78490],
    block: 'Villa Cluster A',
    facing: 'North-East',
    features: ['Private Pool', 'Double Height Living Room', 'Teak Wood Deck', 'Servant Quarter', 'Home Automation']
  },
  {
    id: 'V-02',
    name: 'Villa Royale 02',
    type: 'Villa',
    beds: 4,
    baths: 5,
    sqft: 4200,
    price: '₹7.55 Cr',
    status: 'Reserved',
    coordinate: [15.59025, 73.78520],
    block: 'Villa Cluster A',
    facing: 'North-East',
    features: ['Private Pool', 'Double Height Living Room', 'Lush Forest View', 'Double Garage']
  },
  {
    id: 'V-03',
    name: 'Villa Royale 03',
    type: 'Villa',
    beds: 4,
    baths: 5,
    sqft: 4500,
    price: '₹8.10 Cr',
    status: 'Sold',
    coordinate: [15.59015, 73.78550],
    block: 'Villa Cluster A',
    facing: 'East',
    features: ['Plunge Pool', 'Barbecue Lounge', 'Roof Observatory', 'Modular Kitchen']
  },
  {
    id: 'V-04',
    name: 'Villa Serene 04',
    type: 'Villa',
    beds: 3,
    baths: 4,
    sqft: 3500,
    price: '₹6.20 Cr',
    status: 'Available',
    coordinate: [15.58990, 73.78480],
    block: 'Villa Cluster B',
    facing: 'West',
    features: ['Private Plunge Pool', 'Teak Wood Gazebo', 'Outdoor Shower', 'Solar Back-up']
  },
  {
    id: 'V-05',
    name: 'Villa Serene 05',
    type: 'Villa',
    beds: 3,
    baths: 4,
    sqft: 3500,
    price: '₹6.25 Cr',
    status: 'Available',
    coordinate: [15.58980, 73.78510],
    block: 'Villa Cluster B',
    facing: 'West',
    features: ['Private Plunge Pool', 'Beautiful Lawn Garden', 'Walk-in Closet', 'Home Assistant']
  },
  {
    id: 'V-06',
    name: 'Villa Serene 06',
    type: 'Villa',
    beds: 3,
    baths: 4,
    sqft: 3650,
    price: '₹6.45 Cr',
    status: 'Sold',
    coordinate: [15.58970, 73.78540],
    block: 'Villa Cluster B',
    facing: 'North',
    features: ['Plunge Pool', 'Sunk-in Courtyard', 'Zen Garden', 'Italian Marble Flooring']
  },
  {
    id: 'V-07',
    name: 'Villa Crest 07',
    type: 'Villa',
    beds: 5,
    baths: 6,
    sqft: 5200,
    price: '₹9.40 Cr',
    status: 'Reserved',
    coordinate: [15.58940, 73.78470],
    block: 'Villa Cluster C',
    facing: 'South-East',
    features: ['Infinity Plunge Pool', 'Gym Space', '100% Home Automation', 'Prive Lift', 'Scenic Hill Backdrop']
  },
  {
    id: 'V-08',
    name: 'Villa Crest 08',
    type: 'Villa',
    beds: 5,
    baths: 6,
    sqft: 5350,
    price: '₹9.75 Cr',
    status: 'Available',
    coordinate: [15.58930, 73.78500],
    block: 'Villa Cluster C',
    facing: 'South',
    features: ['Infinity Plunge Pool', 'Wrap-around Verandah', 'Bar Counter', 'Double Height Ceilings']
  },

  // Premium Apartments
  {
    id: 'A-101',
    name: 'Suite Residence 101',
    type: 'Apartment',
    beds: 2,
    baths: 2,
    sqft: 1450,
    price: '₹2.30 Cr',
    status: 'Available',
    coordinate: [15.58860, 73.78650],
    block: 'Block A',
    floor: 1,
    facing: 'East',
    features: ['Spacious Balcony', 'Forest-facing Views', 'Premium Fittings', 'Utility Deck']
  },
  {
    id: 'A-102',
    name: 'Suite Residence 102',
    type: 'Apartment',
    beds: 2,
    baths: 2,
    sqft: 1450,
    price: '₹2.32 Cr',
    status: 'Sold',
    coordinate: [15.58880, 73.78680],
    block: 'Block A',
    floor: 1,
    facing: 'North',
    features: ['Spacious Balcony', 'Forest-facing Views', 'Fitted Wardrobes']
  },
  {
    id: 'A-201',
    name: 'Penthouse Heights 201',
    type: 'Apartment',
    beds: 3,
    baths: 3.5,
    sqft: 2100,
    price: '₹3.65 Cr',
    status: 'Available',
    coordinate: [15.58900, 73.78620],
    block: 'Block A',
    floor: 2,
    facing: 'North-East',
    features: ['Double Balcony', 'Outdoor Jacuzzi', 'Bar Area', 'Sky views']
  },
  {
    id: 'A-202',
    name: 'Penthouse Heights 202',
    type: 'Apartment',
    beds: 3,
    baths: 3.5,
    sqft: 2100,
    price: '₹3.70 Cr',
    status: 'Reserved',
    coordinate: [15.58870, 73.78600],
    block: 'Block A',
    floor: 2,
    facing: 'East',
    features: ['Double Balcony', 'Outdoor Jacuzzi', 'Open Plan Chef Kitchen']
  },
  {
    id: 'A-301',
    name: 'Vista Panorama 301',
    type: 'Apartment',
    beds: 3,
    baths: 4,
    sqft: 2450,
    price: '₹4.20 Cr',
    status: 'Available',
    coordinate: [15.58850, 73.78570],
    block: 'Block B',
    floor: 3,
    facing: 'East',
    features: ['Private Terrace Deck', 'Sky Lounge Access', 'Double Car Parking', 'Walk-in Closets']
  },
  {
    id: 'A-302',
    name: 'Vista Panorama 302',
    type: 'Apartment',
    beds: 2,
    baths: 2,
    sqft: 1600,
    price: '₹2.65 Cr',
    status: 'Sold',
    coordinate: [15.58830, 73.78590],
    block: 'Block B',
    floor: 3,
    facing: 'West',
    features: ['Pool-facing Balcony', 'High Ceilings', 'Designer Lightings']
  }
];

export const FLOOR_PLANS: FloorPlan[] = [
  {
    id: 'fp-villa-4bhk',
    title: '4 BHK Luxury Villa Royale',
    type: 'Villa',
    beds: 4,
    sqft: 4200,
    description: 'Designed across two masterfully structured levels, the Villa Royale incorporates dual-height lounges, a bespoke plunge pool with solid wooden decks, and private landscaped green spaces.',
    specs: [
      { label: 'Ground Floor Area', value: '2,200 Sq.Ft.' },
      { label: 'First Floor Area', value: '2,000 Sq.Ft.' },
      { label: 'Plunge Pool Dimensions', value: '6m x 3.5m' },
      { label: 'Total Green Deck', value: '850 Sq.Ft.' }
    ]
  },
  {
    id: 'fp-villa-3bhk',
    title: '3 BHK Villa Serene',
    type: 'Villa',
    beds: 3,
    sqft: 3500,
    description: 'An elegant layout prioritizing seamless indoor-outdoor linkages. High sliding glass doors, a modern kitchen, comfortable ensuite bedrooms, and a secluded private deck define this tranquil residence.',
    specs: [
      { label: 'Ground Floor Area', value: '1,850 Sq.Ft.' },
      { label: 'First Floor Area', value: '1,650 Sq.Ft.' },
      { label: 'Lawn Area', value: '550 Sq.Ft.' },
      { label: 'Double HeadroomHeight', value: '18 Feet' }
    ]
  },
  {
    id: 'fp-apt-3bhk',
    title: '3 BHK Penthouse Heights',
    type: 'Apartment',
    beds: 3,
    sqft: 2100,
    description: 'Breathtaking top-floor living with a wrap-around verandah, high-tech specifications and automated HVAC. Boasts masterfully crafted bathrooms and panoramic views of Verla Canca hills.',
    specs: [
      { label: 'Carpet Area', value: '1,820 Sq.Ft.' },
      { label: 'Terrace Balcony', value: '280 Sq.Ft.' },
      { label: 'Ceiling Height', value: '11 Feet' },
      { label: 'Dedicated Parking', value: '2 Car Bays' }
    ]
  },
  {
    id: 'fp-apt-2bhk',
    title: '2 BHK Suite Residence',
    type: 'Apartment',
    beds: 2,
    sqft: 1450,
    description: 'Extravagant suite residences featuring broad linear balconies, optimized space arrangements, modular wardrobes, and floor-to-ceiling glass to bring in beautiful native Goan sunlight.',
    specs: [
      { label: 'Carpet Area', value: '1,250 Sq.Ft.' },
      { label: 'Balcony Space', value: '200 Sq.Ft.' },
      { label: 'Orientation', value: 'North-East' },
      { label: 'Dedicated Parking', value: '1 Car Bay' }
    ]
  }
];

export const RENDERS: RenderImage[] = [
  {
    id: 'render-ext-1',
    title: 'Teak & Plaster Exterior Harmony',
    url: '/assets/renders/exterior.jpg',
    description: 'High-contrast white concrete framed by vertical tropical teak louvers. Highlights our modern layout, private pool deck, and elegant negative lines under sunset golden hour lights.',
    category: 'Exterior'
  },
  {
    id: 'render-int-1',
    title: 'Villas Sun-lit Great Room',
    url: '/assets/renders/interior.jpg',
    description: 'Vistas of double-height glazing merging into the pool lawns. Features custom-curated Italian marble, neutral linen furnishings, and custom brass fixtures.',
    category: 'Interior'
  },
  {
    id: 'render-ext-2',
    title: 'Modern Tropical Landscape Elevation',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    description: 'Aerial view of the lush Goan hillside flanking the pristine modern estates of La Vallada, emphasizing privacy and native tropical landscaping.',
    category: 'Exterior'
  },
  {
    id: 'render-int-2',
    title: 'Master Suite Sanctuary',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1250&q=80',
    description: 'En-suite bedroom layout styled with soft warm lighting, exposed concrete panels, and bespoke hand-crafted teakwood king bed overlooking green balconies.',
    category: 'Interior'
  }
];

export interface NearbyLocation {
  id: string;
  name: string;
  category: 'Transport' | 'Beach' | 'Market' | 'Healthcare' | 'F&B';
  distance: string;
  coordinate: [number, number];
  emoji: string;
}

export const NEARBY_LOCATIONS: NearbyLocation[] = [
  {
    id: 'nb-airport-mopa',
    name: 'Mopa International Airport',
    category: 'Transport',
    distance: '35 mins (28 km)',
    coordinate: [15.71220, 73.91400],
    emoji: '✈️'
  },
  {
    id: 'nb-railway-thivim',
    name: 'Thivim Railway Station',
    category: 'Transport',
    distance: '15 mins (11 km)',
    coordinate: [15.61940, 73.87320],
    emoji: '🚉'
  },
  {
    id: 'nb-beach-anjuna',
    name: 'Anjuna Beach & Clubs',
    category: 'Beach',
    distance: '14 mins (9.5 km)',
    coordinate: [15.59400, 73.74100],
    emoji: '🏖️'
  },
  {
    id: 'nb-beach-vagator',
    name: 'Vagator Beach & Chapora Fort',
    category: 'Beach',
    distance: '15 mins (10.2 km)',
    coordinate: [15.62600, 73.73300],
    emoji: '🏰'
  },
  {
    id: 'nb-beach-calangute',
    name: 'Calangute / Baga Strip',
    category: 'Beach',
    distance: '18 mins (11.5 km)',
    coordinate: [15.54400, 73.75500],
    emoji: '🌊'
  },
  {
    id: 'nb-market-mapusa',
    name: 'Mapusa City Center & Market',
    category: 'Market',
    distance: '6 mins (3.2 km)',
    coordinate: [15.59100, 73.81150],
    emoji: '🛒'
  },
  {
    id: 'nb-hospital-asilo',
    name: 'District Hospital (Asilo)',
    category: 'Healthcare',
    distance: '8 mins (4.5 km)',
    coordinate: [15.60200, 73.81400],
    emoji: '🏥'
  },
  {
    id: 'nb-fb-gunpowder',
    name: 'Gunpowder Restaurant (Assagao)',
    category: 'F&B',
    distance: '8 mins (4.8 km)',
    coordinate: [15.59750, 73.77120],
    emoji: '🍽️'
  },
  {
    id: 'nb-fb-thallasa',
    name: 'Thalassa Greek Restaurant',
    category: 'F&B',
    distance: '16 mins (11 km)',
    coordinate: [15.61100, 73.72900],
    emoji: '🍹'
  }
];
