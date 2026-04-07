const bwipjs = require('bwip-js');

// Generate barcode image as base64 PNG
const generateBarcode = async (req, res) => {
  try {
    const { text, type = 'code128', scale = 3, height = 10 } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Barcode text is required' });
    }

    const sanitizedText = text.trim().slice(0, 100);

    const buffer = await bwipjs.toBuffer({
      bcid: type,
      text: sanitizedText,
      scale: Math.min(Math.max(parseInt(scale) || 3, 1), 5),
      height: Math.min(Math.max(parseInt(height) || 10, 5), 30),
      includetext: true,
      textxalign: 'center',
    });

    const base64 = buffer.toString('base64');
    res.json({
      success: true,
      data: {
        barcode: `data:image/png;base64,${base64}`,
        text: sanitizedText,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Barcode generation failed: ${err.message}` });
  }
};

module.exports = { generateBarcode };
