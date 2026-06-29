export const extractDominantColor = (base64Image) => {
  return new Promise((resolve) => {
    const img = new Image();
    // In case of cross-origin issues with some browsers even on data URIs
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // We only care about the center of the image where the clothes usually are.
        // Let's create a 20x20 canvas.
        canvas.width = 20;
        canvas.height = 20;
        
        // Calculate center crop
        const cropSize = Math.min(img.width, img.height) * 0.5; // take 50% of the center
        const sx = (img.width - cropSize) / 2;
        const sy = (img.height - cropSize) / 2;
        
        // Draw only the cropped center part scaled down to 20x20
        ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, 20, 20);
        
        const imageData = ctx.getImageData(0, 0, 20, 20).data;
        let r = 0, g = 0, b = 0;
        let validPixels = 0;
        
        for (let i = 0; i < imageData.length; i += 4) {
          const pr = imageData[i];
          const pg = imageData[i + 1];
          const pb = imageData[i + 2];
          const pa = imageData[i + 3];

          // Ignore transparent pixels
          if (pa < 128) continue;
          
          // Ignore completely white or completely black pixels (often backgrounds)
          const brightness = (pr + pg + pb) / 3;
          if (brightness > 240 || brightness < 15) continue;

          r += pr;
          g += pg;
          b += pb;
          validPixels++;
        }
        
        if (validPixels === 0) {
          // If all pixels were ignored (e.g. pure white shirt on pure white background), just average everything
          for (let i = 0; i < imageData.length; i += 4) {
             r += imageData[i];
             g += imageData[i + 1];
             b += imageData[i + 2];
          }
          validPixels = 20 * 20;
        }
        
        resolve([
          Math.round(r / validPixels),
          Math.round(g / validPixels),
          Math.round(b / validPixels)
        ]);
      } catch (e) {
        console.error("Color extraction error:", e);
        // Fallback color if canvas extraction fails (e.g. SecurityError in strict mobile browsers)
        // Returning a random pleasing color so it's not all grey
        const hues = [ [59, 130, 246], [239, 68, 68], [16, 185, 129], [139, 92, 246] ];
        resolve(hues[Math.floor(Math.random() * hues.length)]);
      }
    };
    img.onerror = (err) => {
      console.error("Image load error:", err);
      resolve([128, 128, 128]); // Grey if image fails to load
    };
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
