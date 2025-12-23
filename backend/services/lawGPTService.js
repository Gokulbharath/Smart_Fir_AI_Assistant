import axios from 'axios';

/**
 * LawGPT Service - Integrates with Python LawGPT backend
 * Calls the LawGPT API to predict IPC sections based on case description
 */

const LAWGPT_API_URL = process.env.LAWGPT_API_URL || 'http://127.0.0.1:5000';

/**
 * Predict IPC sections for a given case description
 * @param {string} caseDescription - The case description text
 * @returns {Promise<Array>} Array of top 3 IPC predictions with section, offense, punishment, confidence
 */
export async function predictIPCSections(caseDescription) {
  try {
    console.log(`[LawGPT] Calling API at ${LAWGPT_API_URL}/predict`);
    console.log(`[LawGPT] Case description length: ${caseDescription?.length || 0} characters`);

    const response = await axios.post(
      `${LAWGPT_API_URL}/predict`,
      { case: caseDescription },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log(`[LawGPT] Response received:`, response.status);

    // Extract top 3 IPC sections from response
    // Expected format from LawGPT: { ipc_suggestions: [...] } or similar
    const predictions = response.data.ipc_suggestions || response.data.predictions || response.data.ipcPredictions || [];

    // Format predictions to match our schema
    const formattedPredictions = predictions.slice(0, 3).map((pred, index) => ({
      section: pred.section_number || pred.section || pred.section_label || `IPC ${index + 1}`,
      offense: pred.offense || pred.description || 'Unknown offense',
      punishment: pred.punishment || 'Not specified',
      confidence: pred.confidence || pred.score || (1 - index * 0.1) // Default confidence decreasing
    }));

    console.log(`[LawGPT] Extracted ${formattedPredictions.length} IPC predictions`);
    return formattedPredictions;

  } catch (error) {
    console.error('[LawGPT] Error calling API:', error.message);
    
    // Return empty array if LawGPT is unavailable (allow offline draft creation)
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.warn('[LawGPT] Service unavailable, creating draft without IPC predictions');
      return [];
    }

    // For other errors, throw to let caller handle
    throw new Error(`LawGPT API error: ${error.message}`);
  }
}

/**
 * Generate a unique FIR number
 * Format: FIR/YYYY/XXXXXX
 */
export function generateFIRNumber() {
  const year = new Date().getFullYear();
  const random = String(Date.now()).slice(-6);
  return `FIR/${year}/${random}`;
}












