import React, { useState, useEffect, useRef } from 'react';

// Helper function to parse the glossary text
const parseGlossaryText = (text) => {
  const terms = [];
  const lines = text.split('\n');
  let currentTerm = null;
  let currentDefinition = [];
  let currentSeeAlso = [];
  let inDefinition = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip initial title and empty lines before the first term
    if (terms.length === 0 && (line.includes('The Unforgettable Chronicle: A-Z Deep-Rooted Glossary') || line === 'A' || line === '')) {
      continue;
    }

    if (line.startsWith('--- PAGE')) {
      // End of a page, finalize previous term if any
      if (currentTerm && inDefinition) {
        terms.push({
          term: currentTerm,
          definition: currentDefinition.join('\n').trim(),
          seeAlso: currentSeeAlso,
        });
        currentTerm = null;
        currentDefinition = [];
        currentSeeAlso = [];
        inDefinition = false;
      }
      continue;
    }

    if (line === '') {
      // Empty line, could be separating parts of a definition or new term
      if (currentTerm && inDefinition) {
        currentDefinition.push(''); // Preserve blank lines within definition
      }
      continue;
    }

    // Check for a new term (starts with Capital, followed by optional non-lowercase chars, not "See also:")
    // Refined regex to better capture terms like "E.DIN" or "13-Month Calendar"
    if (line.match(/^[A-Z0-9][a-zA-Z0-9\s&-]*$/) && !line.startsWith('See also:') && !inDefinition && line.length > 1) {
      if (currentTerm) { // If there was a previous term, finalize it
        terms.push({
          term: currentTerm,
          definition: currentDefinition.join('\n').trim(),
          seeAlso: currentSeeAlso,
        });
      }
      currentTerm = line;
      currentDefinition = [];
      currentSeeAlso = [];
      inDefinition = true; // Start collecting definition
    } else if (line.startsWith('See also:')) {
      currentSeeAlso = line.substring('See also:'.length).split(',').map(s => s.trim()).filter(s => s.length > 0);
      inDefinition = false; // Stop collecting definition for this term
    } else if (inDefinition) {
      currentDefinition.push(line);
    }
  }

  // Add the last term if any
  if (currentTerm) {
    terms.push({
      term: currentTerm,
      definition: currentDefinition.join('\n').trim(),
      seeAlso: currentSeeAlso,
    });
  }
  return terms;
};



