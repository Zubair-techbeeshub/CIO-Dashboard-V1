import { getAuth } from 'firebase/auth';
import { getDashboardSummary } from '../data/summaries';

import React from 'react';

export interface SectionSummary {
  title: string;
  content: React.ReactNode;
  rawText?: string;
  aiGenerated?: boolean;
}

export interface SummarySection {
  id: string;
  title: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * AI Summary Service
 * 
 * Calls the backend /api/ai/generate endpoint.
 * The backend uses OpenAI API securely (API key stays on server).
 */

export async function generateSummary(sectionId: string, sectionData?: any): Promise<SectionSummary> {
  const startTime = Date.now();
  
  console.log('[Summary] Generating summary for section:', sectionId);
  console.log('[Summary] API Base URL:', API_BASE_URL);
  
  try {
    const summary = await callBackendForSummary(sectionId, sectionData);
    console.log('[Summary] Backend summary received:', summary.aiGenerated ? 'AI' : 'Fallback');
    return summary;
  } catch (error) {
    console.warn('[Summary] AI summary failed, using fallback:', error);
    return getFallbackSummary(sectionId);
  }
  
  // Ensure minimum loading time for better UX
  const elapsed = Date.now() - startTime;
  if (elapsed < 600) {
    await new Promise(resolve => setTimeout(resolve, 600 - elapsed));
  }
}

async function callBackendForSummary(sectionId: string, sectionData?: any): Promise<SectionSummary> {
  const url = `${API_BASE_URL}/api/ai/generate`;
  const tenantId = import.meta.env.VITE_TENANT_ID || 'american_logics';
  
  // Get Firebase token
  let token: string | null = null;
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      token = await currentUser.getIdToken();
    }
  } catch (error) {
    console.log('Could not get Firebase token:', error);
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': tenantId,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log('[Summary] Calling backend:', url);
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      section: sectionId,
      title: getSectionTitle(sectionId),
      data: sectionData || {}
    })
  });
  
  console.log('[Summary] Backend response status:', response.status);
  
  if (!response.ok) {
    throw new Error(`Summary API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Summary generation failed');
  }
  
  const html = data.content || '';
  
  return {
    title: getSectionTitle(sectionId),
    content: <div className="summary-content" dangerouslySetInnerHTML={{ __html: html }} />,
    rawText: html,
    aiGenerated: data.ai_generated
  };
}

function getFallbackSummary(sectionId: string): SectionSummary {
  return getDashboardSummary(sectionId);
}

export function getSectionTitle(sectionId: string): string {
  const titles: Record<string, string> = {
    executive: 'Executive Summary',
    portfolio: 'Portfolio Summary',
    cockpit: 'Portfolio Cockpit',
    operations: 'Program Health',
    workforce: 'People Productivity',
    financial: 'Financial Overview'
  };
  return titles[sectionId] || 'Dashboard Summary';
}