import type { RoomType } from '@/types/room';

export const roomTypes: RoomType[] = [
  {
    id: 'deluxe-room',
    name: 'Deluxe Room',
    description: 'Elegant and spacious room with modern amenities',
    longDescription: 'Our Deluxe Rooms offer a perfect blend of comfort and style. Featuring a king-size bed, modern furnishings, and a private balcony with stunning views, these rooms are designed for your ultimate relaxation. The en-suite marble bathroom includes premium toiletries and a rain shower.',
    price: 299,
    size: 35,
    capacity: 2,
    bedType: 'King Size',
    amenities: [
      'Air conditioning',
      'Free WiFi',
      'Flat-screen TV',
      'Minibar',
      'Safe',
      'Coffee maker',
      'Work desk',
      'Hairdryer',
      'Iron & ironing board',
      '24-hour room service'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/648aed3e38418a65e92441d2,en?ap=true&si=false&sm=false&sp=false&sfr=false&sl=false&sop=false'
  },
  {
    id: 'executive-suite',
    name: 'Executive Suite',
    description: 'Luxurious suite with separate living area and premium amenities',
    longDescription: 'The Executive Suite offers a spacious living area separate from the bedroom, perfect for both work and relaxation. Enjoy panoramic city views, a king-size bed with premium linens, and a luxurious marble bathroom with a deep soaking tub and separate rain shower. The suite also features a work desk and a comfortable seating area.',
    price: 499,
    size: 60,
    capacity: 3,
    bedType: 'King Size + Sofa Bed',
    amenities: [
      'Separate living area',
      'Premium bedding',
      'Nespresso machine',
      'Complimentary minibar',
      'Bathrobes & slippers',
      'Premium toiletries',
      'Bathroom TV',
      'Bluetooth speaker',
      'Express check-in/out',
      'Airport transfer service'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/executive-suite-vr-tour'
  },
  {
    id: 'presidential-suite',
    name: 'Presidential Suite',
    description: 'Ultimate luxury with expansive space and premium services',
    longDescription: 'Experience unparalleled luxury in our Presidential Suite, featuring a spacious bedroom, separate living and dining areas, a fully equipped kitchenette, and a lavish marble bathroom with a whirlpool tub. Enjoy exclusive amenities including a personal butler, private check-in, and access to the executive lounge with complimentary food and beverages throughout the day.',
    price: 899,
    size: 120,
    capacity: 4,
    bedType: 'King Size + Queen Sofa Bed',
    amenities: [
      'Separate living and dining areas',
      'Kitchenette',
      'Whirlpool tub',
      'Bose sound system',
      'Personal butler service',
      'Executive lounge access',
      'Complimentary laundry',
      'Premium minibar',
      'In-room massage available',
      'Private check-in/out'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/presidential-suite-vr-tour'
  },
  {
    id: 'family-suite',
    name: 'Family Suite',
    description: 'Spacious accommodation perfect for families',
    longDescription: 'Our Family Suites are designed with families in mind, featuring a master bedroom with a king-size bed and a separate area with twin beds for children. The suite includes a comfortable living space, two bathrooms, and thoughtful amenities for guests of all ages. Enjoy complimentary access to our kids\' club and family-friendly activities.',
    price: 599,
    size: 75,
    capacity: 4,
    bedType: 'King Size + 2 Twin Beds',
    amenities: [
      'Two bathrooms',
      'Kids\' welcome pack',
      'Board games',
      'Baby cot available',
      'Child-friendly toiletries',
      'Bunk beds option',
      'Microwave',
      'Nintendo Switch',
      'Baby sitting service',
      'Kids\' menu'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/family-suite-vr-tour'
  },
  {
    id: 'honeymoon-suite',
    name: 'Honeymoon Suite',
    description: 'Romantic retreat for newlyweds and couples',
    longDescription: 'Celebrate your love in our exquisite Honeymoon Suite, featuring a romantic four-poster bed, a spacious balcony with stunning views, and a luxurious bathroom with a freestanding bathtub. Enjoy special honeymoon amenities including champagne, chocolate-covered strawberries, and a late check-out to make your stay even more memorable.',
    price: 699,
    size: 65,
    capacity: 2,
    bedType: 'King Size Canopy Bed',
    amenities: [
      'Private balcony',
      'Freestanding bathtub',
      'Complimentary champagne',
      'Romantic turndown service',
      'Bath salts & candles',
      'Bathrobes & slippers',
      'Late check-out',
      'Couples massage package',
      'In-room breakfast',
      'Flower arrangement'
    ],
    images: [
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg',
      '/images/rooms/placeholder-room.jpg'
    ],
    vrTourUrl: 'https://webobook.com/public/honeymoon-suite-vr-tour'
  }
];

export default roomTypes;
