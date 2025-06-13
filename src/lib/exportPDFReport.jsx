// exportPDFReport.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Device to profile image mapping
 */
const deviceImageMap = {
  'device_001': '/profiles/profile1.png',
  'device_002': '/profiles/profile2.png',
  'device_003': '/profiles/profile3.png',
  'device_004': '/profiles/profile4.png',
  'device_005': '/profiles/profile5.png',
  // Add more mappings as needed
};

/**
 * Convert image URL to Base64 (for logo/profile image)
 */
async function toBase64FromUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null;
  }
}

/**
 * Preload image to check if it exists
 */
function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Get profile image URL based on device ID
 */
function getProfileImageUrl(deviceId, baseUrl = 'http://localhost:3000/') {
  const profilePath = deviceImageMap[deviceId] || '/profiles/default.png';
  return `${baseUrl}${profilePath}`;
}

/**
 * Add decorative header
 */
function addDecorativeHeader(doc, title, subtitle) {
  const pageWidth = doc.internal.pageSize.width;
  
  // Header background
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Decorative line
  doc.setFillColor(52, 152, 219);
  doc.rect(0, 40, pageWidth, 5, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, pageWidth/2, 20, { align: "center" });
  
  // Subtitle
  doc.setFontSize(11);
  doc.setFont("Helvetica", "normal");
  doc.text(subtitle, pageWidth/2, 32, { align: "center" });
}

/**
 * Add section header with styling
 */
function addSectionHeader(doc, title, y, icon = null) {
  const pageWidth = doc.internal.pageSize.width;
  
  // Section background
  doc.setFillColor(245, 245, 245);
  doc.rect(14, y - 3, pageWidth - 28, 12, 'F');
  
  // Left border accent
  doc.setFillColor(41, 128, 185);
  doc.rect(14, y - 3, 3, 12, 'F');
  
  // Title
  doc.setTextColor(52, 73, 94);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, 22, y + 4);
  
  return y + 15;
}

/**
 * Add status card with color coding
 */
function addStatusCard(doc, x, y, width, height, title, value, status) {
  // Card background
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, width, height, 'F');
  
  // Card border
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.rect(x, y, width, height, 'S');
  
  // Status indicator
  const statusColor = getStatusColor(status);
  doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
  doc.circle(x + width - 8, y + 8, 3, 'F');
  
  // Title
  doc.setTextColor(100, 100, 100);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text(title, x + 5, y + 12);
  
  // Value
  doc.setTextColor(52, 73, 94);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text(value, x + 5, y + 25);
}

/**
 * Get status color based on stress level
 */
function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "high":
      return { r: 231, g: 76, b: 60 }; // Red
    case "medium":
      return { r: 243, g: 156, b: 18 }; // Orange
    case "low":
      return { r: 241, g: 196, b: 15 }; // Yellow
    case "normal":
      return { r: 46, g: 204, b: 113 }; // Green
    default:
      return { r: 149, g: 165, b: 166 }; // Gray
  }
}

/**
 * Add info box with icon
 */
function addInfoBox(doc, x, y, width, title, content, color = { r: 52, g: 152, b: 219 }) {
  // Box background
  doc.setFillColor(color.r, color.g, color.b, 0.1);
  doc.rect(x, y, width, 20, 'F');
  
  // Left border
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(x, y, 2, 20, 'F');
  
  // Title
  doc.setTextColor(color.r, color.g, color.b);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, x + 8, y + 8);
  
  // Content
  doc.setTextColor(52, 73, 94);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  const splitContent = doc.splitTextToSize(content, width - 16);
  doc.text(splitContent, x + 8, y + 14);
  
  return y + Math.max(20, splitContent.length * 3 + 8);
}

/**
 * Format date properly
 */
