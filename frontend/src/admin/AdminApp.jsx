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
      className="d-flex min-vh-100 text-white" 
      style={{ 
        background: "#0b0f19",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Dynamic CSS styles for premium looks */}
      <style>{`
        .admin-sidebar {
          width: 260px;
          background: #111827;
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .admin-main {
          flex: 1;
          background: #0f172a;
        }
        .nav-item-btn {
          width: 100%;
          text-align: left;
          padding: 14px 20px;
          background: transparent;
          border: none;
          color: #9ca3af;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }
        .nav-item-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.03);
        }
        .nav-item-btn.active {
          color: #fff;
          background: #003087;
          border-left: 4px solid #3b82f6;
        }
        .stat-card {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 24px;
        }
        .table-premium {
          color: #e2e8f0;
          background: #1e293b;
          border-radius: 12px;
          overflow: hidden;
        }
        .table-premium th {
          background: #111827;
          color: #94a3b8;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .table-premium td {
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .form-control, .form-select {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
        }
        .form-control:focus, .form-select:focus {
          background: #1e293b;
          border-color: #3b82f6;
          color: #fff;
          box-shadow: none;
        }
        .custom-chart-bar {
          background: linear-gradient(180deg, #3b82f6 0%, #003087 100%);
          border-radius: 6px 6px 0 0;
          width: 32px;
          transition: height 0.6s ease;
        }
      `}</style>

      {/* Sidebar Navigation */}
      <aside className="admin-sidebar d-flex flex-column">
        <div className="p-4 border-bottom border-secondary border-opacity-10">
          <h4 className="font-instrument_serif text-white mb-0">Dermix Admin</h4>
          <span className="text-muted small">Control Center v1.2</span>
        </div>
        <nav className="flex-grow-1 py-3">
          <button className={`nav-item-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <i className="icon icon-Menu fs-18"></i> Dashboard
          </button>
          <button className={`nav-item-btn ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>
            <i className="icon icon-Box fs-18"></i> Categories
          </button>
          <button className={`nav-item-btn ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
            <i className="icon icon-ShoppingCart fs-18"></i> Products & Stock
          </button>
          <button className={`nav-item-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            <i className="icon icon-ShoppingBag fs-18"></i> Orders History
          </button>
          <button className={`nav-item-btn ${activeTab === "customers" ? "active" : ""}`} onClick={() => setActiveTab("customers")}>
            <i className="icon icon-UserCircle fs-18"></i> Customers
          </button>
          <button className={`nav-item-btn ${activeTab === "banners" ? "active" : ""}`} onClick={() => setActiveTab("banners")}>
            <i className="icon icon-Image fs-18"></i> Home Banners
          </button>
          <button className={`nav-item-btn ${activeTab === "videos" ? "active" : ""}`} onClick={() => setActiveTab("videos")}>
            <i className="icon icon-LogoInstagram fs-18"></i> Instagram Videos
          </button>
        </nav>
        <div className="p-4 border-top border-secondary border-opacity-10 d-grid gap-12">
          <Link to="/" className="btn btn-outline-light btn-sm text-start py-8">
            ← Main Shop
          </Link>
          <button onClick={logout} className="btn btn-danger btn-sm text-start py-8">
            Log Out Console
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
                            <div key={p._id} className="p-3 bg-dark bg-opacity-20 border border-danger border-opacity-20 rounded d-flex justify-content-between align-items-center">
                              <div>
                                <p className="mb-0 text-body-s fw-semibold text-white">{p.name}</p>
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
                              className="form-select form-select-sm w-auto bg-dark border-0 text-white" 
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
                              className="form-select form-select-sm w-auto bg-dark border-0 text-white" 
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
                              className="btn btn-sm btn-outline-info text-white"
                              style={{ backgroundColor: "#003087", borderColor: "#003087" }}
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
            className="card p-4 text-white border-0 shadow-lg" 
            style={{ 
              maxWidth: "550px", 
              width: "90%", 
              backgroundColor: "#1e293b", 
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <div className="d-flex justify-content-between mb-4">
              <h4 className="font-instrument_serif text-capitalize">{editingItem ? "Edit" : "Create"} {modalType}</h4>
              <button className="btn btn-close-popup text-white border-0 p-0 fs-20" onClick={() => setModalType("")}>×</button>
            </div>

            {/* Category Form */}
            {modalType === "category" && (
              <form onSubmit={saveCategory}>
                <div className="mb-3">
                  <label className="small block mb-8">Category Name</label>
                  <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="small block mb-8">Description</label>
                  <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                </div>
                <div className="mb-4">
                  <label className="small block mb-8">Category Image File</label>
                  <input type="file" className="form-control" onChange={(e) => setImageFiles(e.target.files)} />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-10" style={{ backgroundColor: "#003087" }}>
                  Save Category
                </button>
              </form>
            )}

            {/* Product Form */}
            {modalType === "product" && (
              <form onSubmit={saveProduct}>
                <div className="row">
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-8">Product Name</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-8">Category</label>
                    <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-8">MRP Price (₹)</label>
                    <input type="number" className="form-control" value={mrpPrice} onChange={(e) => setMrpPrice(e.target.value)} required />
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-8">Sale Price (₹)</label>
                    <input type="number" className="form-control" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required />
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-8">Initial Stock Qty</label>
                    <input type="number" className="form-control" value={qty} onChange={(e) => setQty(e.target.value)} required disabled={!!editingItem} />
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    <label className="small block mb-8">Benefit tag</label>
                    <input type="text" className="form-control" placeholder="e.g. Firming, Hydrating" value={benefit} onChange={(e) => setBenefit(e.target.value)} />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="small block mb-8">Description</label>
                    <textarea className="form-control" rows="2" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                  </div>
                  <div className="col-12 mb-4">
                    <label className="small block mb-8">Product Images Upload (Multiple files)</label>
                    <input type="file" className="form-control" multiple onChange={(e) => setImageFiles(e.target.files)} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 py-10" style={{ backgroundColor: "#003087" }}>
                  Save Product
                </button>
              </form>
            )}

            {/* Stock Adjustment Form */}
            {modalType === "stock" && (
              <form onSubmit={adjustStock}>
                <div className="mb-3">
                  <label className="small block mb-8">Current/New Total Quantity</label>
                  <input type="number" className="form-control" value={qty} onChange={(e) => setQty(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="small block mb-8">Adjustment Reason</label>
                  <input type="text" className="form-control" placeholder="e.g. Stock replenished, damage clearance" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-10" style={{ backgroundColor: "#003087" }}>
                  Apply Inventory Update
                </button>
              </form>
            )}

            {/* Banner Form */}
            {modalType === "banner" && (
              <form onSubmit={saveBanner}>
                <div className="mb-3">
                  <label className="small block mb-8">Banner Headline Title</label>
                  <input type="text" className="form-control" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="small block mb-8">Banner Background Image File</label>
                  <input type="file" className="form-control" onChange={(e) => setBannerFile(e.target.files[0])} />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-10" style={{ backgroundColor: "#003087" }}>
                  Save Banner
                </button>
              </form>
            )}

            {/* Instagram Video Form */}
            {modalType === "video" && (
              <form onSubmit={saveVideo}>
                <div className="mb-3">
                  <label className="small block mb-8">Spotlight Title</label>
                  <input type="text" className="form-control" placeholder="e.g. Cleansing Routine" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="small block mb-8">Iframe/Video Embedded Source URL</label>
                  <input type="url" className="form-control" placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-10" style={{ backgroundColor: "#003087" }}>
                  Save Video
                </button>
              </form>
            )}

            {/* Order Details Modal */}
            {modalType === "order-details" && editingItem && (
              <div>
                <div className="mb-3 text-white">
                  <h6 className="text-muted block mb-4 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px" }}>Customer Details</h6>
                  <p className="mb-1 text-body-s"><strong>Name:</strong> {editingItem.userId?.name || "N/A"}</p>
                  <p className="mb-1 text-body-s"><strong>Email:</strong> {editingItem.userId?.email || "N/A"}</p>
                  <p className="mb-0 text-body-s"><strong>Mobile:</strong> {editingItem.userId?.mobile || "N/A"}</p>
                </div>
                <div className="mb-3 text-white border-top border-light border-opacity-10 pt-3">
                  <h6 className="text-muted block mb-4 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px" }}>Shipping Address</h6>
                  <p className="mb-0 text-body-s">
                    {editingItem.addressId?.street1}<br />
                    {editingItem.addressId?.street2 && <>{editingItem.addressId.street2}<br /></>}
                    {editingItem.addressId?.district}, {editingItem.addressId?.state} - {editingItem.addressId?.pincode}<br />
                    {editingItem.addressId?.landmark && <>Landmark: {editingItem.addressId.landmark}</>}
                  </p>
                </div>
                <div className="mb-3 text-white border-top border-light border-opacity-10 pt-3">
                  <h6 className="text-muted block mb-4 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px" }}>Payment & Shipping Summary</h6>
                  <p className="mb-1 text-body-s"><strong>Total Amount:</strong> ₹{editingItem.totalPrice.toFixed(2)}</p>
                  <p className="mb-1 text-body-s"><strong>Payment Status:</strong> {editingItem.paymentStatus}</p>
                  <p className="mb-1 text-body-s"><strong>Delivery Status:</strong> {editingItem.deliveryStatus}</p>
                  <p className="mb-0 text-body-s"><strong>Transaction ID:</strong> {editingItem.transactionId || "None"}</p>
                </div>
                <div className="mb-4 text-white border-top border-light border-opacity-10 pt-3">
                  <h6 className="text-muted block mb-8 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px" }}>Ordered Products</h6>
                  <div className="d-grid gap-12" style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {editingItem.products?.map((item) => (
                      <div key={item._id} className="d-flex align-items-center justify-content-between p-2 bg-dark bg-opacity-20 rounded">
                        <div>
                          <p className="mb-1 text-body-s fw-semibold">{item.productId?.name || "Product"}</p>
                          <span className="text-body-xs text-muted">Size: {item.size} x {item.quantity}</span>
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
