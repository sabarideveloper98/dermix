import Size from '../models/Size.js';

// @desc    Get all sizes
// @route   GET /api/sizes
// @access  Public (so products can show them)
export const getSizes = async (req, res) => {
  try {
    const sizes = await Size.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, sizes });
  } catch (error) {
    console.error('Error fetching sizes:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching sizes' });
  }
};

// @desc    Create a size
// @route   POST /api/sizes
// @access  Private/Admin
export const createSize = async (req, res) => {
  try {
    const { name, displayOrder, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Size name is required' });
    }

    const size = new Size({
      name,
      displayOrder: displayOrder || 0,
      status: status || 'active'
    });

    const createdSize = await size.save();
    res.status(201).json({ success: true, size: createdSize });
  } catch (error) {
    console.error('Error creating size:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating size' });
  }
};

// @desc    Update a size
// @route   PUT /api/sizes/:id
// @access  Private/Admin
export const updateSize = async (req, res) => {
  try {
    const { name, displayOrder, status } = req.body;
    const size = await Size.findById(req.params.id);

    if (size) {
      size.name = name || size.name;
      if (displayOrder !== undefined) size.displayOrder = displayOrder;
      if (status) size.status = status;

      const updatedSize = await size.save();
      res.json({ success: true, size: updatedSize });
    } else {
      res.status(404).json({ success: false, message: 'Size not found' });
    }
  } catch (error) {
    console.error('Error updating size:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating size' });
  }
};

// @desc    Delete a size
// @route   DELETE /api/sizes/:id
// @access  Private/Admin
export const deleteSize = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);

    if (size) {
      await Size.deleteOne({ _id: size._id });
      res.json({ success: true, message: 'Size removed' });
    } else {
      res.status(404).json({ success: false, message: 'Size not found' });
    }
  } catch (error) {
    console.error('Error deleting size:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting size' });
  }
};
