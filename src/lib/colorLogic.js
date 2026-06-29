import ColorThief from 'colorthief';

export const extractDominantColor = (base64Image) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const color = colorThief.getColor(img);
        resolve(color); // [r, g, b]
      } catch (e) {
        // Fallback color if extraction fails
        resolve([128, 128, 128]);
      }
    };
    img.onerror = () => resolve([128, 128, 128]);
    img.src = base64Image;
  });
};

// Convert RGB to HSL
export const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
};

// Calculate match score between top and bottom colors
export const calculateMatchScore = (topColorRGB, bottomColorRGB) => {
  if (!topColorRGB || !bottomColorRGB) return Math.random() * 50; // Fallback

  const [tH, tS, tL] = rgbToHsl(...topColorRGB);
  const [bH, bS, bL] = rgbToHsl(...bottomColorRGB);

  let score = 50; // Base score

  const isTopNeutral = tS < 15 || tL < 15 || tL > 85;
  const isBottomNeutral = bS < 15 || bL < 15 || bL > 85;

  const isTopLight = tL > 60;
  const isTopDark = tL < 40;
  
  const isBottomLight = bL > 60;
  const isBottomDark = bL < 40;

  // 1. Contrast Rule (Light + Dark looks good)
  if ((isTopLight && isBottomDark) || (isTopDark && isBottomLight)) {
    score += 30;
  }

  // 2. Neutral Pairing Rule
  // Colorful top + Neutral bottom is a classic safe choice
  if (!isTopNeutral && isBottomNeutral) {
    score += 25;
  }
  // Neutral top + Colorful bottom
  if (isTopNeutral && !isBottomNeutral) {
    score += 20;
  }
  // Neutral + Neutral is always safe
  if (isTopNeutral && isBottomNeutral) {
    // Better if there's contrast
    if (Math.abs(tL - bL) > 30) {
      score += 20;
    } else {
      score += 10;
    }
  }

  // 3. Tone on Tone Rule (If both are colorful)
  if (!isTopNeutral && !isBottomNeutral) {
    const hueDiff = Math.abs(tH - bH);
    const minHueDiff = Math.min(hueDiff, 360 - hueDiff);
    
    // Similar hues (Tone on Tone)
    if (minHueDiff < 30) {
      if (Math.abs(tL - bL) > 20) {
        score += 35; // Same hue but different lightness is great
      } else {
        score -= 10; // Same hue and same lightness can look like a uniform
      }
    } 
    // Complementary colors
    else if (Math.abs(minHueDiff - 180) < 30) {
      score += 15;
    } 
    // Clashing colors
    else {
      score -= 20;
    }
  }

  return score;
};
