const path = require('path');
const fs = require('fs');

/**
 * DOWNLOAD PDF CONTROLLER
 * 
 * What this does:
 * Sends a PDF file to the user for download
 * 
 * @route   GET /api/courses/notes/pdf/:filename
 * @access  Public (anyone with the link can download)
 */
const downloadPDF = (req, res) => {
  try {
    // Get filename from URL
    // Example: /api/courses/notes/pdf/notes_variables_123.pdf
    const { filename } = req.params;

    // Build full file path
    // __dirname = current directory
    // ../../pdfs = go up 2 levels, then into pdfs folder
    const filePath = path.join(__dirname, '../../pdfs', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found'
      });
    }

    // Send file for download
    // res.download() sends the file and prompts browser to download it
    res.download(filePath);

  } catch (error) {
    console.error('Download PDF error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error downloading PDF',
      error: error.message
    });
  }
};

module.exports = downloadPDF;