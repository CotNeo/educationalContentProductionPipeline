/**
 * Video şablonları ve stilleri
 * Farklı video tasarım seçenekleri
 */

import { appConfig } from "../../config/appConfig.js";

/**
 * Video stil tanımları
 */
export const videoStyles = {
  minimal: {
    name: "Minimal",
    description: "Temiz, minimal tasarım",
    backgroundColor: "#000000",
    textColor: "#FFFFFF",
    fontSize: 72,
    fontFamily: "Arial-Bold",
    textPosition: "center",
    padding: 100,
  },
  gradient: {
    name: "Gradient",
    description: "Renkli gradient arka plan",
    backgroundColor: "#1a1a2e",
    gradientColors: ["#16213e", "#0f3460", "#533483"],
    textColor: "#FFFFFF",
    fontSize: 72,
    fontFamily: "Arial-Bold",
    textPosition: "center",
    padding: 100,
  },
  modern: {
    name: "Modern",
    description: "Modern, dinamik tasarım",
    backgroundColor: "#0a0a0a",
    textColor: "#00ff88",
    fontSize: 68,
    fontFamily: "Arial-Bold",
    textPosition: "center",
    padding: 120,
    accentColor: "#00ff88",
  },
};

/**
 * Stil getirir
 * @param {string} styleName - Stil adı
 * @returns {Object} - Stil objesi
 */
export const getVideoStyle = (styleName = null) => {
  const style = styleName || appConfig.video.style;
  return videoStyles[style] || videoStyles.minimal;
};

