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
 * Supports: OpenAI, Grok, Gemini, and local fallback
 * 
 * 1. Add API key to .env:
 *    VITE_AI_PROVIDER=openai  // or grok, gemini
 *    VITE_AI_API_KEY=your_key
 *    VITE_AI_MODEL=gpt-4      // or gpt-3.5-turbo, grok-2-1212, gemini-1.5-flash
 * 
 * 2. Rebuild and deploy
 */

export async function generateSummary(sectionId: string, sectionData?: any): Promise<SectionSummary> {
  const startTime = Date.now();
  
  // Check if AI provider is configured
  const provider = import.meta.env.VITE_AI_PROVIDER?.toLowerCase();
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
  const systemPrompt = 'You are a helpful business analyst. Generate concise, insightful summaries for a CIO dashboard. Use HTML tags like <p>, <ul>, <li>, <strong> for formatting. Focus on actionable insights and key takeaways. Keep it under 250 words.';
  
  let html = '';
  
  switch (provider) {
    case 'openai':
      html = await callOpenAI(apiKey, systemPrompt, prompt);
      break;
    case 'grok':
    case 'xai':
      html = await callGrok(apiKey, systemPrompt, prompt);
      break;
    case 'gemini':
    case 'google':
      html = await callGemini(apiKey, systemPrompt, prompt);
      break;
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
  
  return {
    title: getSectionTitle(sectionId),
    content: <div className="summary-content" dangerouslySetInnerHTML={{ __html: html }} />,
    rawText: html
  };
}

async function callOpenAI(apiKey: string, systemPrompt: string, prompt: string): Promise<string> {
  const model = import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo';
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callGrok(apiKey: string, systemPrompt: string, prompt: string): Promise<string> {
  const model = import.meta.env.VITE_AI_MODEL || 'grok-2-1212';
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callGemini(apiKey: string, systemPrompt: string, prompt: string): Promise<string> {
  const model = import.meta.env.VITE_AI_MODEL || 'gemini-1.5-flash';
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\n${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
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