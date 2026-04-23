export const formatPrice = (price: number) => {
  return `৳${price.toLocaleString('en-BD')}`;
};

export const categories = [
  'Hoodies',
  'Pants',
  'Tees',
  'Jackets',
  'Accessories'
];

export const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
export const colors = ['Midnight Black', 'Slate Grey', 'Off-White', 'Crimson Red', 'Deep Blue'];

export const BKASH_NUMBER = "01889010834";

export const SHIPPING_RATES = {
  INSIDE_DHAKA: 80,
  OUTSIDE_DHAKA: 150,
  INTERNATIONAL: 2500
};

export const SHIPPING_REGIONS = [
  { id: 'INSIDE_DHAKA', name: 'Inside Dhaka', rate: SHIPPING_RATES.INSIDE_DHAKA },
  { id: 'OUTSIDE_DHAKA', name: 'Outside Dhaka', rate: SHIPPING_RATES.OUTSIDE_DHAKA },
  { id: 'INTERNATIONAL', name: 'International', rate: SHIPPING_RATES.INTERNATIONAL }
];
