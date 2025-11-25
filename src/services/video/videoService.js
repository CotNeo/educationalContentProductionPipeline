/**
 * Video Servisi
 * YouTube Shorts formatında dikey video oluşturur
 */

import { spawn } from "child_process";
import { accessSync } from "fs";
import { logger } from "../../core/logger.js";
import { appConfig } from "../../config/appConfig.js";
import { getVideoStyle } from "./styles.js";
import { fileExists } from "../../core/utils.js";

const MODULE_NAME = "VideoService";

/**
 * YouTube Shorts formatında video oluşturur
 * @param {Object} params - Parametreler
 * @param {string} params.scriptText - Video'da gösterilecek metin
 * @param {string} params.audioPath - Ses dosyası yolu
 * @param {string} params.outputPath - Çıktı video yolu
 * @param {string} params.thumbnailText - Thumbnail metni
 * @param {string} params.style - Video stili (minimal, gradient, modern)
 * @returns {Promise<string>} - Oluşturulan video dosyası yolu
 */
export const createShortVideo = async ({
  scriptText,
  audioPath,
  outputPath,
  thumbnailText,
  style = "minimal",
}) => {
  logger.groupStart(MODULE_NAME, "Video Oluşturma");

  try {
    // 1. Ses dosyasının var olduğunu kontrol et
    logger.info(MODULE_NAME, "Ses dosyası kontrol ediliyor", { audioPath });
    const audioExists = await fileExists(audioPath);
    if (!audioExists) {
      throw new Error(`Ses dosyası bulunamadı: ${audioPath}`);
    }

    // 2. Ses dosyasının süresini al
    logger.info(MODULE_NAME, "Ses dosyası süresi hesaplanıyor...");
    let audioDuration = 0;
    try {
      // FFmpeg ile ses süresini al
      audioDuration = await getAudioDuration(audioPath);
      logger.info(MODULE_NAME, `Ses süresi: ${audioDuration.toFixed(2)} saniye`);
    } catch (error) {
      logger.error(MODULE_NAME, "Ses süresi alınamadı, varsayılan kullanılıyor", error);
      audioDuration = 30; // Varsayılan 30 saniye
    }

    // 3. Video stilini al
    const videoStyle = getVideoStyle(style);
    logger.info(MODULE_NAME, "Video stili belirlendi", { style: videoStyle.name });

    // 4. Metni video için optimize et (satırlara böl)
    const formattedText = formatTextForVideo(scriptText, videoStyle);
    logger.debug(MODULE_NAME, "Metin formatlandı", { textLength: formattedText.length });

    // 5. FFmpeg komutunu oluştur ve çalıştır
    logger.info(MODULE_NAME, "FFmpeg ile video oluşturuluyor...");
    await generateVideoWithFFmpeg({
      audioPath,
      outputPath,
      text: formattedText,
      thumbnailText,
      duration: audioDuration,
      style: videoStyle,
    });

    // 6. Video dosyasının oluşturulduğunu doğrula
    const videoExists = await fileExists(outputPath);
    if (!videoExists) {
      throw new Error(`Video dosyası oluşturulamadı: ${outputPath}`);
    }

    logger.success(MODULE_NAME, "Video başarıyla oluşturuldu", { outputPath });
    logger.groupEnd(MODULE_NAME, "Video Oluşturma");

    return outputPath;
  } catch (error) {
    logger.error(MODULE_NAME, "Video oluşturma başarısız", error);
    logger.groupEnd(MODULE_NAME, "Video Oluşturma");
    throw error;
  }
};

/**
 * Metni video için formatlar (satırlara böl)
 * @param {string} text - Ham metin
 * @param {Object} style - Video stili
 * @returns {string} - Formatlanmış metin
 */
const formatTextForVideo = (text, style) => {
  if (!text) return "";

  // Metni temizle
  let cleaned = text.trim().replace(/\s+/g, " ");

  // Uzun metinleri satırlara böl (yaklaşık 40 karakter)
  const maxLineLength = 40;
  const words = cleaned.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).length <= maxLineLength) {
      currentLine = currentLine ? currentLine + " " + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines.join("\\n");
};

