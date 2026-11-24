import { Role } from '../types';

export const ROUTE_PERMISSION_MAP: Record<string, string[]> = {
  '/dashboard': ['dashboard'],
  '/sellers': ['sellers'],
  '/buyers': ['buyers'],
  '/products': ['products'],
  '/offline': ['auction', 'manual_auctions'],
  '/offline/live': ['auction', 'manual_auctions'],
  '/online': ['auction', 'auctions_sale'],
  '/reports': ['reports'],
  '/ledger': ['reports'],
  '/profile': ['profile', 'always'],
  '/workforce/employee-details': ['workforce'],
  '/workforce/attendance': ['workforce'],
  '/workforce/advances': ['workforce'],
  '/workforce/salary-payroll': ['workforce'],
};

export const ROLE_DEFAULT_PERMISSIONS: Record<Role, string[]> = {
  Manager: [
    'dashboard',
    'sellers',
    'buyers',
    'products',
    'auction',
    'reports',
    'workforce',
  ],
  Supervisor: [
    'dashboard',
    'sellers',
    'buyers',
    'products',
    'auction',
    'reports',
    'workforce',
  ],
  Auctioneer: [
    'dashboard',
    'sellers',
    'products',
    'auction',
  ],
  Accountant: [
    'dashboard',
    'sellers',
    'buyers',
    'reports',
    'workforce',
  ],
  'Quality Checker': [
    'dashboard',
    'products',
  ],
  Worker: [
    'dashboard',
    'products',
  ],
};

export function canAccessRoute(routePath: string, userPermissions: string[]): boolean {
  const requiredPermissions = ROUTE_PERMISSION_MAP[routePath];
  if (!requiredPermissions || requiredPermissions.includes('always')) {
    return true;
  }
  return requiredPermissions.some(perm => userPermissions.includes(perm));
}
