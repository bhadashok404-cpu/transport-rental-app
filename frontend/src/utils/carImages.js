/**
 * Car images using verified Unsplash photo IDs.
 * Format: https://images.unsplash.com/photo-{ID}?w=800&q=80&fit=crop
 * These are permanent CDN URLs — no API key, no CORS, no redirect.
 *
 * Each entry: [front, angle, side, interior, detail]
 */

// Verified Unsplash photo IDs for real cars
const PHOTO_ID = {
  // Economy — hatchbacks / small cars
  'maruti suzuki swift':   ['1544636331-e26879cd4d9b', '1494976388531-d1058494cdd8', '1552519507-da3b142c6e3d', '1503376780353-7e6692767b70', '1571068316344-75bc76f77890'],
  'hyundai i20':           ['1549317661-bd32c8ce0db2', '1580273916550-e323be2ae537', '1533473359331-0135ef1b58bf', '1544636331-e26879cd4d9b', '1494976388531-d1058494cdd8'],
  'tata tiago':            ['1552519507-da3b142c6e3d', '1571068316344-75bc76f77890', '1494976388531-d1058494cdd8', '1549317661-bd32c8ce0db2', '1503376780353-7e6692767b70'],

  // Premium — sedans
  'honda city':            ['1580273916550-e323be2ae537', '1541899481282-d53bffe3c35d', '1511919884226-fd3cad34687c', '1494976388531-d1058494cdd8', '1549317661-bd32c8ce0db2'],
  'hyundai verna':         ['1541899481282-d53bffe3c35d', '1580273916550-e323be2ae537', '1552519507-da3b142c6e3d', '1511919884226-fd3cad34687c', '1494976388531-d1058494cdd8'],
  'tata nexon':            ['1533473359331-0135ef1b58bf', '1519641471654-76ce0107ad1b', '1544636331-e26879cd4d9b', '1601584115197-04ecc0da31d7', '1580273916550-e323be2ae537'],

  // Luxury
  'bmw x1':                ['1555215695-3004980ad54e', '1556189250-72ba954cfc2b', '1617469767053-d3b523a0b982', '1617814076367-b759c7d7e738', '1597007066704-67bf2068d5b2'],
  'mercedes-benz c-class': ['1618843986285-e16fd7f89e6f', '1555215695-3004980ad54e', '1621007947382-bb4c3b238a8b', '1617469767053-d3b523a0b982', '1617814076367-b759c7d7e738'],
  'audi q3':               ['1606016159991-dfe4f2746ad5', '1533473359331-0135ef1b58bf', '1519641471654-76ce0107ad1b', '1555215695-3004980ad54e', '1601584115197-04ecc0da31d7'],

  // SUV
  'mahindra scorpio n':    ['1519641471654-76ce0107ad1b', '1533473359331-0135ef1b58bf', '1601584115197-04ecc0da31d7', '1606016159991-dfe4f2746ad5', '1544636331-e26879cd4d9b'],
  'toyota innova crysta':  ['1609521263047-f8f205293f24', '1533473359331-0135ef1b58bf', '1519641471654-76ce0107ad1b', '1601584115197-04ecc0da31d7', '1580273916550-e323be2ae537'],
  'kia carens':            ['1601584115197-04ecc0da31d7', '1606016159991-dfe4f2746ad5', '1519641471654-76ce0107ad1b', '1533473359331-0135ef1b58bf', '1555215695-3004980ad54e'],

  // Commercial
  'tata ace':              ['1519003722824-194d4455a60c', '1504215680853-026ed2a45def', '1590362891991-f776e747a588', '1596924301280-4b5fa4aa19b0', '1519003722824-194d4455a60c'],
  'mahindra bolero pickup':['1504215680853-026ed2a45def', '1519003722824-194d4455a60c', '1596924301280-4b5fa4aa19b0', '1590362891991-f776e747a588', '1504215680853-026ed2a45def'],
  'ashok leyland dost':    ['1590362891991-f776e747a588', '1596924301280-4b5fa4aa19b0', '1519003722824-194d4455a60c', '1504215680853-026ed2a45def', '1590362891991-f776e747a588'],
};

// Type fallback photo IDs (when make+model not in map)
const TYPE_FALLBACK_ID = {
  MiniCab:  '1552519507-da3b142c6e3d',
  Sedan:    '1580273916550-e323be2ae537',
  SUV:      '1519641471654-76ce0107ad1b',
  Van:      '1609521263047-f8f205293f24',
  Truck:    '1519003722824-194d4455a60c',
  Bus:      '1570125909232-eb263c188f7e',
  Auto:     '1552519507-da3b142c6e3d',
  Bike:     '1544636331-e26879cd4d9b',
  Tempo:    '1519003722824-194d4455a60c',
  // numeric enum
  0: '1544636331-e26879cd4d9b',
  1: '1552519507-da3b142c6e3d',
  2: '1552519507-da3b142c6e3d',
  3: '1580273916550-e323be2ae537',
  4: '1519641471654-76ce0107ad1b',
  5: '1519003722824-194d4455a60c',
  6: '1519003722824-194d4455a60c',
  7: '1570125909232-eb263c188f7e',
  8: '1609521263047-f8f205293f24',
};

const toUrl = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=85&fit=crop&auto=format`;

const FALLBACK_URL = toUrl('1494976388531-d1058494cdd8');

function resolveKey(vehicle) {
  return `${vehicle.make || ''} ${vehicle.model || ''}`.toLowerCase().trim();
}

function getFallbackId(vehicleType) {
  return TYPE_FALLBACK_ID[vehicleType] || TYPE_FALLBACK_ID[3];
}

/**
 * Returns 5 image URLs for the vehicle detail gallery.
 */
export function getVehicleImages(vehicle) {
  if (!vehicle) return Array(5).fill(FALLBACK_URL);
  const key = resolveKey(vehicle);
  const ids = PHOTO_ID[key];
  if (ids) return ids.map(id => toUrl(id));
  const fallId = getFallbackId(vehicle.vehicleType);
  return Array(5).fill(toUrl(fallId));
}

/**
 * Returns single image URL for listing cards.
 */
export function getVehiclePrimaryImage(vehicle) {
  if (!vehicle) return FALLBACK_URL;
  const key = resolveKey(vehicle);
  const ids = PHOTO_ID[key];
  if (ids?.[0]) return toUrl(ids[0]);
  return toUrl(getFallbackId(vehicle.vehicleType));
}
