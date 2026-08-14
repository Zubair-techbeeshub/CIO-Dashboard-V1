import { getDashboardSummary } from '../data/summaries';

import React from 'react';

export interface SectionSummary {
  title: string;
  content: React.ReactNode;
  rawText?: string;
}

export interface SummarySection {
  id: string;
  title: string;
}

/**
 * AI Summary Service
 * 
 * Current implementation uses a local fallback generator that mimics AI output.
 * To use a real AI model (Grok, OpenAI, Anthropic, etc.):
 * 
 * 1. Add API key to .env:
 *    VITE_AI_PROVIDER=grok  // or openai, anthropic
 *    VITE_AI_API_KEY=your_key
 *    VITE_AI_MODEL=grok-2-1212
 * 
 * 2. Implement the real API call in fetchAISummary()
 */

export async function generateSummary(sectionId: string, sectionData?: any): Promise<SectionSummary> {
  const startTime = Date.now();
  
  // Check if AI provider is configured
  const provider = import.meta.env.VITE_AI_PROVIDER;
  const apiKey = import.meta.env.VITE_AI_API_KEY;
  
  if (provider && apiKey) {
    try {
      return await fetchAISummary(provider, apiKey, sectionId, sectionData);
    } catch (error) {
      console.warn('AI summary failed, using fallback:', error);
      return getFallbackSummary(sectionId);
    }
  }
  
  // Simulate AI processing time for better UX
  const elapsed = Date.now() - startTime;
  if (elapsed < 600) {
    await new Promise(resolve => setTimeout(resolve, 600 - elapsed));
  }
  
  return getFallbackSummary(sectionId);
}

async function fetchAISummary(
  provider: string,
  apiKey: string,
  sectionId: string,
  sectionData?: any
): Promise<SectionSummary> {
  const prompt = buildPrompt(sectionId, sectionData);
  
  // Grok / xAI API structure
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_AI_MODEL || 'grok-2-1212',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful business analyst. Generate concise, insightful summaries for a CIO dashboard. Use HTML tags like <p>, <ul>, <li>, <strong> for formatting. Focus on actionable insights and key takeaways.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })
  });
  
  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }
  
  const data = await response.json();
  const html = data.choices[0]?.message?.content || '';
  
  return {
    title: getSectionTitle(sectionId),
    content: <div className="summary-content" dangerouslySetInnerHTML={{ __html: html }} />,
    rawText: html
  };
}

function buildPrompt(sectionId: string, sectionData?: any): string {
  const dataText = sectionData ? `\n\nCurrent data:\n${JSON.stringify(sectionData, null, 2)}` : '';
  
  return `Generate an executive summary for the "${getSectionTitle(sectionId)}" section of a CIO dashboard for a utilities company. 
Include key metrics, trends, and 2-3 actionable insights. Keep it under 250 words.${dataText}`;
}

function getFallbackSummary(sectionId: string): SectionSummary {
  return getDashboardSummary(sectionId);
}

function getSectionTitle(sectionId: string): string {
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

export { getSectionTitle };