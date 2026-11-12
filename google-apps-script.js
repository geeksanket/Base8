/**
 * Google Apps Script for AstroLearn
 * ==============================================================================
 * HOW TO SET THIS UP (Takes 1-2 minutes):
 * 1. Open Google Sheets (https://sheets.new)
 * 2. In row 1, add these headers:
 *    A1: Timestamp | B1: Interest | C1: Age Group | D1: Learning Goal | E1: Selected Topic | F1: User ID
 * 3. Click "Extensions" > "Apps Script"
 * 4. Paste this entire code into Code.gs (replacing everything there)
 * 5. Click "Deploy" > "New deployment"
 * 6. Select type: "Web app"
 * 7. Description: "AstroLearn Responses"
 * 8. Execute as: "Me"
 * 9. Who has access: "Anyone" (IMPORTANT!)
 * 10. Click "Deploy", authorize access, and copy the Web App URL!
 * 11. Paste that URL into:
 *     - server.js (GOOGLE_SHEET_WEBHOOK_URL) OR
 *     - script.js (GOOGLE_SHEET_URL)
 * ==============================================================================
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var timestamp = data.timestamp || new Date().toLocaleString();
    var interest = data.interest || 'Not specified';
    var ageGroup = data.ageGroup || 'Not specified';
    var learningGoal = data.learningGoal || 'Not specified';
    var selectedTopic = data.selectedTopic || 'None';
    var userId = data.userId || 'anon_' + Math.random().toString(36).substr(2, 9);

    // Append as a new row in Google Sheet
    sheet.appendRow([
      timestamp,
      interest,
      ageGroup,
      learningGoal,
      selectedTopic,
      userId
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Response recorded successfully in Google Sheet',
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'AstroLearn Google Sheets Webhook is active and listening for POST submissions.'
  })).setMimeType(ContentService.MimeType.JSON);
}
