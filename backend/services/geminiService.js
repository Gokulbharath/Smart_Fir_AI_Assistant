import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini Service - AI Reasoning and Re-ranking
 * 
 * IMPORTANT: This service uses Gemini API ONLY for:
 * 1. Re-ranking search results based on semantic similarity
 * 2. Generating explanations for case similarity
 * 3. Analyzing IPC section overlap and crime patterns
 * 
 * Gemini does NOT fetch web data or access real FIR databases.
 * All data processed is from our synthetic dataset.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Re-rank search results using Gemini's reasoning capabilities
 * Analyzes semantic similarity, IPC overlap, and crime patterns
 * 
 * @param {Array} cases - Array of cases to re-rank
 * @param {string} query - Original search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Re-ranked cases with updated similarity scores
 */
export async function rerankCases(cases, query, limit = 10) {
  if (!genAI || !GEMINI_API_KEY) {
    console.warn('[Gemini] API key not set, returning original ranking');
    return cases.slice(0, limit);
  }

  if (cases.length === 0) return [];

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Prepare case summaries for Gemini
    const caseSummaries = cases.map((caseItem, index) => ({
      index,
      title: caseItem.title,
      description: caseItem.description.substring(0, 200), // Truncate for context
      ipcSections: caseItem.ipcSections,
      currentSimilarity: caseItem.similarity
    }));

    const prompt = `You are analyzing case similarity for a legal case retrieval system. 

Query: "${query}"

Cases to analyze:
${JSON.stringify(caseSummaries, null, 2)}

Task: Re-rank these cases based on:
1. Semantic similarity to the query
2. IPC section overlap/relevance
3. Crime pattern similarity
4. Descriptive similarity

Return ONLY a JSON array of indices in order of relevance (most relevant first).
Format: [0, 2, 1, 3, ...]

Do not include any explanation, only the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\d,\s]+\]/);
    if (jsonMatch) {
      const rankedIndices = JSON.parse(jsonMatch[0]);
      
      // Re-order cases based on Gemini's ranking
      const reranked = rankedIndices
        .slice(0, limit)
        .map(index => cases[index])
        .filter(Boolean); // Remove any undefined entries
      
      // If Gemini didn't return all cases, add remaining in original order
      const usedIndices = new Set(rankedIndices);
      cases.forEach((caseItem, index) => {
        if (!usedIndices.has(index) && reranked.length < limit) {
          reranked.push(caseItem);
        }
      });
      
      return reranked;
    } else {
      console.warn('[Gemini] Could not parse ranking, using original order');
      return cases.slice(0, limit);
    }

  } catch (error) {
    console.error('[Gemini] Error in re-ranking:', error.message);
    // Fallback to original ranking
    return cases.slice(0, limit);
  }
}

/**
 * Generate AI explanation for why cases are similar
 * 
 * @param {Object} queryCase - The query/search case
 * @param {Object} resultCase - A retrieved similar case
 * @returns {Promise<string>} - Explanation of similarity
 */
export async function generateSimilarityExplanation(queryCase, resultCase) {
  if (!genAI || !GEMINI_API_KEY) {
    return generateFallbackExplanation(queryCase, resultCase);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze and explain the similarity between two legal cases.

Query Case:
Title: ${queryCase.title || 'Search query'}
Description: ${queryCase.description || queryCase}

Retrieved Case:
Title: ${resultCase.title}
Description: ${resultCase.description}
IPC Sections: ${resultCase.ipcSections.join(', ')}
Location: ${resultCase.location}
Status: ${resultCase.status}

Provide a concise explanation (2-3 sentences) explaining:
1. Why these cases are similar
2. Key IPC section overlaps
3. Common crime patterns

Keep it professional and factual. Do not use real names or claim access to real data.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();

  } catch (error) {
    console.error('[Gemini] Error generating explanation:', error.message);
    return generateFallbackExplanation(queryCase, resultCase);
  }
}

/**
 * Generate fallback explanation when Gemini is unavailable
 */
function generateFallbackExplanation(queryCase, resultCase) {
  const queryText = (queryCase.description || queryCase.title || '').toLowerCase();
  const resultText = resultCase.description.toLowerCase();
  
  const commonWords = findCommonWords(queryText, resultText);
  const ipcOverlap = resultCase.ipcSections.join(', ');
  
  let explanation = `This case is similar due to `;
  
  if (commonWords.length > 0) {
    explanation += `shared crime patterns (${commonWords.slice(0, 3).join(', ')})`;
  }
  
  if (ipcOverlap) {
    explanation += ` and applicable IPC sections (${ipcOverlap})`;
  }
  
  explanation += `. The case demonstrates similar factual circumstances and legal classification.`;
  
  return explanation;
}

/**
 * Find common significant words between two texts
 */
function findCommonWords(text1, text2) {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 4));
  const words2 = text2.split(/\s+/).filter(w => w.length > 4);
  
  return words2.filter(word => words1.has(word));
}

/**
 * Analyze IPC section overlap between query and result
 * 
 * @param {string[]} queryIPC - IPC sections from query
 * @param {string[]} resultIPC - IPC sections from result
 * @returns {Object} - Analysis of IPC overlap
 */
export function analyzeIPCOverlap(queryIPC, resultIPC) {
  const overlap = queryIPC.filter(ipc => resultIPC.includes(ipc));
  const overlapPercentage = queryIPC.length > 0 
    ? (overlap.length / queryIPC.length) * 100 
    : 0;
  
  return {
    overlapping: overlap,
    overlapCount: overlap.length,
    overlapPercentage: Math.round(overlapPercentage),
    totalQuerySections: queryIPC.length,
    totalResultSections: resultIPC.length
  };
}