/**
 * Sistem font yolunu bulur
 * @returns {string} - Font dosya yolu
 */
const getFontPath = () => {
  const fontPaths = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
  ];

  for (const path of fontPaths) {
    try {
      accessSync(path);
      return path;
    } catch {
      // Font bulunamadı, bir sonrakini dene
      continue;
    }
  }

  // Hiçbiri bulunamazsa varsayılan döndür
  logger.debug(MODULE_NAME, "Font bulunamadı, varsayılan kullanılıyor");
  return fontPaths[0];
};

/**
 * FFmpeg ile ses dosyasının süresini alır
 * @param {string} audioPath - Ses dosyası yolu
 * @returns {Promise<number>} - Süre (saniye)
 */
const getAudioDuration = (audioPath) => {
  return new Promise((resolve, reject) => {
    const ffprobeProcess = spawn("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      audioPath,
    ]);

    let stdout = "";
    let stderr = "";

    ffprobeProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    ffprobeProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ffprobeProcess.on("close", (code) => {
      if (code === 0) {
        const duration = parseFloat(stdout.trim());
        if (isNaN(duration)) {
          reject(new Error("Ses süresi parse edilemedi"));
        } else {
          resolve(duration);
        }
      } else {
        reject(new Error(`FFprobe hatası (exit code: ${code}): ${stderr}`));
      }
    });

    ffprobeProcess.on("error", (error) => {
      reject(new Error(`FFprobe başlatılamadı: ${error.message}`));
    });
  });
};

/**
 * FFmpeg ile video oluşturur
 * @param {Object} params - Parametreler
 */
const generateVideoWithFFmpeg = async ({
  audioPath,
  outputPath,
  text,
  thumbnailText,
  duration,
  style,
}) => {
  return new Promise((resolve, reject) => {
    const { width, height } = appConfig.video;

    // FFmpeg filter komutu
    // Arka plan + metin overlay
    // Metindeki özel karakterleri escape et (FFmpeg drawtext için)
    // FFmpeg drawtext'te özel karakterler: \ ' : [ ] , ; = \n
    const escapedText = text
      .replace(/\\/g, "\\\\")   // Backslash önce
      .replace(/'/g, "'\\''")   // Single quote: ' -> '\''
      .replace(/:/g, "\\:")     // Colon
      .replace(/\[/g, "\\[")    // Square bracket
      .replace(/\]/g, "\\]")    // Square bracket
      .replace(/,/g, "\\,")     // Comma
      .replace(/;/g, "\\;")     // Semicolon
      .replace(/=/g, "\\=")     // Equals
      .replace(/\n/g, "\\n");   // Newline
    
    // macOS için font yolu (sırayla dene)
    const fontPath = getFontPath();
    
    // FFmpeg drawtext filter string'i
    const drawtextFilter = `drawtext=text='${escapedText}':fontfile=${fontPath}:fontsize=${style.fontSize}:fontcolor=${style.textColor}:x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=20`;
    
    // FFmpeg komutu
    const ffmpegArgs = [
      "-f", "lavfi",
      "-i", `color=c=${style.backgroundColor}:s=${width}x${height}:d=${duration}`,
      "-i", audioPath,
      "-vf", drawtextFilter,
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "23",
      "-c:a", "aac",
      "-b:a", "192k",
      "-shortest",
      "-y", // Overwrite output file
      outputPath,
    ];

    logger.debug(MODULE_NAME, "FFmpeg komutu", { args: ffmpegArgs.join(" ") });

    const ffmpegProcess = spawn("ffmpeg", ffmpegArgs);

    let stderr = "";

    ffmpegProcess.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;
      // FFmpeg progress bilgilerini logla
      if (output.includes("time=")) {
        logger.debug(MODULE_NAME, "FFmpeg progress", { output: output.trim() });
      }
    });

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `FFmpeg işlemi başarısız (exit code: ${code})\nSTDERR: ${stderr}`
          )
        );
      }
    });

    ffmpegProcess.on("error", (error) => {
      reject(new Error(`FFmpeg process başlatılamadı: ${error.message}\nFFmpeg yüklü mü? 'brew install ffmpeg'`));
    });
  });
};

