import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE as API_BASE_CONFIG } from "../config";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Essentials,
  Bold,
  Italic,
  Font,
  Paragraph,
  List,
  Heading,
  Table,
  Undo,
  Link as CKLink,
  Image,
  ImageUpload
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

const profitData = [
  { name: 'W1', value: 20000 },
  { name: 'W2', value: 45000 },
  { name: 'W3', value: 40000 },
  { name: 'W4', value: 65000 },
  { name: 'W5', value: 60000 },
  { name: 'W6', value: 75000 },
  { name: 'W7', value: 85000 },
  { name: 'W8', value: 130000 },
];

const dailySalesData = [
  { day: '1', sales: 20 },
  { day: '2', sales: 22 },
  { day: '3', sales: 10 },
  { day: '4', sales: 28 },
  { day: '5', sales: 15 },
  { day: '6', sales: 21 },
  { day: '7', sales: 30 },
];

const topSellingProductsData = [
  { id: 1, name: "Hydrating Cleanser", category: "Skin Care", sales: 124, price: 499, stock: 45, image: "https://via.placeholder.com/40" },
  { id: 2, name: "Vitamin C Serum", category: "Serums", sales: 98, price: 899, stock: 12, image: "https://via.placeholder.com/40" },
  { id: 3, name: "Sunscreen SPF 50", category: "Sun Care", sales: 85, price: 650, stock: 30, image: "https://via.placeholder.com/40" },
  { id: 4, name: "Night Repair Cream", category: "Skin Care", sales: 74, price: 799, stock: 8, image: "https://via.placeholder.com/40" },
  { id: 5, name: "Exfoliating Scrub", category: "Body Care", sales: 62, price: 350, stock: 25, image: "https://via.placeholder.com/40" },
  { id: 6, name: "Anti-Aging Retinol", category: "Serums", sales: 50, price: 1299, stock: 15, image: "https://via.placeholder.com/40" },
  { id: 7, name: "Aloe Vera Gel", category: "Skin Care", sales: 42, price: 299, stock: 60, image: "https://via.placeholder.com/40" },
  { id: 8, name: "Charcoal Face Mask", category: "Face Masks", sales: 38, price: 599, stock: 22, image: "https://via.placeholder.com/40" },
];

