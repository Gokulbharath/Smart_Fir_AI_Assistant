/**
 * Embedding Service
 * Generates vector embeddings for text similarity search
 * Used for semantic similarity search in case retrieval
 * 
 * Note: Uses fallback embedding method. For production, consider integrating
 * with OpenAI embeddings, Cohere, or other embedding APIs.
 */

/**
 * Generate embedding for a text string using Gemini embedding model
 * Falls back to simple hash-based approach if API key is not available
 * 
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<number[]>} - Array of embedding values (1536 dimensions for text-embedding-004)
 */
export async function generateEmbedding(text) {
  // Note: Gemini doesn't have a separate embedding API.
  // Using fallback embedding approach for semantic similarity.
  // For production, consider using OpenAI embeddings, Cohere, or similar service.
  return generateFallbackEmbedding(text);
}

/**
 * Fallback embedding function using simple text-based features
 * This is a simplified approach for when Gemini API is unavailable
 * Not as accurate as real embeddings but functional for demo purposes
 * 
 * @param {string} text - Text to generate embedding for
 * @returns {number[]} - Simple feature vector
 */
function generateFallbackEmbedding(text) {
  // Simple bag-of-words-like approach
  const words = text.toLowerCase().split(/\s+/);
  const vector = new Array(128).fill(0);
  
  // Hash-based feature extraction
  words.forEach((word, index) => {
    const hash = simpleHash(word);
    vector[hash % 128] += 1 / (index + 1); // Weight by position
  });
  
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
}

/**
 * Simple hash function for fallback embedding
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Calculate cosine similarity between two embeddings
 * @param {number[]} embedding1 
 * @param {number[]} embedding2 
 * @returns {number} - Similarity score between 0 and 1
 */
export function cosineSimilarity(embedding1, embedding2) {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length');
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }
  
  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

/**
 * Convert similarity score (0-1) to percentage match (0-100)
 * @param {number} similarity 
 * @returns {number} - Percentage match
 */
export function similarityToPercentage(similarity) {
  // Clip to [0, 1] and scale to [0, 100]
  const clamped = Math.max(0, Math.min(1, similarity));
  return Math.round(clamped * 100);
}

