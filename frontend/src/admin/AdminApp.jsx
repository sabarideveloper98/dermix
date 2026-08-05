import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE as API_BASE_CONFIG } from "../config";

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
  const [loadingData, setLoadingData] = useState(false);

  // Form Modals / Inputs State
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState(""); // "category", "product", "banner", "video", "stock"

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

        // Fetch categories to populate select fields
        const catRes = await fetch(`${API_BASE}/categories?admin=true`);
        const catData = await catRes.json();
        if (catRes.ok && catData.success) setCategories(catData.categories);
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
      }
    } catch (err) {
      console.error(`Error loading tab ${tab}:`, err);
    } finally {
      setLoadingData(false);
    }
  };

  // Admin Login Submit
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

    try {
      const res = await authFetch(endpoint, {
        method: type === "banner" || type === "video" ? "PUT" : "PATCH",
        body: JSON.stringify({ status: newStatus }),
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
          background: #0b0f19;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .admin-main {
          flex: 1;
          background: #f8fafc;
        }
        .nav-item-btn {
          width: calc(100% - 32px);
          margin: 4px 16px;
          border-radius: 8px;
          text-align: left;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }
        .nav-item-btn:hover {
          color: #f8fafc;
          background: rgba(255,255,255,0.05);
        }
        .nav-item-btn.active {
          color: #fff;
          background: #9333ea; /* Purple 600 */
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
      <aside className="admin-sidebar d-flex flex-column">
        

        {/* Profile Card Section */}
        <div className="px-3 mb-2">
          <div className="rounded p-3 d-flex align-items-center gap-3" style={{ backgroundColor: '#1e293b' }}>
            <div className="rounded d-flex align-items-center justify-content-center fw-bold text-white" style={{ width: 36, height: 36, backgroundColor: '#9333ea', fontSize: '14px' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="text-white fw-bold" style={{ fontSize: '13px' }}>{user?.name || 'Administrator'}</div>
              <div style={{ color: '#9333ea', fontSize: '11px', fontWeight: '600' }}>Verified Shop Owner</div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow-1 py-2">
          <button className={`nav-item-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <i className="icon icon-Menu fs-18"></i> Analytics Dashboard
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
          <button className={`nav-item-btn ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
            <i className="icon icon-Box fs-18"></i> Products & Stock
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
          <button className={`nav-item-btn ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>
            <i className="icon icon-List fs-18"></i> Categories & Brands
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
          <button className={`nav-item-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            <i className="icon icon-ShoppingBag fs-18"></i> Order Management
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
            <i className="icon icon-LogoInstagram fs-18"></i> Instagram Videos
            <i className="icon icon-ChevronRight fs-16 chevron-icon"></i>
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 mt-auto">
          <Link to="/" className="btn w-100 text-start mb-2 d-flex align-items-center gap-2" style={{ backgroundColor: '#1e293b', color: '#94a3b8', fontSize: '13px', padding: '10px 16px', border: 'none', borderRadius: '8px' }}>
            <i className="icon icon-Storefront fs-16"></i> Switch to Customer Store
          </Link>
          <button onClick={logout} className="btn w-100 text-start d-flex align-items-center gap-2" style={{ backgroundColor: 'transparent', color: '#ef4444', fontSize: '13px', padding: '10px 16px', border: 'none' }}>
            <i className="icon icon-LogOut fs-16"></i> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="admin-main p-5 overflow-auto">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="font-instrument_serif text-capitalize">{activeTab} Manager</h2>
          <span className="text-muted small">Logged in: {user.name} ({user.email})</span>
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
                <div className="row g-4 mb-4">
                  <div className="col-12 col-md-4 col-lg-2">
                    <div className="stat-card h-100">
                      <span className="text-muted small block text-uppercase">TOTAL REVENUE</span>
                      <h4 className="font-instrument_serif text-success mt-2">₹{totalRevenue.toFixed(2)}</h4>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 col-lg-2">
                    <div className="stat-card h-100">
                      <span className="text-muted small block text-uppercase">TOTAL ORDERS</span>
                      <h4 className="font-instrument_serif text-white mt-2">{totalOrders}</h4>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 col-lg-2">
                    <div className="stat-card h-100">
                      <span className="text-muted small block text-uppercase">TODAY'S ORDERS</span>
                      <h4 className="font-instrument_serif text-warning mt-2">{stats?.todayOrders || 0}</h4>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 col-lg-2">
                    <div className="stat-card h-100">
                      <span className="text-muted small block text-uppercase">PENDING ORDERS</span>
                      <h4 className="font-instrument_serif text-info mt-2">{stats?.pendingOrders || 0}</h4>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 col-lg-2">
                    <div className="stat-card h-100">
                      <span className="text-muted small block text-uppercase">DELIVERED ORDERS</span>
                      <h4 className="font-instrument_serif text-success mt-2">{stats?.deliveredOrders || 0}</h4>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 col-lg-2">
                    <div className="stat-card h-100">
                      <span className="text-muted small block text-uppercase">CANCELLED ORDERS</span>
                      <h4 className="font-instrument_serif text-danger mt-2">{stats?.cancelledOrders || 0}</h4>
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  {/* Revenue Chart Section */}
                  <div className="col-12 col-lg-8">
                    <div className="stat-card h-100">
                      <h5 className="font-instrument_serif mb-4">Revenue Chart (Last 6 Months)</h5>
                      <span className="text-muted small">Monthly performance metrics</span>
                      <div className="d-flex align-items-end justify-content-between pt-5" style={{ height: "240px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <div className="d-flex flex-column align-items-center">
                          <div className="custom-chart-bar" style={{ height: "90px" }}></div>
                          <span className="small text-muted mt-2">March</span>
                        </div>
                        <div className="d-flex flex-column align-items-center">
                          <div className="custom-chart-bar" style={{ height: "130px" }}></div>
                          <span className="small text-muted mt-2">April</span>
                        </div>
                        <div className="d-flex flex-column align-items-center">
                          <div className="custom-chart-bar" style={{ height: "160px" }}></div>
                          <span className="small text-muted mt-2">May</span>
                        </div>
                        <div className="d-flex flex-column align-items-center">
                          <div className="custom-chart-bar" style={{ height: "120px" }}></div>
                          <span className="small text-muted mt-2">June</span>
                        </div>
                        <div className="d-flex flex-column align-items-center">
                          <div className="custom-chart-bar" style={{ height: "200px" }}></div>
                          <span className="small text-muted mt-2">July</span>
                        </div>
                        <div className="d-flex flex-column align-items-center">
                          <div className="custom-chart-bar" style={{ height: `${Math.min(220, (totalRevenue / 100000) * 220)}px` }}></div>
                          <span className="small text-muted mt-2">August</span>
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
                      {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((cat) => (
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
                      {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((prod) => (
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
                      {orders.filter(o => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())).map((order) => (
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
                      {customers.filter(c => c.email.toLowerCase().includes(searchQuery.toLowerCase())).map((cust) => (
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
                      {banners.map((b) => (
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
                      {videos.map((vid) => (
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
              border: "1px solid #f1f5f9"
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
                  <div className="col-12 mb-3">
                    <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Description</label>
                    <textarea className="form-control" rows="2" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
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
                <button className="btn btn-secondary w-100 py-10" onClick={() => setModalType("")}>
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