function formatDate(dateInput) {
  try {
    let date;
    if (typeof dateInput === 'string') {
      // Handle various date string formats
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else {
      return "Unknown";
    }
    
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date Error";
  }
}

/**
 * Get current sensor values
 */
function getCurrentSensorValues(sensorData, personalData) {
  const currentTime = new Date();
  
  return {
    skinTemp: sensorData?.skintemp || sensorData?.skin_temp || personalData?.skintemp || "N/A",
    heartRate: sensorData?.hr || sensorData?.heart_rate || personalData?.hr || "N/A",
    stressLevel: sensorData?.stress_level || personalData?.stress_level || "Normal",
    timestamp: currentTime
  };
}

/**
 * Get detailed stress analysis
 */
function getDetailedStressAnalysis(level, history = []) {
  const baseAnalysis = {
    "high": "HIGH STRESS DETECTED: Immediate attention recommended. Your current stress levels indicate significant physiological arousal.",
    "medium": "MODERATE STRESS: Elevated stress response detected. Consider implementing relaxation techniques.",
    "low": "LOW STRESS: Minimal stress indicators present. Maintain current wellness practices.",
    "normal": "OPTIMAL STATE: Stress levels within healthy range. Continue current lifestyle habits."
  };

  const recentTrend = Array.isArray(history) && history.length > 0 ? 
    `Recent data shows ${history.length} recorded measurements with varying stress patterns.` : 
    "Limited historical data available for trend analysis.";

  return `${baseAnalysis[level?.toLowerCase()] || baseAnalysis.normal} ${recentTrend}`;
}

/**
 * Get stress level description
 */
function getStressDescription(level) {
  const descriptions = {
    "high": "Significant stress response detected",
    "medium": "Moderate stress levels observed",
    "low": "Minimal stress indicators present",
    "normal": "Baseline/relaxed state maintained"
  };
  return descriptions[level?.toLowerCase()] || "Standard measurement recorded";
}

/**
 * Get personalized recommendations
 */
function getPersonalizedRecommendations(stressLevel, personalData) {
  const baseRecommendations = [
    {
      title: "Physical Activity",
      content: "Engage in 30 minutes of moderate exercise daily. Walking, swimming, or yoga can significantly reduce stress hormones and boost endorphins."
    },
    {
      title: "Mindfulness & Relaxation",
      content: "Practice deep breathing exercises, meditation, or progressive muscle relaxation for 10-15 minutes daily to activate your body's relaxation response."
    },
    {
      title: "Sleep Optimization",
      content: "Maintain 7-9 hours of quality sleep nightly. Establish a consistent bedtime routine and create a comfortable sleep environment."
    },
    {
      title: "Nutritional Support",
      content: "Consume a balanced diet rich in omega-3 fatty acids, complex carbohydrates, and antioxidants. Limit caffeine and processed foods."
    }
  ];

  // Add stress-specific recommendations
  if (stressLevel?.toLowerCase() === "high") {
    baseRecommendations.unshift({
      title: "Immediate Action Required",
      content: "Consider consulting with a healthcare professional. Implement immediate stress reduction techniques and avoid additional stressors when possible."
    });
  }

  return baseRecommendations.slice(0, 4); // Limit to 4 recommendations
}

/**
 * Export Enhanced PDF Report - Main Function
 */
export async function exportPDFReport(
  personalData,
  sensorData,
  stressSummary,
  logoUrl = "/logo.png",
  profileUrl = null,
  historyCanvas = null
) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  let currentY = 55;

  try {
    // Get profile URL based on device ID if not provided
    if (!profileUrl && personalData.device_id) {
      profileUrl = getProfileImageUrl(personalData.device_id);
    }

    // Add decorative header
    addDecorativeHeader(
      doc, 
      "STRESS DETECTION REPORT", 
      `Generated on ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`
    );

    // Logo and Profile Section
    const logoPromise = logoUrl ? toBase64FromUrl(logoUrl) : null;
    const profilePromise = profileUrl ? toBase64FromUrl(profileUrl) : null;
    
    const [logoBase64, profileBase64] = await Promise.all([logoPromise, profilePromise]);

    // Add logo
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", margin, 50, 20, 20);
      } catch (error) {
        console.warn("Could not add logo:", error);
      }
    }

    // Add profile picture in circular frame
    if (profileBase64) {
      try {
        // Circular background
        doc.setFillColor(245, 245, 245);
        doc.circle(pageWidth - 25, 62.5, 12, 'F');
        
        // Profile image (clipped to circle)
        doc.addImage(profileBase64, "JPEG", pageWidth - 35, 52.5, 20, 20);
      } catch (error) {
        console.warn("Could not add profile image:", error);
      }
    }

    // Personal Information Section
    currentY = addSectionHeader(doc, "PERSONAL INFORMATION", currentY);
    
    // Create enhanced personal info cards
    const personalInfo = [
      { label: "Full Name", value: `${personalData.name || ""} ${personalData.surname || ""}`.trim() || "Not specified" },
      { label: "Age", value: personalData.age ? `${personalData.age} years old` : "Not specified" },
      { label: "Physical", value: personalData.weight && personalData.height ? `${personalData.weight} kg / ${personalData.height} cm` : "Not specified" },
      { label: "Gender", value: personalData.gender || "Not specified" },
      { label: "Health Conditions", value: personalData.CD || "None reported" },
      { label: "Skin Type", value: personalData.skinType || "Not specified" },
      { label: "Device ID", value: personalData.device_id || "Not assigned" }
    ];

    // Create modern table
    autoTable(doc, {
      startY: currentY,
      head: [["Information", "Details"]],
      body: personalInfo.map(item => [item.label, item.value]),
      theme: "grid",
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        halign: 'left'
      },
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 95 }
      }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // Current Status Section - Get real-time values
    currentY = addSectionHeader(doc, "CURRENT HEALTH STATUS", currentY);

    const currentValues = getCurrentSensorValues(sensorData, personalData);

    // Status cards in a row
    const cardWidth = 50;
    const cardHeight = 30;
    const cardSpacing = 5;
    const startX = (pageWidth - (cardWidth * 3 + cardSpacing * 2)) / 2;

    addStatusCard(doc, startX, currentY, cardWidth, cardHeight, 
      "Stress Level", 
      String(currentValues.stressLevel).toUpperCase(), 
      currentValues.stressLevel);
    
    addStatusCard(doc, startX + cardWidth + cardSpacing, currentY, cardWidth, cardHeight, 
      "Skin Temperature", 
      currentValues.skinTemp !== "N/A" ? `${currentValues.skinTemp}°C` : "N/A", 
      "normal");
    
    addStatusCard(doc, startX + (cardWidth + cardSpacing) * 2, currentY, cardWidth, cardHeight, 
      "Heart Rate", 
      currentValues.heartRate !== "N/A" ? `${currentValues.heartRate} BPM` : "N/A", 
      "normal");

    currentY += cardHeight + 15;

    // Stress Level Analysis
    currentY = addSectionHeader(doc, "STRESS LEVEL ANALYSIS", currentY);
    
    const stressAnalysis = getDetailedStressAnalysis(currentValues.stressLevel, stressSummary);
    currentY = addInfoBox(doc, margin, currentY, pageWidth - margin * 2, 
      "Current Assessment", stressAnalysis, getStatusColor(currentValues.stressLevel));

    // Check if we need a new page for the chart
    if (currentY + 70 > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    // History Chart Section
    if (historyCanvas) {
      currentY = addSectionHeader(doc, "STRESS HISTORY ANALYSIS", currentY);
      
      try {
        const imgData = historyCanvas.toDataURL("image/png");
        
        // Chart background
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, currentY, pageWidth - margin * 2, 60, 'F');
        doc.setDrawColor(230, 230, 230);
        doc.rect(margin, currentY, pageWidth - margin * 2, 60, 'S');
        
        doc.addImage(imgData, "PNG", margin + 2, currentY + 2, pageWidth - margin * 2 - 4, 56);
        currentY += 70;
      } catch (error) {
        console.error("Error adding chart:", error);
        currentY = addInfoBox(doc, margin, currentY, pageWidth - margin * 2, 
          "Chart Status", "Historical data visualization could not be generated at this time.", 
          { r: 243, g: 156, b: 18 });
      }
    }

    // History Table - Fixed data formatting
    if (Array.isArray(stressSummary) && stressSummary.length > 0) {
      if (currentY + 60 > pageHeight - 40) {
        doc.addPage();
        currentY = 20;
      }

      currentY = addSectionHeader(doc, "DETAILED HISTORY LOG", currentY);
      
      // Process and validate history data
      const historyData = stressSummary
        .filter(item => item && (item.date || item.timestamp)) // Filter out invalid entries
        .slice(0, 12) // Limit to 12 entries for better layout
        .map(item => {
          const dateStr = formatDate(item.date || item.timestamp);
          const stressLevel = item.stress || item.level || item.stress_level || "Normal";
          const description = getStressDescription(stressLevel);
          
          return [dateStr, String(stressLevel), description];
        });

      if (historyData.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Date & Time", "Level", "Description"]],
          body: historyData,
          theme: "striped",
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { 
            fillColor: [41, 128, 185], 
            textColor: [255, 255, 255],
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 65 }
          }
        });

        currentY = doc.lastAutoTable.finalY + 15;
      }
    }

    // Recommendations Section
    if (currentY + 40 > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    currentY = addSectionHeader(doc, "PERSONALIZED RECOMMENDATIONS", currentY);

    const recommendations = getPersonalizedRecommendations(currentValues.stressLevel, personalData);
    recommendations.forEach((rec, index) => {
      const color = index % 2 === 0 ? { r: 46, g: 204, b: 113 } : { r: 52, g: 152, b: 219 };
      currentY = addInfoBox(doc, margin, currentY + 3, pageWidth - margin * 2, 
        rec.title, rec.content, color);
    });

    // Enhanced Footer for all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer background
      doc.setFillColor(41, 128, 185);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      // Footer text
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "Bio-sensor based Stress Detection System © 2025 | Advanced Health Monitoring Solution",
        pageWidth/2,
        pageHeight - 12,
        { align: "center" }
      );
      
      doc.setFontSize(7);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: "right" });
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, pageHeight - 6);
    }

    // Save with enhanced filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `StressReport_${personalData.name?.replace(/\s+/g, "_") || "User"}_${timestamp}.pdf`;
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error("Error generating enhanced PDF:", error);
    throw error;
  }
}

// Export utility functions for external use
export { getProfileImageUrl, preloadImage, formatDate };