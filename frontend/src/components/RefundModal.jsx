import React, { useState } from 'react';
import { API_BASE } from '../config';

export default function RefundModal({ order, onClose, onSuccess }) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [reason, setReason] = useState('Damaged Product');
  const [comments, setComments] = useState('');
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setError('You can only upload a maximum of 5 images.');
      return;
    }
    setImages([...images, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previewImages];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Please select a product for the refund.');
      return;
    }
    if (!reason) {
      setError('Please select a reason.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('orderId', order._id);
      formData.append('productId', selectedProduct);
      formData.append('reason', reason);
      formData.append('comments', comments);
      images.forEach((image) => {
        formData.append('images', image);
      });

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/api/refunds/request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onSuccess(data.message);
      } else {
        setError(data.message || 'Failed to submit refund request.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title font-instrument_serif">Request Return / Refund</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger p-2 mb-3 text-body-s">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-body-s mb-1">Select Product</label>
                <select
                  className="form-control text-body-s p-2"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                >
                  <option value="">-- Select Product --</option>
                  {order.products?.map((item) => (
                    <option key={item.productId?._id} value={item.productId?._id}>
                      {item.productId?.name} (Qty: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-body-s mb-1">Select Reason</label>
                <select
                  className="form-control text-body-s p-2"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="Damaged Product">Damaged Product</option>
                  <option value="Wrong Product">Wrong Product</option>
                  <option value="Missing Item">Missing Item</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-body-s mb-1">Additional Comments</label>
                <textarea
                  className="form-control text-body-s p-2"
                  rows="3"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label text-body-s mb-1">Upload Images (Optional, max 5)</label>
                <input
                  type="file"
                  className="form-control text-body-s p-2"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={images.length >= 5}
                />
                {previewImages.length > 0 && (
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {previewImages.map((src, index) => (
                      <div key={index} className="position-relative">
                        <img
                          src={src}
                          alt="Preview"
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <button
                          type="button"
                          className="btn-close position-absolute top-0 end-0 bg-white"
                          style={{ padding: '0.1rem', margin: '2px', width: '0.5em', height: '0.5em' }}
                          onClick={() => removeImage(index)}
                        ></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="button" className="tf-btn type-2 style-2 w-100 bg-secondary border-0" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="tf-btn type-2 style-2 w-100" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
