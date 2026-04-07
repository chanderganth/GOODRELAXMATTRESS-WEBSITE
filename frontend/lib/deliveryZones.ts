// Delivery zone management — stored in localStorage for offline support
// Each zone has a name, list of pincodes, and delivery type

export type DeliveryType = 'door' | 'pickup' | 'unavailable';

export interface DeliveryZone {
  id: string;
  name: string;           // e.g. "Chennai City", "Bangalore Urban"
  pincodes: string[];     // list of pincodes in this zone
  deliveryType: DeliveryType;
  estimatedDays: number;  // estimated delivery days
  note?: string;          // optional note like "Pickup from warehouse"
}

export interface DeliveryCheckResult {
  available: boolean;
  type: DeliveryType;
  zone?: DeliveryZone;
  message: string;
}

const STORAGE_KEY = 'goodrelax_delivery_zones';

// Default zones — admin can add more
const DEFAULT_ZONES: DeliveryZone[] = [
  {
    id: 'zone-1',
    name: 'Chennai City',
    pincodes: ['600001', '600002', '600003', '600004', '600005', '600006', '600007', '600008', '600009', '600010',
      '600011', '600012', '600013', '600014', '600015', '600016', '600017', '600018', '600019', '600020',
      '600021', '600022', '600023', '600024', '600025', '600026', '600027', '600028', '600029', '600030',
      '600031', '600032', '600033', '600034', '600035', '600036', '600037', '600038', '600039', '600040',
      '600041', '600042', '600043', '600044', '600045', '600046', '600047', '600048', '600049', '600050',
      '600051', '600052', '600053', '600054', '600055', '600056', '600057', '600058', '600059', '600060',
      '600061', '600062', '600063', '600064', '600065', '600066', '600067', '600068', '600069', '600070',
      '600071', '600072', '600073', '600074', '600075', '600076', '600077', '600078', '600079', '600080',
      '600081', '600082', '600083', '600084', '600085', '600086', '600087', '600088', '600089', '600090',
      '600091', '600092', '600093', '600094', '600095', '600096', '600097', '600098', '600099', '600100',
      '600101', '600102', '600103', '600104', '600105', '600106', '600107', '600108', '600109', '600110',
      '600111', '600112', '600113', '600114', '600115', '600116', '600117', '600118', '600119', '600120',
      '600122', '600123', '600124', '600125', '600126', '600127', '600128', '600129', '600130'],
    deliveryType: 'door',
    estimatedDays: 5,
  },
  {
    id: 'zone-2',
    name: 'Bangalore Urban',
    pincodes: ['560001', '560002', '560003', '560004', '560005', '560006', '560007', '560008', '560009', '560010',
      '560011', '560012', '560013', '560014', '560015', '560016', '560017', '560018', '560019', '560020',
      '560021', '560022', '560023', '560024', '560025', '560026', '560027', '560028', '560029', '560030',
      '560031', '560032', '560033', '560034', '560035', '560036', '560037', '560038', '560039', '560040',
      '560041', '560042', '560043', '560044', '560045', '560046', '560047', '560048', '560049', '560050',
      '560051', '560052', '560053', '560054', '560055', '560056', '560057', '560058', '560059', '560060',
      '560061', '560062', '560063', '560064', '560065', '560066', '560067', '560068', '560069', '560070',
      '560071', '560072', '560073', '560074', '560075', '560076', '560077', '560078', '560079', '560080',
      '560081', '560082', '560083', '560084', '560085', '560086', '560087', '560088', '560089', '560090',
      '560091', '560092', '560093', '560094', '560095', '560096', '560097', '560098', '560099', '560100'],
    deliveryType: 'door',
    estimatedDays: 7,
  },
  {
    id: 'zone-3',
    name: 'Hyderabad',
    pincodes: ['500001', '500002', '500003', '500004', '500005', '500006', '500007', '500008', '500009', '500010',
      '500011', '500012', '500013', '500014', '500015', '500016', '500017', '500018', '500019', '500020',
      '500021', '500022', '500023', '500024', '500025', '500026', '500027', '500028', '500029', '500030',
      '500031', '500032', '500033', '500034', '500035', '500036', '500037', '500038', '500039', '500040',
      '500041', '500042', '500043', '500044', '500045', '500046', '500047', '500048', '500049', '500050',
      '500051', '500052', '500053', '500054', '500055', '500056', '500057', '500058', '500059', '500060',
      '500061', '500062', '500063', '500064', '500065', '500066', '500067', '500068', '500069', '500070',
      '500071', '500072', '500073', '500074', '500075', '500076', '500077', '500078', '500079', '500080',
      '500081', '500082', '500083', '500084', '500085', '500086', '500087', '500088', '500089', '500090'],
    deliveryType: 'door',
    estimatedDays: 7,
  },
  {
    id: 'zone-4',
    name: 'Tamil Nadu (Other)',
    pincodes: [], // admin will add specific pincodes
    deliveryType: 'pickup',
    estimatedDays: 10,
    note: 'Pickup from nearest distribution point',
  },
];

export function getDeliveryZones(): DeliveryZone[] {
  if (typeof window === 'undefined') return DEFAULT_ZONES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return DEFAULT_ZONES;
}

export function saveDeliveryZones(zones: DeliveryZone[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
}

export function checkDelivery(pincode: string): DeliveryCheckResult {
  const trimmed = pincode.trim();
  if (!trimmed || trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
    return { available: false, type: 'unavailable', message: 'Please enter a valid 6-digit pincode' };
  }

  const zones = getDeliveryZones();

  for (const zone of zones) {
    if (zone.pincodes.includes(trimmed)) {
      if (zone.deliveryType === 'door') {
        return {
          available: true,
          type: 'door',
          zone,
          message: `Door delivery available in ${zone.name}! Estimated ${zone.estimatedDays} days.`,
        };
      }
      if (zone.deliveryType === 'pickup') {
        return {
          available: true,
          type: 'pickup',
          zone,
          message: `Pickup available in ${zone.name}. ${zone.note || `Estimated ${zone.estimatedDays} days.`}`,
        };
      }
    }
  }

  return {
    available: false,
    type: 'unavailable',
    message: 'Sorry, door delivery is not available at this pincode yet. Please contact us for alternative options.',
  };
}
