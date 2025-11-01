// Base document interface that all Firestore documents should extend
export interface BaseDocument {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User related types
export interface User extends BaseDocument {
  uid?: string;
  email: string;
  displayName?: string;
  name?: string;
  photoURL?: string;
  phoneNumber?: string;
  role?: 'admin' | 'staff' | 'user';
  isActive?: boolean;
  lastLogin?: Date;
  lastSignInAt?: string;
  isAdmin?: boolean;
  bookingIds?: string[];
  updatedAt?: string | Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Room related types
export interface Room extends BaseDocument {
  name: string;
  description: string;
  type: RoomType;
  pricePerNight: number;
  capacity: number;
  size: number; // in square meters
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  branchId: string;
  roomNumber: string;
  roomCount?: number; // Number of rooms of this type
}

export type RoomType = 'standard' | 'deluxe' | 'suite' | 'family' | 'executive';

// Booking related types
export interface Booking extends BaseDocument {
  userId: string;
  roomId: string;
  branchId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialRequests?: string;
  cancellationDate?: Date;
  cancellationReason?: string;
  refundAmount?: number;
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked-in' 
  | 'checked-out' 
  | 'cancelled' 
  | 'no-show';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'partially_paid' 
  | 'refunded' 
  | 'cancelled' 
  | 'failed';

export type ClientStatus = 'active' | 'inactive' | 'suspended';

// Branch related types
export interface Branch extends BaseDocument {
  name: string;
  address: string;
  city: string;
  country: string;
  phoneNumber: string;
  email: string;
  description: string;
  amenities: string[];
  images: string[];
  location: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
}

// Payment related types
export interface Payment extends BaseDocument {
  bookingId: string;
  branchId?: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  receiptUrl?: string;
  notes?: string;
  guestName?: string;
  customerEmail?: string;
  currency?: string;
  date?: string;
  method?: string;
  channel?: string;
  paystackTransactionId?: string;
  fees?: number;
  gatewayResponse?: string;
}

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'paypal' 
  | 'bank_transfer' 
  | 'cash' 
  | 'other';

// Review related types
export interface Review extends BaseDocument {
  userId: string;
  roomId: string;
  branchId: string;
  bookingId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  isApproved: boolean;
  response?: {
    comment: string;
    respondedAt: Date;
    responderId: string;
  };
}

// Promotion related types
export interface Promotion extends BaseDocument {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minStay?: number;
  minAmount?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  maxUses?: number;
  usedCount: number;
  applicableRoomTypes?: RoomType[];
  applicableBranches?: string[];
}

// Loyalty program types
export interface LoyaltyTier {
  name: string;
  pointsRequired: number;
  benefits: string[];
  discountPercentage: number;
  priorityCheckIn: boolean;
  lateCheckout: boolean;
  roomUpgrade: boolean;
  welcomeGift: boolean;
}

// Settings type
export interface AppSettings extends BaseDocument {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  emailSender: string;
  smsSender?: string;
  defaultPagination: number;
  bookingWindowDays: number;
  cancellationPolicyDays: number;
  freeCancellationHours: number;
  taxRate: number;
  serviceChargeRate: number;
  allowOnlineCheckIn: boolean;
  allowOnlineCheckOut: boolean;
  allowOnlineCancellation: boolean;
  allowOnlineModification: boolean;
  requireIdVerification: boolean;
  requireCreditCardGuarantee: boolean;
  requireDeposit: boolean;
  depositAmount?: number;
  depositType?: 'fixed' | 'percentage' | 'nightly_rate';
  allowSpecialRequests: boolean;
  allowExtraBeds: boolean;
  extraBedCharge: number;
  allowLateCheckout: boolean;
  lateCheckoutFee: number;
  allowEarlyCheckin: boolean;
  earlyCheckinFee: number;
  allowPets: boolean;
  petFee?: number;
  allowSmoking: boolean;
  allowEvents: boolean;
  allowParking: boolean;
  parkingFee?: number;
  allowShuttleService: boolean;
  shuttleFee?: number;
  allowAirportTransfer: boolean;
  airportTransferFee?: number;
  allowLaundryService: boolean;
  allowRoomService: boolean;
  allowSpaService: boolean;
  allowGymAccess: boolean;
  allowPoolAccess: boolean;
  allowBusinessCenterAccess: boolean;
  allowRestaurantAccess: boolean;
  allowBarAccess: boolean;
  allowLoungeAccess: boolean;
  allowConciergeService: boolean;
  allowValetParking: boolean;
  allowBabysittingService: boolean;
  allowTours: boolean;
  allowCarRental: boolean;
  allowBikeRental: boolean;
  allowSkiStorage: boolean;
  allowLuggageStorage: boolean;
  allowCurrencyExchange: boolean;
  allowAtm: boolean;
  allowGiftShop: boolean;
  allowVendingMachines: boolean;
  allowElevator: boolean;
  allowWheelchairAccess: boolean;
  allowHearingAccessibility: boolean;
  allowVisualAccessibility: boolean;
  allowMobilityAccessibility: boolean;
  allowServiceAnimals: boolean;
  allowConnectingRooms: boolean;
  allowAdjoiningRooms: boolean;
  allowExtraBedsInRoom: boolean;
  allowCribs: boolean;
  allowRollawayBeds: boolean;
  allowHighChairs: boolean;
  allowBabyCots: boolean;
  allowStrollers: boolean;
  allowBabySitting: boolean;
  allowKidsClub: boolean;
  allowKidsPool: boolean;
  allowKidsMenu: boolean;
  allowKidsActivities: boolean;
  allowKidsStayFree: boolean;
  maxKidsStayFreeAge: number;
  maxKidsStayFreeCount: number;
  maxKidsStayFreeBreakfast: boolean;
  allowKidsEatFree: boolean;
  maxKidsEatFreeAge: number;
  maxKidsEatFreeCount: number;
  allowSeniorDiscount: boolean;
  seniorDiscountAge: number;
  seniorDiscountPercentage: number;
  allowMilitaryDiscount: boolean;
  militaryDiscountPercentage: number;
  allowAaaDiscount: boolean;
  aaaDiscountPercentage: number;
  allowCorporateDiscount: boolean;
  corporateDiscountPercentage: number;
  allowGovernmentDiscount: boolean;
  governmentDiscountPercentage: number;
  allowGroupDiscount: boolean;
  groupDiscountPercentage: number;
  minGroupSize: number;
  allowLongStayDiscount: boolean;
  longStayDiscountNights: number;
  longStayDiscountPercentage: number;
  allowEarlyBirdDiscount: boolean;
  earlyBirdDiscountDays: number;
  earlyBirdDiscountPercentage: number;
  allowLastMinuteDiscount: boolean;
  lastMinuteDiscountDays: number;
  lastMinuteDiscountPercentage: number;
  allowNonRefundableDiscount: boolean;
  nonRefundableDiscountPercentage: number;
  allowPrepaymentDiscount: boolean;
  prepaymentDiscountPercentage: number;
  allowMembershipDiscount: boolean;
  membershipDiscountPercentage: number;
  allowLoyaltyProgram: boolean;
  loyaltyPointsPerDollar: number;
  loyaltyPointsForFreeNight: number;
  loyaltyTiers: LoyaltyTier[];
  allowReferralProgram: boolean;
  referralBonusPoints: number;
  allowBirthdayReward: boolean;
  birthdayRewardPoints: number;
  allowAnniversaryReward: boolean;
  anniversaryRewardPoints: number;
  allowWelcomeReward: boolean;
  welcomeRewardPoints: number;
  allowReviewReward: boolean;
  reviewRewardPoints: number;
  allowSocialMediaReward: boolean;
  socialMediaRewardPoints: number;
  allowCheckInReward: boolean;
  checkInRewardPoints: number;
  allowCheckOutReward: boolean;
  checkOutRewardPoints: number;
  allowReferralReward: boolean;
  referralRewardPoints: number;
}
