/**
 * Payment Configuration for Golden Tulip
 * 
 * This file contains the payment gateway configuration including Paystack subaccount details
 * for each branch to enable split payments and branch-specific reporting.
 */

import { Branch } from '@/types';

// Base Paystack configuration
export const paystackConfig = {
  publicKey: import.meta.env.VITE_NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  secretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY || '',
  baseUrl: import.meta.env.MODE === 'production' 
    ? 'https://api.paystack.co' 
    : 'https://api.paystack.co', // Use production URL for all environments
  currency: 'NGN',
} as const;

// Branch-specific payment configuration
export interface BranchPaymentConfig {
  type: 'subaccount' | 'main';
  subaccount?: string;
  admin_email: string;
  branch_name: string;
  settlement_bank?: string;
  account_number?: string;
  percentage_charge?: number;
  description?: string;
}

// Map of branch IDs to their payment configurations
export const branchPaymentConfig: Record<string, BranchPaymentConfig> = {
  // Evo Road Branch (Port Harcourt)
  'evo-road': {
    type: 'subaccount',
    subaccount: 'ACCT_qly8r7unbtx4mac',
    admin_email: 'reservations@goldentulipportharcourt.com',
    branch_name: 'GOLDEN TULIP PORT HARCOURT HOTEL',
    percentage_charge: 1.5, // Paystack's default subaccount charge
    description: 'Golden Tulip Port Harcourt - Evo Road'
  },
  
  // Evergreen Branch
  'evergreen': {
    type: 'subaccount',
    subaccount: 'ACCT_4d4hq8ovdox9it1',
    admin_email: 'reservations@rivotelinternational.com',
    branch_name: 'Golden Tulip Evergreen',
    percentage_charge: 1.5,
    description: 'Golden Tulip Evergreen'
  },
  
  // Stadium Road 31 Branch
  'stadium-31': {
    type: 'subaccount',
    subaccount: 'ACCT_b1eqwfqaj224af3',
    admin_email: 'reservationsgt@rivotels.com',
    branch_name: 'Golden Tulip Stadium Road 31',
    percentage_charge: 1.5,
    description: 'Golden Tulip Stadium Road 31'
  },
  
  // Garden City Branch
  'garden-city': {
    type: 'subaccount',
    subaccount: 'ACCT_cu6y2fdkfr9q8s4',
    admin_email: 'fom@rivotels.com',
    branch_name: 'Golden Tulip Garden City',
    percentage_charge: 1.5,
    description: 'Golden Tulip Garden City'
  }
} as const;

// Type-safe branch IDs
export type BranchId = keyof typeof branchPaymentConfig;

/**
 * Get payment configuration for a specific branch
 * @param branchId - The ID of the branch
 * @returns The payment configuration for the branch or null if not found
 */
export function getBranchPaymentConfig(branchId: string): BranchPaymentConfig | null {
  return branchPaymentConfig[branchId as BranchId] || null;
}

/**
 * Get all branch payment configurations
 * @returns Array of branch payment configurations
 */
export function getAllBranchPaymentConfigs(): Array<{ id: string } & BranchPaymentConfig> {
  return Object.entries(branchPaymentConfig).map(([id, config]) => ({
    id,
    ...config
  }));
}

/**
 * Get Paystack payment initialization data with subaccount if applicable
 * @param amount - Amount in kobo
 * @param email - Customer email
 * @param branchId - Branch ID
 * @param metadata - Additional metadata
 * @returns Paystack payment initialization data
 */
export function getPaystackPaymentData(
  amount: number,
  email: string,
  branchId: string,
  metadata: Record<string, any> = {}
) {
  const branchConfig = getBranchPaymentConfig(branchId);
  const paymentData: any = {
    email,
    amount,
    currency: paystackConfig.currency,
    metadata: {
      ...metadata,
      branch_id: branchId,
      branch_name: branchConfig?.branch_name || 'Unknown Branch'
    }
  };

  // Add subaccount if this is a subaccount payment
  if (branchConfig?.type === 'subaccount' && branchConfig.subaccount) {
    paymentData.subaccount = branchConfig.subaccount;
    paymentData.bearer = 'subaccount';
    
    // Add split code if you have a master account split setup
    // paymentData.split_code = 'SPLIT_xxxxxxxx';
  }

  return paymentData;
}

/**
 * Get the admin email for a branch
 * @param branchId - Branch ID
 * @returns Admin email or null if not found
 */
export function getBranchAdminEmail(branchId: string): string | null {
  return branchPaymentConfig[branchId as BranchId]?.admin_email || null;
}

/**
 * Get the branch name by ID
 * @param branchId - Branch ID
 * @returns Branch name or 'Unknown Branch' if not found
 */
export function getBranchName(branchId: string): string {
  return branchPaymentConfig[branchId as BranchId]?.branch_name || 'Unknown Branch';
}
