/**
 * Data-fetching functions for the CompassCHW API.
 *
 * Plain async functions — no React Query dependency for now.
 * All functions require an authenticated session (tokens in secure storage).
 */

import { api } from './client';
import type { Session, ServiceRequest, EarningsSummary } from '../data/mock';

// ─── Sessions ─────────────────────────────────────────────────────────────────

/**
 * Fetch all sessions visible to the current user.
 */
export async function fetchSessions(): Promise<Session[]> {
  return api<Session[]>('/sessions/');
}

/**
 * Start a session that is currently in the 'scheduled' state.
 */
export async function startSession(id: string): Promise<Session> {
  return api<Session>(`/sessions/${id}/start`, { method: 'PATCH' });
}

/**
 * Mark a session as completed.
 */
export async function completeSession(id: string): Promise<Session> {
  return api<Session>(`/sessions/${id}/complete`, { method: 'PATCH' });
}

// ─── Service Requests ─────────────────────────────────────────────────────────

/**
 * Fetch open service requests available to the current CHW.
 */
export async function fetchRequests(): Promise<ServiceRequest[]> {
  return api<ServiceRequest[]>('/requests/');
}

/**
 * Accept a service request, creating a session assignment.
 */
export async function acceptRequest(id: string): Promise<ServiceRequest> {
  return api<ServiceRequest>(`/requests/${id}/accept`, { method: 'PATCH' });
}

/**
 * Pass on a service request (CHW is not available / not a fit).
 */
export async function passRequest(id: string): Promise<ServiceRequest> {
  return api<ServiceRequest>(`/requests/${id}/pass`, { method: 'PATCH' });
}

// ─── Earnings ─────────────────────────────────────────────────────────────────

/**
 * Fetch the earnings summary for the currently authenticated CHW.
 */
export async function fetchChwEarnings(): Promise<EarningsSummary> {
  return api<EarningsSummary>('/chw/earnings');
}
