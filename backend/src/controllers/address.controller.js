import Address from '../models/Address.js';

// Get user addresses
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching addresses' });
  }
};

// Create Address
export const createAddress = async (req, res) => {
  const { street1, street2, district, state, pincode, landmark } = req.body;

  try {
    const address = await Address.create({
      userId: req.user._id,
      street1,
      street2,
      district,
      state,
      pincode,
      landmark,
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ success: false, message: 'Server error creating address' });
  }
};

// Update Address
export const updateAddress = async (req, res) => {
  const { street1, street2, district, state, pincode, landmark } = req.body;

  try {
    let address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Auth check
    if (address.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this address' });
    }

    const updates = { street1, street2, district, state, pincode, landmark };
    // Filter out undefined
    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    address = await Address.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ success: true, address });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ success: false, message: 'Server error updating address' });
  }
};

// Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Auth check
    if (address.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this address' });
    }

    await Address.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting address' });
  }
};