export default function AdminApp() {
  const { user, login, logout, authFetch } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Auth local state for login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Global Admin State
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [videos, setVideos] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [refundSettings, setRefundSettings] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Pagination & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState(""); // "category", "product", "banner", "video", "stock"
  const [topSellingPage, setTopSellingPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [customersPage, setCustomersPage] = useState(1);
  const [bannersPage, setBannersPage] = useState(1);
  const [videosPage, setVideosPage] = useState(1);
  const [sizesPage, setSizesPage] = useState(1);
  const [refundsPage, setRefundsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Temporary item inputs
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [benefit, setBenefit] = useState("");
  const [mrpPrice, setMrpPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [qty, setQty] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerFile, setBannerFile] = useState(null);

  // Refund / Cancel States
  const [cancelReason, setCancelReason] = useState("");
  const [refundAmountInput, setRefundAmountInput] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // Size specific inputs
  const [sizeName, setSizeName] = useState("");
  const [sizeDisplayOrder, setSizeDisplayOrder] = useState(0);

  // Product sizes selection
  const [selectedSizes, setSelectedSizes] = useState([]);

  const API_BASE = `${API_BASE_CONFIG}/api`;

  // Check role & load initial dashboard stats
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchDashboardStats();
      fetchTabContent(activeTab);
    }
  }, [user, activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const res = await authFetch(`${API_BASE}/admin/stats`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const fetchTabContent = async (tab) => {
    setLoadingData(true);
    try {
      if (tab === "categories") {
        const res = await fetch(`${API_BASE}/categories?admin=true`);
        const data = await res.json();
        if (res.ok && data.success) setCategories(data.categories);
      } else if (tab === "products") {
        const res = await fetch(`${API_BASE}/products?admin=true&limit=100`);
        const data = await res.json();
        if (res.ok && data.success) setProducts(data.products);

        // Fetch categories and sizes to populate select fields
        const catRes = await fetch(`${API_BASE}/categories?admin=true`);
        const catData = await catRes.json();
        if (catRes.ok && catData.success) setCategories(catData.categories);

        const sizeRes = await fetch(`${API_BASE}/sizes`);
        const sizeData = await sizeRes.json();
        if (sizeRes.ok && sizeData.success) setSizes(sizeData.sizes);
      } else if (tab === "orders") {
        const res = await authFetch(`${API_BASE}/admin/orders`);
        const data = await res.json();
        if (res.ok && data.success) setOrders(data.orders);
      } else if (tab === "customers") {
        const res = await authFetch(`${API_BASE}/admin/customers`);
        const data = await res.json();
        if (res.ok && data.success) setCustomers(data.customers);
      } else if (tab === "banners") {
        const res = await fetch(`${API_BASE}/banners?admin=true`);
        const data = await res.json();
        if (res.ok && data.success) setBanners(data.banners);
      } else if (tab === "videos") {
        const res = await fetch(`${API_BASE}/instagram-videos?admin=true`);
        const data = await res.json();
        if (res.ok && data.success) setVideos(data.videos);
      } else if (tab === "sizes") {
        const res = await fetch(`${API_BASE}/sizes`);
        const data = await res.json();
        if (res.ok && data.success) setSizes(data.sizes);
      } else if (tab === "refunds") {
        const res = await authFetch(`${API_BASE}/refunds`);
        const data = await res.json();
        if (res.ok && data.success) setRefunds(data.refunds);
      } else if (tab === "refund-settings") {
        const res = await authFetch(`${API_BASE}/refunds/settings`);
        const data = await res.json();
        if (res.ok && data.success) setRefundSettings(data.settings);
      }
    } catch (err) {
      console.error(`Error loading tab ${tab}:`, err);
    } finally {
      setLoadingData(false);
    }
  };

  // Admin Login Submit
  const handleCancelOrder = async (orderId) => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason.");
      return;
    }
    try {
      const res = await authFetch(`${API_BASE}/refunds/order/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason: cancelReason })
      });
      const data = await res.json();
      if (data.success) {
        alert("Order cancelled successfully");
        setCancelReason("");
        setModalType("");
        fetchTabContent("orders");
      } else {
        alert(data.message || "Failed to cancel order");
      }
    } catch (err) {
      alert("Error cancelling order");
    }
  };

  const handleProcessRefund = async (order) => {
    if (!refundAmountInput || isNaN(refundAmountInput)) {
      alert("Please enter a valid refund amount");
      return;
    }
    try {
      const res = await authFetch(`${API_BASE}/refunds/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          refundAmount: Number(refundAmountInput),
          refundReason: refundReason || "Requested by admin",
          refundCharge: refundSettings?.processingFee || 0,
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Refund processed successfully!");
        setModalType("");
        fetchTabContent("orders");
        if (activeTab === "refunds") fetchTabContent("refunds");
      } else {
        alert(data.message || "Failed to process refund");
      }
    } catch (err) {
      alert("Error processing refund");
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await login(email, password);
      if (res && res.role !== "admin") {
        logout();
        setAuthError("Unauthorized. Only administrators are allowed access.");
      }
    } catch (err) {
      setAuthError(err.message || "Invalid credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Toggle statuses (active/inactive)
  const toggleStatus = async (type, id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    let endpoint = "";
    if (type === "category") endpoint = `${API_BASE}/categories/${id}/status`;
    else if (type === "product") endpoint = `${API_BASE}/products/${id}/status`;
    else if (type === "banner") endpoint = `${API_BASE}/admin/banners/${id}`;
    else if (type === "video") endpoint = `${API_BASE}/admin/instagram-videos/${id}`;
    else if (type === "size") endpoint = `${API_BASE}/sizes/${id}`;

    try {
      const res = await authFetch(endpoint, {
        method: type === "banner" || type === "video" ? "PUT" : "PATCH",
        body: JSON.stringify({ status: newStatus }),
        headers: type === "size" ? { "Content-Type": "application/json" } : undefined
      });
      if (res.ok) {
        fetchTabContent(activeTab);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Category CRUD
  const saveCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (imageFiles[0]) {
      formData.append("image", imageFiles[0]);
    }

    const url = editingItem
      ? `${API_BASE}/categories/${editingItem._id}`
      : `${API_BASE}/categories`;
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await authFetch(url, { method, body: formData });
      if (res.ok) {
        setEditingItem(null);
        setModalType("");
        fetchTabContent("categories");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await authFetch(`${API_BASE}/categories/${id}`, { method: "DELETE" });
      if (res.ok) fetchTabContent("categories");
    } catch (err) {
      console.error(err);
    }
  };

  // Product CRUD
  const saveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("benefit", benefit);
    formData.append("mrpPrice", mrpPrice);
    formData.append("salePrice", salePrice);
    formData.append("qty", qty);
    formData.append("categoryId", categoryId);
    formData.append("sizes", JSON.stringify(selectedSizes));

    // Append remaining images state on edit
    if (editingItem) {
      if (imageFiles && imageFiles.length > 0) {
        // If new images are chosen, replace old images entirely
        formData.append("remainingImages", JSON.stringify([]));
      } else {
        // If no new images are chosen, keep all current images
        formData.append("remainingImages", JSON.stringify(editingItem.images || []));
      }
    }

    // Append multiple files safely converting FileList
    if (imageFiles) {
      const filesArray = Array.from(imageFiles);
      for (const file of filesArray) {
        formData.append("images", file);
      }
    }

    const url = editingItem
      ? `${API_BASE}/products/${editingItem._id}`
      : `${API_BASE}/products`;
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await authFetch(url, { method, body: formData });
      if (res.ok) {
        setEditingItem(null);
        setModalType("");
        fetchTabContent("products");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save product.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving product.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await authFetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchTabContent("products");
    } catch (err) {
      console.error(err);
    }
  };

  // Stock inventory Adjustments
  const adjustStock = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API_BASE}/products/${editingItem._id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ qty: Number(qty), reason: description || "Manual admin adjustment" }),
      });
      if (res.ok) {
        setEditingItem(null);
        setModalType("");
        fetchTabContent("products");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Order status update
  const updateOrderStatus = async (orderId, updates) => {
    try {
      const res = await authFetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        fetchTabContent("orders");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Customer status (block/unblock)
  const toggleCustomer = async (customerId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "blocked" : "active";
    try {
      const res = await authFetch(`${API_BASE}/admin/customers/${customerId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchTabContent("customers");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Home Banner CRUD
  const saveBanner = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", bannerTitle);
    if (bannerFile) {
      formData.append("image", bannerFile);
    }

    const url = editingItem
      ? `${API_BASE}/admin/banners/${editingItem._id}`
      : `${API_BASE}/admin/banners`;
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await authFetch(url, { method, body: formData });
      if (res.ok) {
        setEditingItem(null);
        setModalType("");
        fetchTabContent("banners");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await authFetch(`${API_BASE}/admin/banners/${id}`, { method: "DELETE" });
      if (res.ok) fetchTabContent("banners");
    } catch (err) {
      console.error(err);
    }
  };

  // Instagram Video CRUD
  const saveVideo = async (e) => {
    e.preventDefault();
    const payload = { title: videoTitle, videoLink };
    const url = editingItem
      ? `${API_BASE}/admin/instagram-videos/${editingItem._id}`
      : `${API_BASE}/admin/instagram-videos`;
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingItem(null);
        setModalType("");
        fetchTabContent("videos");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video embed?")) return;
    try {
      const res = await authFetch(`${API_BASE}/admin/instagram-videos/${id}`, { method: "DELETE" });
      if (res.ok) fetchTabContent("videos");
    } catch (err) {
      console.error(err);
    }
  };

  // Size CRUD
  const saveSize = async (e) => {
    e.preventDefault();
    const payload = { name: sizeName, displayOrder: sizeDisplayOrder };
    const url = editingItem
      ? `${API_BASE}/sizes/${editingItem._id}`
      : `${API_BASE}/sizes`;
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingItem(null);
        setModalType("");
        fetchTabContent("sizes");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSize = async (id) => {
    if (!window.confirm("Are you sure you want to delete this size?")) return;
    try {
      const res = await authFetch(`${API_BASE}/sizes/${id}`, { method: "DELETE" });
      if (res.ok) fetchTabContent("sizes");
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger modal preparation
  const openModal = (type, item = null) => {
    setEditingItem(item);
    setModalType(type);
    if (type === "category") {
      setName(item ? item.name : "");
      setDescription(item ? item.description : "");
      setImageFiles([]);
    } else if (type === "product") {
      setName(item ? item.name : "");
      setDescription(item ? item.description : "");
      setBenefit(item ? item.benefit || "" : "");
      setMrpPrice(item ? item.mrpPrice : "");
      setSalePrice(item ? item.salePrice : "");
      setQty(item ? item.qty : "");
      setCategoryId(item ? item.categoryId?._id || item.categoryId || "" : "");
      setSelectedSizes(item && item.sizes ? item.sizes.map(s => {
        if (typeof s === 'string' || !s.size) {
          return { size: s._id || s, mrpPrice: item.mrpPrice, salePrice: item.salePrice };
        }
        return { size: s.size._id || s.size, mrpPrice: s.mrpPrice, salePrice: s.salePrice };
      }) : []);
      setImageFiles([]);
    } else if (type === "stock") {
      setQty(item ? item.qty : "");
      setDescription(""); // Reason field
    } else if (type === "banner") {
      setBannerTitle(item ? item.title : "");
      setBannerFile(null);
    } else if (type === "video") {
      setVideoTitle(item ? item.title : "");
      setVideoLink(item ? item.videoLink : "");
    } else if (type === "size") {
      setSizeName(item ? item.name : "");
      setSizeDisplayOrder(item ? item.displayOrder : 0);
    }
  };

  // Safe checks for stats
  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const lowStockCount = stats?.lowStockCount || 0;
  const activeCustomers = stats?.activeCustomers || 0;

  // Render Login View if not admin
  if (!user || user.role !== "admin") {
    return (
      <div
        className="d-flex align-items-center justify-content-center min-vh-100"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <div
          className="card p-5 border-0 shadow-lg"
          style={{
            maxWidth: "450px",
            width: "100%",
            borderRadius: "16px",
            backgroundColor: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <div className="text-center mb-4">
            <h2 className="font-instrument_serif text-white mb-2" style={{ letterSpacing: '1px' }}>Dermix Console</h2>
            <p className="text-light opacity-50 small">ADMINISTRATOR PORTAL SECURE ACCESS</p>
          </div>
          {authError && <div className="alert alert-danger p-3 mb-4 rounded border-0 text-center">{authError}</div>}
          <form onSubmit={handleAdminLogin}>
            <div className="mb-3">
              <label className="text-light small block mb-8 opacity-75">Admin Email</label>
              <input
                type="email"
                className="form-control bg-dark border-secondary text-white py-12"
                style={{ borderRadius: "8px" }}
                placeholder="admin@dermix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-light small block mb-8 opacity-75">Password</label>
              <input
                type="password"
                className="form-control bg-dark border-secondary text-white py-12"
                style={{ borderRadius: "8px" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 py-12 fw-semibold"
              style={{ borderRadius: "8px", backgroundColor: "#003087", borderColor: "#003087" }}
              disabled={authLoading}
            >
              {authLoading ? "Authenticating..." : "Sign In to Control Center"}
            </button>
          </form>
          <div className="text-center mt-4">
            <Link to="/" className="text-white text-decoration-underline opacity-50 hover-opacity-100 small">
              Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex min-vh-100 text-dark"
      style={{
        background: "#0b0f19",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Dynamic CSS styles for premium looks */}
      <style>{`
        .admin-sidebar {
          width: 280px;
          background: #ffffff;
          border-right: 1px solid #f1f5f9;
        }
        .admin-main {
          flex: 1;
          background: #f4f6f8;
        }
        .nav-item-btn {
          width: calc(100% - 32px);
          margin: 4px 16px;
          border-radius: 8px;
          text-align: left;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: #64748b;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }
        .nav-item-btn:hover {
          color: #9333ea;
          background: rgba(147, 51, 234, 0.05);
        }
        .nav-item-btn.active {
          color: #9333ea;
          background: rgba(147, 51, 234, 0.1);
        }
        .nav-item-btn .chevron-icon {
          margin-left: auto;
          display: none;
        }
        .nav-item-btn.active .chevron-icon {
          display: block;
        }
        .stat-card {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .stat-card .text-muted {
          color: #94a3b8 !important;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .stat-card h4 {
          color: #0f172a;
          font-weight: 800;
        }
        .table-premium {
          color: #334155;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
        }
        .table-premium th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f1f5f9;
          padding: 16px;
        }
        .table-premium td {
          border-bottom: 1px solid #f1f5f9;
          padding: 16px;
          vertical-align: middle;
        }
        .table-premium tr:hover {
          background-color: #f8fafc;
        }
        .form-control, .form-select {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          border-radius: 8px;
          padding: 10px 14px;
        }
        .form-control:focus, .form-select:focus {
          background: #ffffff;
          border-color: #9333ea;
          color: #0f172a;
          box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
        }
        .btn-primary {
          background-color: #9333ea;
          border-color: #9333ea;
          font-weight: 600;
          border-radius: 8px;
        }
        .btn-primary:hover {
          background-color: #7e22ce;
          border-color: #7e22ce;
        }
        .modal-content {
          border-radius: 16px;
          border: none;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .modal-header {
          border-bottom: 1px solid #f1f5f9;
          background-color: #ffffff;
          border-radius: 16px 16px 0 0;
        }
        .modal-body {
          background-color: #ffffff;
        }
        .modal-footer {
          border-top: 1px solid #f1f5f9;
          background-color: #f8fafc;
          border-radius: 0 0 16px 16px;
        }
        .modal-title {
          font-weight: 700;
          color: #0f172a;
        }
        .custom-chart-bar {
          background: #9333ea;
          border-radius: 6px 6px 0 0;
          width: 40px;
          transition: height 0.6s ease;
        }

      `}</style>

      {/* Sidebar Navigation */}
      <aside className="admin-sidebar d-flex flex-column shadow-sm">

        {/* Logo Section */}
        <div className="d-flex align-items-center justify-content-between p-4 mb-2">
          <div className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="d-flex align-items-center justify-content-center text-white rounded shadow-sm" style={{ width: 32, height: 32, backgroundColor: '#9333ea' }}>
              <i className="icon icon-Droplet fs-18"></i>
            </div>
            <span className="font-instrument_serif fs-4 fw-bold" style={{ color: '#0f172a', letterSpacing: '-0.5px' }}>Dermix</span>
          </div>
          <i className="icon icon-Menu fs-20 cursor-pointer" style={{ color: '#94a3b8' }}></i>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow-1 py-2 overflow-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="px-4 mb-2 mt-1">
            <span className="text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>- MAIN</span>
          </div>
          <button className={`nav-item-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <i className="icon icon-Menu fs-18"></i> Dashboard
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
          <button className={`nav-item-btn ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
            <i className="icon icon-Box fs-18"></i> Product
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
          <button className={`nav-item-btn ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>
            <i className="icon icon-List fs-18"></i> Categories
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>

          <div className="px-4 mb-2 mt-4">
            <span className="text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>- APPS</span>
          </div>
          <button className={`nav-item-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            <i className="icon icon-ShoppingBag fs-18"></i> Orders
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>

          <div className="mt-4 mb-2 ps-3 text-muted small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>
            Refund Management
          </div>
          <button className={`nav-item-btn ${activeTab === "refunds" ? "active" : ""}`} onClick={() => setActiveTab("refunds")}>
            <i className="icon icon-CreditCard fs-18"></i> Refunds Dashboard
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
          <button className={`nav-item-btn ${activeTab === "refund-settings" ? "active" : ""}`} onClick={() => setActiveTab("refund-settings")}>
            <i className="icon icon-Settings fs-18"></i> Refund Settings
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
          <button className={`nav-item-btn ${activeTab === "sizes" ? "active" : ""}`} onClick={() => setActiveTab("sizes")}>
            <i className="icon icon-SlidersHorizontal fs-18"></i> Sizes
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
          <button className={`nav-item-btn ${activeTab === "customers" ? "active" : ""}`} onClick={() => setActiveTab("customers")}>
            <i className="icon icon-UserCircle fs-18"></i> Customers
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
          <button className={`nav-item-btn ${activeTab === "banners" ? "active" : ""}`} onClick={() => setActiveTab("banners")}>
            <i className="icon icon-Image fs-18"></i> Home Banners
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
          <button className={`nav-item-btn ${activeTab === "videos" ? "active" : ""}`} onClick={() => setActiveTab("videos")}>
            <i className="icon icon-LogoInstagram fs-18"></i> Videos
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 mt-auto border-top" style={{ borderColor: '#f1f5f9' }}>
          <Link to="/" className="btn w-100 text-start mb-2 d-flex align-items-center gap-2" style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600' }}>
            <i className="icon icon-Storefront fs-16"></i> Switch to Store
          </Link>
          <button onClick={logout} className="btn w-100 text-start d-flex align-items-center gap-2" style={{ backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '13px', padding: '10px 16px', border: '1px solid #fee2e2', borderRadius: '8px', fontWeight: '600' }}>
            <i className="icon icon-LogOut fs-16"></i> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="admin-main p-5 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white shadow-sm rounded-3">
          <div className="d-flex align-items-center gap-3 w-50">
            <div className="input-group" style={{ maxWidth: '350px' }}>
              <span className="input-group-text bg-light border-0 text-muted px-3" style={{ borderRadius: '8px 0 0 8px' }}>
                <i className="icon icon-Search fs-16"></i>
              </span>
              <input type="text" className="form-control bg-light border-0 shadow-none ps-0" placeholder="Search..." style={{ borderRadius: '0 8px 8px 0', fontSize: '14px' }} />
            </div>
          </div>

          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center gap-3 text-muted">
              <i className="icon icon-Bell fs-20 cursor-pointer position-relative" style={{ color: '#64748b' }}>
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-white rounded-circle">
                  <span className="visually-hidden">New alerts</span>
                </span>
              </i>
              <i className="icon icon-ChatCircle fs-20 cursor-pointer" style={{ color: '#64748b' }}></i>
            </div>

            <div className="d-flex align-items-center gap-3 border-start ps-4" style={{ borderColor: '#f1f5f9' }}>
              <div className="d-flex flex-column text-end">
                <span className="fw-bold" style={{ color: '#0f172a', fontSize: '14px', letterSpacing: '0.2px' }}>{user.name}</span>
                <span className="text-muted" style={{ fontSize: '12px' }}>Admin Account</span>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm"
                style={{ width: '40px', height: '40px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#9333ea' }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {loadingData ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3">Loading dynamic data...</p>
          </div>
        ) : (
          <>
            {/* 1. Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div>
                <div className="row g-4 mt-1" style={{ marginBottom: '48px' }}>
                  <div className="col-6 col-md-4 col-lg-2">
                    <div className="stat-card p-4 d-flex flex-column justify-content-center h-100" style={{ borderRadius: '12px' }}>
                      <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Products</span>
                      <h4 className="text-dark fw-bold mt-2 mb-0" style={{ fontSize: '24px' }}>{stats?.totalProducts || 0}</h4>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 col-lg-3">
                    <div className="stat-card p-4 d-flex flex-column justify-content-center h-100" style={{ borderRadius: '12px' }}>
                      <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Sales</span>
                      <h4 className="text-dark fw-bold mt-2 mb-0" style={{ fontSize: '24px' }}>₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}</h4>
                    </div>
                  </div>
                  <div className="col-6 col-md-4 col-lg-2">
                    <div className="stat-card p-4 d-flex flex-column justify-content-center h-100" style={{ borderRadius: '12px' }}>
                      <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Orders</span>
                      <h4 className="text-dark fw-bold mt-2 mb-0" style={{ fontSize: '24px' }}>{totalOrders}</h4>
                    </div>
                  </div>
                  <div className="col-6 col-md-6 col-lg-2">
                    <div className="stat-card p-4 d-flex flex-column justify-content-center h-100" style={{ borderRadius: '12px' }}>
                      <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Customers</span>
                      <h4 className="text-dark fw-bold mt-2 mb-0" style={{ fontSize: '24px' }}>{activeCustomers}</h4>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="stat-card p-4 d-flex flex-column justify-content-center h-100" style={{ borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <span className="small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px', color: '#166534' }}>Estimated Profit</span>
                      <h4 className="fw-bold mt-2 mb-0" style={{ fontSize: '24px', color: '#15803d' }}>₹{(totalRevenue * 0.25).toLocaleString(undefined, { minimumFractionDigits: 0 })}</h4>
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  {/* Total Revenue */}
                  <div className="col-12 col-md-6">
                    <div className="stat-card h-100 d-flex flex-column justify-content-between p-3" style={{ borderRadius: '12px' }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>Total Revenue</span>
                          <h2 className="text-dark fw-bold mt-1" style={{ fontSize: '28px' }}>₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                        </div>
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: '#f97316', color: 'white', fontSize: '20px' }}>
                          <i className="icon icon-CurrencyDollar"></i>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-end mt-3">
                        <span className="text-muted small" style={{ fontSize: '12px' }}>Revenue increases this month</span>
                        <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '4px 8px', fontSize: '11px' }}><i className="icon icon-TrendingUp me-1"></i> 3.15%</span>
                      </div>
                    </div>
                  </div>

                  {/* Sales Overview */}
                  <div className="col-12 col-md-6">
                    <div className="stat-card h-100 d-flex flex-column justify-content-between p-3" style={{ backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '12px' }}>
                      <h6 className="fw-bold mb-3 text-white">Sales Overview</h6>
                      <div className="row g-2">
                        <div className="col-4">
                          <span className="small opacity-75" style={{ fontSize: '11px' }}>Total Sales</span>
                          <h4 className="fw-bold mt-1 text-white m-0">{totalOrders}</h4>
                        </div>
                        <div className="col-4">
                          <span className="small opacity-75" style={{ fontSize: '11px' }}>Monthly Sales</span>
                          <h4 className="fw-bold mt-1 text-white m-0">{stats?.todayOrders * 30 || 120}</h4>
                        </div>
                        <div className="col-4">
                          <span className="small opacity-75" style={{ fontSize: '11px' }}>Today's Sales</span>
                          <h4 className="fw-bold mt-1 text-white m-0">{stats?.todayOrders || 0}</h4>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.2)' }}>
                          <div className="progress-bar bg-white" style={{ width: '70%' }}></div>
                        </div>
                        <span className="small mt-2 d-block opacity-75">20% Increase in last month</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  {/* Profit Line Chart */}
                  <div className="col-12 col-lg-6">
                    <div className="stat-card h-100 p-4" style={{ borderRadius: '16px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="text-dark fw-bold mb-0">Profit</h5>
                        <select className="form-select form-select-sm w-auto border-0 text-muted shadow-none bg-transparent fw-semibold">
                          <option>Last Month</option>
                        </select>
                      </div>
                      <h3 className="text-dark fw-bold mb-4">₹{(totalRevenue * 0.4).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                      <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={profitData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} fill="url(#colorProfit)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Average Daily Sales Bar Chart */}
                  <div className="col-12 col-lg-6">
                    <div className="stat-card h-100 p-4" style={{ borderRadius: '16px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="text-dark fw-bold mb-0">Average Daily Sales</h5>
                        <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '6px 10px', fontSize: '11px' }}><i className="icon icon-TrendingUp me-1"></i> 5.25%</span>
                      </div>
                      <h3 className="text-dark fw-bold mb-4">₹{((totalRevenue / 30) || 5000).toLocaleString(undefined, { maximumFractionDigits: 0 })}+</h3>
                      <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dailySalesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" hide />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="sales" fill="#2dd4bf" radius={[4, 4, 0, 0]} maxBarSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  {/* Top Selling Products List */}
                  <div className="col-12 col-lg-8">
                    <div className="stat-card h-100 p-4" style={{ borderRadius: '16px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="text-dark fw-bold mb-0">Top Selling Products</h5>
                      </div>
                      <div className="table-responsive">
                        <table className="table table-premium mb-0">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Category</th>
                              <th>Price</th>
                              <th>Sales</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topSellingProductsData.slice((topSellingPage - 1) * 4, topSellingPage * 4).map((p) => (
                              <tr key={p.id} className="align-middle">
                                <td>
                                  <div className="d-flex align-items-center gap-3">
                                    <img src={p.image} alt={p.name} className="rounded object-fit-cover" width="40" height="40" style={{ backgroundColor: '#f8fafc' }} />
                                    <span className="fw-semibold text-dark">{p.name}</span>
                                  </div>
                                </td>
                                <td>{p.category}</td>
                                <td>₹{p.price}</td>
                                <td><span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1">{p.sales} Sales</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Pagination Controls */}
                      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <span className="text-muted small">Showing {(topSellingPage - 1) * 4 + 1} to {Math.min(topSellingPage * 4, topSellingProductsData.length)} of {topSellingProductsData.length} entries</span>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary px-3"
                            disabled={topSellingPage === 1}
                            onClick={() => setTopSellingPage(p => Math.max(1, p - 1))}
                          >
                            Prev
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary px-3"
                            disabled={topSellingPage >= Math.ceil(topSellingProductsData.length / 4)}
                            onClick={() => setTopSellingPage(p => p + 1)}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Warning List */}
                  <div className="col-12 col-lg-4">
                    <div className="stat-card h-100">
                      <h5 className="font-instrument_serif text-danger mb-4">Low Stock Warning</h5>
                      {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                        <div className="d-grid gap-12">
                          {stats.lowStockProducts.map((p) => (
                            <div key={p._id} className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-20 rounded d-flex justify-content-between align-items-center">
                              <div>
                                <p className="mb-0 text-body-s fw-semibold" style={{ color: '#0f172a' }}>{p.name}</p>
                                <span className="small text-muted">{p.categoryId?.name || "Skin Care"}</span>
                              </div>
                              <span className="badge bg-danger text-white">{p.qty} items left</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="small text-muted py-5 text-center">All products are healthy in inventory stock.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Categories Tab */}
            {activeTab === "categories" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={() => openModal("category")}>+ Add Category</button>
                </div>

                <div className="table-responsive">
                  <table className="table table-premium mb-0">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice((categoriesPage - 1) * ITEMS_PER_PAGE, categoriesPage * ITEMS_PER_PAGE)
                        .map((cat) => (
                          <tr key={cat._id} className="align-middle">
                            <td>
                              <img src={cat.image || "assets/images/collection/skincare.png"} alt={cat.name} width="50" height="50" style={{ objectFit: "cover", borderRadius: "4px" }} />
                            </td>
                            <td>{cat.name}</td>
                            <td>{cat.description}</td>
                            <td>
                              <button
                                className={`btn btn-sm ${cat.status === 'active' ? 'btn-success' : 'btn-secondary'}`}
                                onClick={() => toggleStatus("category", cat._id, cat.status)}
                              >
                                {cat.status}
                              </button>
                            </td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-info mr-2" onClick={() => {
                                openModal("category", cat);
                              }}>Edit</button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(cat._id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="text-muted small">
                    Showing {Math.min((categoriesPage - 1) * ITEMS_PER_PAGE + 1, categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length)} to {Math.min(categoriesPage * ITEMS_PER_PAGE, categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length)} of {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length} entries
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={categoriesPage === 1}
                      onClick={() => setCategoriesPage(p => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={categoriesPage >= Math.ceil(categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length / ITEMS_PER_PAGE)}
                      onClick={() => setCategoriesPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Products Tab */}
            {activeTab === "products" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={() => openModal("product")}>+ Add Product</button>
                </div>

                <div className="table-responsive">
                  <table className="table table-premium mb-0">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>MRP</th>
                        <th>Sale Price</th>
                        <th>Stock Qty</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice((productsPage - 1) * ITEMS_PER_PAGE, productsPage * ITEMS_PER_PAGE)
                        .map((prod) => (
                          <tr key={prod._id} className="align-middle">
                            <td>
                              <img src={prod.images[0] || "assets/images/products/serum_product.png"} alt={prod.name} width="50" height="50" style={{ objectFit: "cover", borderRadius: "4px" }} />
                            </td>
                            <td>{prod.name}</td>
                            <td>{prod.categoryId?.name || "Skin Care"}</td>
                            <td>₹{prod.mrpPrice}</td>
                            <td>₹{prod.salePrice}</td>
                            <td>
                              <span className={prod.qty < 10 ? 'text-danger fw-bold' : ''}>
                                {prod.qty} units
                              </span>
                              <button className="btn btn-sm btn-link text-info p-0 ml-10" onClick={() => openModal("stock", prod)}>Adjust</button>
                            </td>
                            <td>
                              <button
                                className={`btn btn-sm ${prod.status === 'active' ? 'btn-success' : 'btn-secondary'}`}
                                onClick={() => toggleStatus("product", prod._id, prod.status)}
                              >
                                {prod.status}
                              </button>
                            </td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-info mr-2" onClick={() => {
                                openModal("product", prod);
                              }}>Edit</button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(prod._id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="text-muted small">
                    Showing {Math.min((productsPage - 1) * ITEMS_PER_PAGE + 1, products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length)} to {Math.min(productsPage * ITEMS_PER_PAGE, products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length)} of {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length} entries
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={productsPage === 1}
                      onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={productsPage >= Math.ceil(products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length / ITEMS_PER_PAGE)}
                      onClick={() => setProductsPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Sizes Tab */}
            {activeTab === "sizes" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <button className="btn btn-primary" onClick={() => openModal("size")}>+ Add Size</button>
                </div>
                <div className="table-premium">
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Size Name</th>
                        <th>Display Order</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizes.slice((sizesPage - 1) * ITEMS_PER_PAGE, sizesPage * ITEMS_PER_PAGE).map((size) => (
                        <tr key={size._id}>
                          <td className="fw-bold">{size.name}</td>
                          <td>{size.displayOrder}</td>
                          <td>
                            <span className={`badge ${size.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {size.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-light me-2" onClick={() => toggleStatus("size", size._id, size.status)}>
                              <i className={`icon ${size.status === 'active' ? 'icon-EyeOff' : 'icon-Eye'} text-muted`}></i>
                            </button>
                            <button className="btn btn-sm btn-light me-2" onClick={() => openModal("size", size)}>
                              <i className="icon icon-Edit text-primary"></i>
                            </button>
                            <button className="btn btn-sm btn-light" onClick={() => deleteSize(size._id)}>
                              <i className="icon icon-Trash text-danger"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {sizes.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">No sizes found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Pagination for Sizes */}
                  {sizes.length > ITEMS_PER_PAGE && (
                    <div className="d-flex justify-content-between align-items-center p-3 border-top" style={{ backgroundColor: '#f8fafc' }}>
                      <span className="text-muted small">
                        Showing {(sizesPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(sizesPage * ITEMS_PER_PAGE, sizes.length)} of {sizes.length} entries
                      </span>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          disabled={sizesPage === 1}
                          onClick={() => setSizesPage(p => p - 1)}
                        >
                          Previous
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          disabled={sizesPage >= Math.ceil(sizes.length / ITEMS_PER_PAGE)}
                          onClick={() => setSizesPage(p => p + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <input
                  type="text"
                  className="form-control w-25 mb-3"
                  placeholder="Search order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className="table-responsive">
                  <table className="table table-premium mb-0">
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Customer</th>
                        <th>Total Amount</th>
                        <th>Payment Status</th>
                        <th>Delivery Status</th>
                        <th>Created At</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(o => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE)
                        .map((order) => (
                          <tr key={order._id} className="align-middle">
                            <td>{order.orderNumber}</td>
                            <td>{order.userId?.name} ({order.userId?.email})</td>
                            <td>₹{order.totalPrice.toFixed(2)}</td>
                            <td>
                              <select
                                className="form-select form-select-sm w-auto"
                                value={order.paymentStatus}
                                onChange={(e) => updateOrderStatus(order._id, { paymentStatus: e.target.value })}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Failed">Failed</option>
                              </select>
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm w-auto"
                                value={order.deliveryStatus}
                                onChange={(e) => updateOrderStatus(order._id, { deliveryStatus: e.target.value })}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Packed">Packed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out For Delivery">Out For Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  setEditingItem(order);
                                  setModalType("order-details");
                                }}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="text-muted small">
                    Showing {Math.min((ordersPage - 1) * ITEMS_PER_PAGE + 1, orders.filter(o => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())).length)} to {Math.min(ordersPage * ITEMS_PER_PAGE, orders.filter(o => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())).length)} of {orders.filter(o => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())).length} entries
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={ordersPage === 1}
                      onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={ordersPage >= Math.ceil(orders.filter(o => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())).length / ITEMS_PER_PAGE)}
                      onClick={() => setOrdersPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Refunds Tab */}
            {activeTab === "refunds" && (
              <div>
                <input
                  type="text"
                  className="form-control w-25 mb-3"
                  placeholder="Search refund ID or order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className="table-responsive">
                  <table className="table table-premium mb-0">
                    <thead>
                      <tr>
                        <th>Refund ID</th>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Refund Amount</th>
                        <th>Charges</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refunds
                        .filter(r => r.refund_id?.toLowerCase().includes(searchQuery.toLowerCase()) || r.order_id?.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice((refundsPage - 1) * ITEMS_PER_PAGE, refundsPage * ITEMS_PER_PAGE)
                        .map((refund) => (
                          <tr key={refund._id} className="align-middle">
                            <td>{refund.refund_id}</td>
                            <td>{refund.order_id?.orderNumber}</td>
                            <td>{refund.user_id?.name}</td>
                            <td className="text-primary fw-bold">₹{refund.refund_amount?.toFixed(2)}</td>
                            <td>₹{refund.refund_charge?.toFixed(2)}</td>
                            <td>
                              <span className={`badge bg-${refund.refund_status === 'Completed' ? 'success' : refund.refund_status === 'Failed' ? 'danger' : 'warning'}`}>
                                {refund.refund_status}
                              </span>
                            </td>
                            <td>{new Date(refund.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="text-muted small">
                    Showing {Math.min((refundsPage - 1) * ITEMS_PER_PAGE + 1, refunds.length)} to {Math.min(refundsPage * ITEMS_PER_PAGE, refunds.length)} of {refunds.length} entries
                  </span>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary px-3" disabled={refundsPage === 1} onClick={() => setRefundsPage(p => Math.max(1, p - 1))}>Prev</button>
                    <button className="btn btn-sm btn-outline-secondary px-3" disabled={refundsPage >= Math.ceil(refunds.length / ITEMS_PER_PAGE)} onClick={() => setRefundsPage(p => p + 1)}>Next</button>
                  </div>
                </div>
              </div>
            )}

            {/* Refund Settings Tab */}
            {activeTab === "refund-settings" && (
              <div className="card p-4 border-0 shadow-sm" style={{ maxWidth: '600px' }}>
                <h5 className="mb-4 font-instrument_serif">Refund Configuration</h5>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await authFetch(`${API_BASE}/refunds/settings`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(refundSettings)
                    });
                    const data = await res.json();
                    if (data.success) alert("Refund settings updated successfully!");
                  } catch (err) {
                    alert("Failed to update refund settings.");
                  }
                }}>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Default Refund Percentage (%)</label>
                    <input type="number" className="form-control" value={refundSettings?.defaultPercentage || ''} onChange={e => setRefundSettings({ ...refundSettings, defaultPercentage: Number(e.target.value) })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Fixed Refund Deduction (₹)</label>
                    <input type="number" className="form-control" value={refundSettings?.fixedDeduction || ''} onChange={e => setRefundSettings({ ...refundSettings, fixedDeduction: Number(e.target.value) })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Refund Processing Fee (₹)</label>
                    <input type="number" className="form-control" value={refundSettings?.processingFee || ''} onChange={e => setRefundSettings({ ...refundSettings, processingFee: Number(e.target.value) })} />
                  </div>
                  <div className="mb-3 form-check form-switch">
                    <input type="checkbox" className="form-check-input" checked={refundSettings?.fullRefundEnabled || false} onChange={e => setRefundSettings({ ...refundSettings, fullRefundEnabled: e.target.checked })} />
                    <label className="form-check-label fw-bold small">Enable Full Refunds</label>
                  </div>
                  <div className="mb-4 form-check form-switch">
                    <input type="checkbox" className="form-check-input" checked={refundSettings?.partialRefundEnabled || false} onChange={e => setRefundSettings({ ...refundSettings, partialRefundEnabled: e.target.checked })} />
                    <label className="form-check-label fw-bold small">Enable Partial Refunds</label>
                  </div>
                  <button type="submit" className="btn btn-primary px-4">Save Settings</button>
                </form>
              </div>
            )}

            {/* 5. Customers Tab */}
            {activeTab === "customers" && (
              <div>
                <input
                  type="text"
                  className="form-control w-25 mb-3"
                  placeholder="Search customer email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className="table-responsive">
                  <table className="table table-premium mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Verification</th>
                        <th>Registered Date</th>
                        <th className="text-end">Status Block Toggle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers
                        .filter(c => c.email.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice((customersPage - 1) * ITEMS_PER_PAGE, customersPage * ITEMS_PER_PAGE)
                        .map((cust) => (
                          <tr key={cust._id} className="align-middle">
                            <td>{cust.name}</td>
                            <td>{cust.email}</td>
                            <td>{cust.mobile}</td>
                            <td>
                              <span className={`badge ${cust.isVerified ? 'bg-success' : 'bg-warning'} text-white`}>
                                {cust.isVerified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td>{new Date(cust.createdAt).toLocaleDateString()}</td>
                            <td className="text-end">
                              <button
                                className={`btn btn-sm ${cust.status === 'active' ? 'btn-outline-danger' : 'btn-danger'}`}
                                onClick={() => toggleCustomer(cust._id, cust.status)}
                              >
                                {cust.status === 'active' ? 'Block Customer' : 'Unblock Customer'}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="text-muted small">
                    Showing {Math.min((customersPage - 1) * ITEMS_PER_PAGE + 1, customers.filter(c => c.email.toLowerCase().includes(searchQuery.toLowerCase())).length)} to {Math.min(customersPage * ITEMS_PER_PAGE, customers.filter(c => c.email.toLowerCase().includes(searchQuery.toLowerCase())).length)} of {customers.filter(c => c.email.toLowerCase().includes(searchQuery.toLowerCase())).length} entries
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={customersPage === 1}
                      onClick={() => setCustomersPage(p => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={customersPage >= Math.ceil(customers.filter(c => c.email.toLowerCase().includes(searchQuery.toLowerCase())).length / ITEMS_PER_PAGE)}
                      onClick={() => setCustomersPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Banners Tab */}
            {activeTab === "banners" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Dynamic Hero Banners Showcase list</span>
                  <button className="btn btn-primary" onClick={() => openModal("banner")}>+ Add Banner</button>
                </div>

                <div className="table-responsive">
                  <table className="table table-premium mb-0">
                    <thead>
                      <tr>
                        <th>Image Preview</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banners
                        .slice((bannersPage - 1) * ITEMS_PER_PAGE, bannersPage * ITEMS_PER_PAGE)
                        .map((b) => (
                          <tr key={b._id} className="align-middle">
                            <td>
                              <img src={b.image} alt={b.title} width="120" height="50" style={{ objectFit: "cover", borderRadius: "4px" }} />
                            </td>
                            <td>{b.title}</td>
                            <td>
                              <button
                                className={`btn btn-sm ${b.status === 'active' ? 'btn-success' : 'btn-secondary'}`}
                                onClick={() => toggleStatus("banner", b._id, b.status)}
                              >
                                {b.status}
                              </button>
                            </td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-info mr-2" onClick={() => openModal("banner", b)}>Edit</button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteBanner(b._id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="text-muted small">
                    Showing {Math.min((bannersPage - 1) * ITEMS_PER_PAGE + 1, banners.length)} to {Math.min(bannersPage * ITEMS_PER_PAGE, banners.length)} of {banners.length} entries
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={bannersPage === 1}
                      onClick={() => setBannersPage(p => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={bannersPage >= Math.ceil(banners.length / ITEMS_PER_PAGE)}
                      onClick={() => setBannersPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Instagram Videos Tab */}
            {activeTab === "videos" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Display videos on homepage community spotlight</span>
                  <button className="btn btn-primary" onClick={() => openModal("video")}>+ Add Video</button>
                </div>

                <div className="table-responsive">
                  <table className="table table-premium mb-0">
                    <thead>
                      <tr>
                        <th>Video Source</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos
                        .slice((videosPage - 1) * ITEMS_PER_PAGE, videosPage * ITEMS_PER_PAGE)
                        .map((vid) => (
                          <tr key={vid._id} className="align-middle">
                            <td>
                              <div className="ratio ratio-16x9" style={{ width: "120px" }}>
                                <iframe src={vid.videoLink} title={vid.title} style={{ border: 0 }}></iframe>
                              </div>
                            </td>
                            <td>{vid.title}</td>
                            <td>
                              <button
                                className={`btn btn-sm ${vid.status === 'active' ? 'btn-success' : 'btn-secondary'}`}
                                onClick={() => toggleStatus("video", vid._id, vid.status)}
                              >
                                {vid.status}
                              </button>
                            </td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-info mr-2" onClick={() => openModal("video", vid)}>Edit</button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteVideo(vid._id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <span className="text-muted small">
                    Showing {Math.min((videosPage - 1) * ITEMS_PER_PAGE + 1, videos.length)} to {Math.min(videosPage * ITEMS_PER_PAGE, videos.length)} of {videos.length} entries
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={videosPage === 1}
                      onClick={() => setVideosPage(p => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary px-3"
                      disabled={videosPage >= Math.ceil(videos.length / ITEMS_PER_PAGE)}
                      onClick={() => setVideosPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- CRUD MODALS / OVERLAYS (GLASSMORPHIC STYLING) --- */}
      {modalType && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 9999
          }}
        >
          <div
            className="card p-4 border-0 shadow-lg"
            style={{
              maxWidth: "550px",
              width: "90%",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #f1f5f9",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div className="d-flex justify-content-between mb-4">
              <h4 className="font-instrument_serif text-capitalize fw-bold" style={{ color: "#0f172a" }}>{editingItem ? "Edit" : "Create"} {modalType}</h4>
              <button className="btn btn-close-popup border-0 p-0 fs-20" style={{ color: "#0f172a" }} onClick={() => setModalType("")}>×</button>
            </div>

            {/* Category Form */}
            {modalType === "category" && (
              <form onSubmit={saveCategory}>
                <div className="mb-3">
                  <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Category Name</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Description</label>
                  <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                </div>
                <div className="mb-4">
                  <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Category Image File</label>
                  <input type="file" className="form-control" onChange={(e) => setImageFiles(e.target.files)} />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2">
                  Save Category
                </button>
              </form>
            )}

            {/* Product Form */}
            {modalType === "product" && (
              <form onSubmit={saveProduct}>
                <div className="row">
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Product Name</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Category</label>
                    <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>MRP Price (₹)</label>
                    <input type="number" className="form-control" value={mrpPrice} onChange={(e) => setMrpPrice(e.target.value)} required />
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Sale Price (₹)</label>
                    <input type="number" className="form-control" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required />
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Initial Stock Qty</label>
                    <input type="number" className="form-control" value={qty} onChange={(e) => setQty(e.target.value)} required disabled={!!editingItem} />
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Benefit tag</label>
                    <input type="text" className="form-control" placeholder="e.g. Firming, Hydrating" value={benefit} onChange={(e) => setBenefit(e.target.value)} />
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Product Sizes</label>
                    <div className="border rounded p-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {sizes.map(s => {
                        const isSelected = selectedSizes.some(obj => obj.size === s._id);
                        const selectedObj = selectedSizes.find(obj => obj.size === s._id) || { mrpPrice: '', salePrice: '' };
                        return (
                          <div key={s._id} className="form-check mb-2">
                            <input
                              className="form-check-input mt-2"
                              type="checkbox"
                              id={`size-${s._id}`}
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSizes([...selectedSizes, { size: s._id, mrpPrice: mrpPrice || 0, salePrice: salePrice || 0 }]);
                                } else {
                                  setSelectedSizes(selectedSizes.filter(obj => obj.size !== s._id));
                                }
                              }}
                            />
                            <label className="form-check-label d-flex align-items-center w-100" htmlFor={`size-${s._id}`}>
                              <span style={{ minWidth: '80px' }}>{s.name}</span>
                              {isSelected && (
                                <div className="d-flex ms-auto gap-2 align-items-center flex-wrap">
                                  <div className="input-group input-group-sm" style={{ minWidth: '100px', flex: 1 }}>
                                    <span className="input-group-text px-1">MRP</span>
                                    <input type="number" className="form-control px-1" value={selectedObj.mrpPrice} onChange={e => {
                                      setSelectedSizes(selectedSizes.map(obj => obj.size === s._id ? { ...obj, mrpPrice: e.target.value } : obj));
                                    }} />
                                  </div>
                                  <div className="input-group input-group-sm" style={{ minWidth: '100px', flex: 1 }}>
                                    <span className="input-group-text px-1">Sale</span>
                                    <input type="number" className="form-control px-1" value={selectedObj.salePrice} onChange={e => {
                                      setSelectedSizes(selectedSizes.map(obj => obj.size === s._id ? { ...obj, salePrice: e.target.value } : obj));
                                    }} />
                                  </div>
                                </div>
                              )}
                            </label>
                          </div>
                        )
                      })}
                      {sizes.length === 0 && <span className="text-muted small">No sizes available.</span>}
                    </div>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Description</label>
                    <div className="border rounded" style={{ minHeight: '200px' }}>
                      <CKEditor
                        editor={ClassicEditor}
                        config={{
                          licenseKey: 'GPL',
                          plugins: [Essentials, Bold, Italic, Font, Paragraph, List, Heading, Table, Undo, CKLink],
                          toolbar: ['heading', '|', 'bold', 'italic', 'fontColor', 'fontBackgroundColor', '|', 'bulletedList', 'numberedList', 'insertTable', 'link', 'undo', 'redo']
                        }}
                        data={description}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setDescription(data);
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-12 mb-4">
                    <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Product Images Upload (Multiple files)</label>
                    <input type="file" className="form-control" multiple onChange={(e) => setImageFiles(e.target.files)} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2">
                  Save Product
                </button>
              </form>
            )}

            {/* Size Form */}
            {modalType === "size" && (
              <form onSubmit={saveSize}>
                <div className="mb-3">
                  <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Size Name</label>
                  <input type="text" className="form-control" placeholder="e.g. 50g, Medium" value={sizeName} onChange={(e) => setSizeName(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Display Order</label>
                  <input type="number" className="form-control" value={sizeDisplayOrder} onChange={(e) => setSizeDisplayOrder(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2">
                  Save Size
                </button>
              </form>
            )}

            {/* Stock Adjustment Form */}
            {modalType === "stock" && (
              <form onSubmit={adjustStock}>
                <div className="mb-3">
                  <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Current/New Total Quantity</label>
                  <input type="number" className="form-control" value={qty} onChange={(e) => setQty(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Adjustment Reason</label>
                  <input type="text" className="form-control" placeholder="e.g. Stock replenished, damage clearance" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2">
                  Apply Inventory Update
                </button>
              </form>
            )}

            {/* Banner Form */}
            {modalType === "banner" && (
              <form onSubmit={saveBanner}>
                <div className="mb-3">
                  <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Banner Headline Title</label>
                  <input type="text" className="form-control" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Banner Background Image File</label>
                  <input type="file" className="form-control" onChange={(e) => setBannerFile(e.target.files[0])} />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2">
                  Save Banner
                </button>
              </form>
            )}

            {/* Instagram Video Form */}
            {modalType === "video" && (
              <form onSubmit={saveVideo}>
                <div className="mb-3">
                  <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Spotlight Title</label>
                  <input type="text" className="form-control" placeholder="e.g. Cleansing Routine" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Iframe/Video Embedded Source URL</label>
                  <input type="url" className="form-control" placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2">
                  Save Video
                </button>
              </form>
            )}

            {/* Order Details Modal */}
            {modalType === "order-details" && editingItem && (
              <div>
                <div className="mb-3" style={{ color: "#0f172a" }}>
                  <h6 className="block mb-2 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px", color: "#9333ea" }}>Customer Details</h6>
                  <p className="mb-1 text-body-s"><strong>Name:</strong> {editingItem.userId?.name || "N/A"}</p>
                  <p className="mb-1 text-body-s"><strong>Email:</strong> {editingItem.userId?.email || "N/A"}</p>
                  <p className="mb-0 text-body-s"><strong>Mobile:</strong> {editingItem.userId?.mobile || "N/A"}</p>
                </div>
                <div className="mb-3 border-top pt-3" style={{ color: "#0f172a", borderColor: "#f1f5f9" }}>
                  <h6 className="block mb-2 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px", color: "#9333ea" }}>Shipping Address</h6>
                  <p className="mb-0 text-body-s">
                    {editingItem.addressId?.street1}<br />
                    {editingItem.addressId?.street2 && <>{editingItem.addressId.street2}<br /></>}
                    {editingItem.addressId?.district}, {editingItem.addressId?.state} - {editingItem.addressId?.pincode}<br />
                    {editingItem.addressId?.landmark && <>Landmark: {editingItem.addressId.landmark}</>}
                  </p>
                </div>
                <div className="mb-3 border-top pt-3" style={{ color: "#0f172a", borderColor: "#f1f5f9" }}>
                  <h6 className="block mb-2 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px", color: "#9333ea" }}>Payment & Shipping Summary</h6>
                  <p className="mb-1 text-body-s"><strong>Total Amount:</strong> ₹{editingItem.totalPrice.toFixed(2)}</p>
                  <p className="mb-1 text-body-s"><strong>Payment Status:</strong> {editingItem.paymentStatus}</p>
                  <p className="mb-1 text-body-s"><strong>Delivery Status:</strong> {editingItem.deliveryStatus}</p>
                  <p className="mb-0 text-body-s"><strong>Transaction ID:</strong> {editingItem.transactionId || "None"}</p>
                </div>
                <div className="mb-4 border-top pt-3" style={{ color: "#0f172a", borderColor: "#f1f5f9" }}>
                  <h6 className="block mb-2 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px", color: "#9333ea" }}>Ordered Products</h6>
                  <div className="d-grid gap-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {editingItem.products?.map((item) => (
                      <div key={item._id} className="d-flex align-items-center justify-content-between p-2 rounded" style={{ backgroundColor: "#f8fafc" }}>
                        <div>
                          <p className="mb-1 text-body-s fw-semibold">{item.productId?.name || "Product"}</p>
                          <span className="small" style={{ color: "#64748b" }}>Size: {item.size} x {item.quantity}</span>
                        </div>
                        <span className="text-body-s fw-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-4 border-top pt-3" style={{ color: "#0f172a", borderColor: "#f1f5f9" }}>
                  <h6 className="block mb-2 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px", color: "#9333ea" }}>Order Actions</h6>

                  {['Pending', 'Processing', 'Confirmed'].includes(editingItem.deliveryStatus) && (
                    <div className="mb-3 p-3 bg-light rounded border">
                      <label className="form-label small fw-bold">Cancel Order</label>
                      <input
                        type="text"
                        className="form-control form-control-sm mb-2"
                        placeholder="Cancellation Reason..."
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                      />
                      <button className="btn btn-sm btn-danger w-100" onClick={() => handleCancelOrder(editingItem._id)}>
                        Cancel Order
                      </button>
                    </div>
                  )}

                  {editingItem.transactionId && !['Refunded', 'Processing'].includes(editingItem.refundStatus) && (
                    <div className="p-3 bg-light rounded border">
                      <label className="form-label small fw-bold">Process Refund</label>
                      <input
                        type="number"
                        className="form-control form-control-sm mb-2"
                        placeholder="Refund Amount (₹)"
                        value={refundAmountInput}
                        onChange={e => setRefundAmountInput(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm mb-2"
                        placeholder="Refund Reason"
                        value={refundReason}
                        onChange={e => setRefundReason(e.target.value)}
                      />
                      <button className="btn btn-sm btn-warning w-100" onClick={() => handleProcessRefund(editingItem)}>
                        Process Refund
                      </button>
                    </div>
                  )}

                  {editingItem.refundStatus && editingItem.refundStatus !== 'None' && (
                    <div className="mt-2 p-2 bg-light border rounded">
                      <p className="mb-1 small"><strong>Refund Status:</strong> {editingItem.refundStatus}</p>
                      <p className="mb-0 small"><strong>Refunded Amount:</strong> ₹{editingItem.refundAmount}</p>
                    </div>
                  )}
                </div>

                <button className="btn btn-secondary w-100 py-10 mt-2" onClick={() => {
                  setModalType("");
                  setCancelReason("");
                  setRefundAmountInput("");
                  setRefundReason("");
                }}>
                  Close Overview
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
