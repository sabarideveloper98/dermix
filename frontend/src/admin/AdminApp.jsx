import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  FiGrid,
  FiBox,
  FiLayers,
  FiShoppingBag,
  FiRotateCcw,
  FiSettings,
  FiSliders,
  FiUsers,
  FiImage,
  FiVideo,
  FiLogOut,
  FiChevronRight,
  FiHome,
  FiStar,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiFileText,
  FiEdit3,
  FiUploadCloud,
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiMonitor,
  FiSmartphone
} from "react-icons/fi";
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
  const [showPassword, setShowPassword] = useState(false);
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
  const [isShippingPaid, setIsShippingPaid] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");
  // Home Banner States
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");
  const [bannerButtonText, setBannerButtonText] = useState("");
  const [bannerButtonLink, setBannerButtonLink] = useState("");
  const [bannerDisplayOrder, setBannerDisplayOrder] = useState(0);

  // Desktop Banner Image States
  const [desktopBannerFile, setDesktopBannerFile] = useState(null);
  const [desktopBannerPreview, setDesktopBannerPreview] = useState("");
  const [existingDesktopBanner, setExistingDesktopBanner] = useState("");
  const [removeDesktopBanner, setRemoveDesktopBanner] = useState(false);

  // Mobile Banner Image States
  const [mobileBannerFile, setMobileBannerFile] = useState(null);
  const [mobileBannerPreview, setMobileBannerPreview] = useState("");
  const [existingMobileBanner, setExistingMobileBanner] = useState("");
  const [removeMobileBanner, setRemoveMobileBanner] = useState(false);

  const [bannerError, setBannerError] = useState("");
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  // Desktop Banner Handlers
  const handleDesktopBannerSelected = (file) => {
    if (!file) return;
    setBannerError("");
    const validFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const isValidFormat =
      validFormats.includes(file.type?.toLowerCase() || "") ||
      /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!isValidFormat) {
      setBannerError("Desktop banner must be in JPG, JPEG, PNG, or WEBP format.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setBannerError("Desktop banner exceeds 10MB limit.");
      return;
    }

    if (desktopBannerPreview) {
      URL.revokeObjectURL(desktopBannerPreview);
    }
    setDesktopBannerFile(file);
    setDesktopBannerPreview(URL.createObjectURL(file));
    setRemoveDesktopBanner(false);
  };

  const handleRemoveDesktopBanner = () => {
    if (desktopBannerPreview) {
      URL.revokeObjectURL(desktopBannerPreview);
    }
    setDesktopBannerFile(null);
    setDesktopBannerPreview("");
    setRemoveDesktopBanner(true);
    setExistingDesktopBanner("");
  };

  // Mobile Banner Handlers
  const handleMobileBannerSelected = (file) => {
    if (!file) return;
    setBannerError("");
    const validFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const isValidFormat =
      validFormats.includes(file.type?.toLowerCase() || "") ||
      /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!isValidFormat) {
      setBannerError("Mobile banner must be in JPG, JPEG, PNG, or WEBP format.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setBannerError("Mobile banner exceeds 10MB limit.");
      return;
    }

    if (mobileBannerPreview) {
      URL.revokeObjectURL(mobileBannerPreview);
    }
    setMobileBannerFile(file);
    setMobileBannerPreview(URL.createObjectURL(file));
    setRemoveMobileBanner(false);
  };

  const handleRemoveMobileBanner = () => {
    if (mobileBannerPreview) {
      URL.revokeObjectURL(mobileBannerPreview);
    }
    setMobileBannerFile(null);
    setMobileBannerPreview("");
    setRemoveMobileBanner(true);
    setExistingMobileBanner("");
  };

  // Product Multiple Images States
  const [existingProductImages, setExistingProductImages] = useState([]);
  const [newProductFiles, setNewProductFiles] = useState([]);
  const [newProductPreviews, setNewProductPreviews] = useState([]);
  const [productImageError, setProductImageError] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Handle Product Images Selection
  const handleProductFilesSelected = (filesList) => {
    if (!filesList || filesList.length === 0) return;
    setProductImageError("");

    const validFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

    const filesToAdd = [];
    const previewsToAdd = [];
    const errorMsgs = [];

    Array.from(filesList).forEach((file) => {
      const isValidFormat =
        validFormats.includes(file.type.toLowerCase()) ||
        /\.(jpe?g|png|webp)$/i.test(file.name);

      if (!isValidFormat) {
        errorMsgs.push(`"${file.name}" has an unsupported format. Only JPG, JPEG, PNG, and WEBP are allowed.`);
        return;
      }

      if (file.size > maxSizeBytes) {
        errorMsgs.push(`"${file.name}" exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
        return;
      }

      // Avoid duplicate file names of exact same size
      const exists = newProductFiles.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (!exists) {
        filesToAdd.push(file);
        previewsToAdd.push(URL.createObjectURL(file));
      }
    });

    if (errorMsgs.length > 0) {
      setProductImageError(errorMsgs.join(" "));
    }

    if (filesToAdd.length > 0) {
      setNewProductFiles((prev) => [...prev, ...filesToAdd]);
      setNewProductPreviews((prev) => [...prev, ...previewsToAdd]);
    }
  };

  const removeExistingProductImage = (indexToRemove) => {
    setExistingProductImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeNewProductImage = (indexToRemove) => {
    if (newProductPreviews[indexToRemove]) {
      try {
        URL.revokeObjectURL(newProductPreviews[indexToRemove]);
      } catch (e) { }
    }
    setNewProductFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setNewProductPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const moveExistingImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= existingProductImages.length) return;
    setExistingProductImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  const moveNewImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= newProductFiles.length) return;
    setNewProductFiles((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
    setNewProductPreviews((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  // Refund / Cancel States
  const [cancelReason, setCancelReason] = useState("");
  const [refundAmountInput, setRefundAmountInput] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [isSyncingShiprocket, setIsSyncingShiprocket] = useState(false);

  // Size specific inputs
  const [sizeName, setSizeName] = useState("");
  const [sizeDisplayOrder, setSizeDisplayOrder] = useState(0);

  // Product sizes selection
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Product Details Tab Management States
  const [tabConfig, setTabConfig] = useState({
    descriptionEnabled: true,
    ingredientsEnabled: true,
    reviewsEnabled: true,
  });
  const [ingredients, setIngredients] = useState([]);

  // Review Moderation States
  const [adminReviews, setAdminReviews] = useState([]);
  const [reviewsFilter, setReviewsFilter] = useState("all");
  const [reviewsProductFilter, setReviewsProductFilter] = useState("all");
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [approvedReviewsCount, setApprovedReviewsCount] = useState(0);
  const [rejectedReviewsCount, setRejectedReviewsCount] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Product Content Management States
  const [selectedContentProductId, setSelectedContentProductId] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [contentIngredients, setContentIngredients] = useState([]);
  const [contentTabConfig, setContentTabConfig] = useState({
    descriptionEnabled: true,
    ingredientsEnabled: true,
    reviewsEnabled: true,
  });
  const [contentIngredientsImage, setContentIngredientsImage] = useState("");
  const [ingredientsImageFile, setIngredientsImageFile] = useState(null);
  const [ingredientsImagePreview, setIngredientsImagePreview] = useState("");
  const [removeIngredientsImage, setRemoveIngredientsImage] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [contentFeedback, setContentFeedback] = useState(null);

  // Synchronize Content Management fields when selected product changes
  useEffect(() => {
    if (products && products.length > 0) {
      const targetId = selectedContentProductId || products[0]._id;
      const prod = products.find(p => p._id === targetId);
      if (prod) {
        if (!selectedContentProductId) setSelectedContentProductId(prod._id);
        setContentDescription(prod.description || "");
        setContentTabConfig({
          descriptionEnabled: prod.tabConfig?.descriptionEnabled !== false,
          ingredientsEnabled: prod.tabConfig?.ingredientsEnabled !== false,
          reviewsEnabled: prod.tabConfig?.reviewsEnabled !== false,
        });
        const existingIngs = (prod.ingredients && prod.ingredients.length > 0)
          ? prod.ingredients
          : (prod.keyIngredients || []);
        setContentIngredients(existingIngs.map((ing, idx) => ({
          name: ing.name || "",
          percentage: ing.percentage || "",
          description: ing.description || "",
          order: ing.order !== undefined ? ing.order : idx,
        })));
        setContentIngredientsImage(prod.ingredientsImage || "");
        setIngredientsImageFile(null);
        setIngredientsImagePreview(prod.ingredientsImage || "");
        setRemoveIngredientsImage(false);
      }
    }
  }, [selectedContentProductId, products]);

  // Product Tab Image Management States
  const [selectedTabImageProductId, setSelectedTabImageProductId] = useState("");
  const [tabImagesSearch, setTabImagesSearch] = useState("");
  const [tabImagesData, setTabImagesData] = useState({
    howToUseImage: { url: "", file: null, preview: "", remove: false },
    whatItDoesImage: { url: "", file: null, preview: "", remove: false },
    ingredientsImage: { url: "", file: null, preview: "", remove: false },
  });
  const [savingTabImages, setSavingTabImages] = useState(false);
  const [tabImagesFeedback, setTabImagesFeedback] = useState(null);

  // Synchronize Tab Image Management fields when selected product changes
  useEffect(() => {
    if (products && products.length > 0) {
      const targetId = selectedTabImageProductId || products[0]._id;
      if (!selectedTabImageProductId) {
        setSelectedTabImageProductId(targetId);
      }
      const prod = products.find(p => p._id === targetId);
      if (prod) {
        setTabImagesData({
          howToUseImage: {
            url: prod.howToUseImage || "",
            file: null,
            preview: prod.howToUseImage || "",
            remove: false,
          },
          whatItDoesImage: {
            url: prod.whatItDoesImage || "",
            file: null,
            preview: prod.whatItDoesImage || "",
            remove: false,
          },
          ingredientsImage: {
            url: prod.ingredientsImage || "",
            file: null,
            preview: prod.ingredientsImage || "",
            remove: false,
          },
        });
      }
    }
  }, [selectedTabImageProductId, products]);

  // Lock body scroll and isolate mouse-wheel events when any admin modal is active
  useEffect(() => {
    if (modalType) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [modalType]);

  const API_BASE = `${API_BASE_CONFIG}`;

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
      // Also fetch pending reviews count for notification badge
      fetchAdminReviews();
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const fetchAdminReviews = async (statusFilter = reviewsFilter, productFilter = reviewsProductFilter) => {
    setReviewsLoading(true);
    try {
      const params = ['limit=100'];
      if (statusFilter && statusFilter !== 'all') {
        params.push(`status=${encodeURIComponent(statusFilter)}`);
      }
      if (productFilter && productFilter !== 'all') {
        params.push(`productId=${encodeURIComponent(productFilter)}`);
      }
      const url = `${API_BASE}/reviews/admin?${params.join('&')}`;
      const res = await authFetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminReviews(data.reviews || []);
        setPendingReviewsCount(data.pendingCount || 0);
        setApprovedReviewsCount(data.approvedCount || 0);
        setRejectedReviewsCount(data.rejectedCount || 0);
      }
    } catch (err) {
      console.error("Error loading reviews for admin:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleUpdateReviewStatus = async (id, status) => {
    try {
      const res = await authFetch(`${API_BASE}/reviews/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAdminReviews(reviewsFilter, reviewsProductFilter);
      } else {
        alert(data.message || "Failed to update review status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating review status");
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await authFetch(`${API_BASE}/reviews/admin/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchAdminReviews(reviewsFilter, reviewsProductFilter);
      } else {
        alert(data.message || "Failed to delete review");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting review");
    }
  };

  const handleIngredientsImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format: JPG, JPEG, PNG, WEBP
    const validFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validFormats.includes(file.type.toLowerCase())) {
      setContentFeedback({
        type: "danger",
        message: "Invalid file format. Only JPG, JPEG, PNG, and WEBP formats are supported.",
      });
      return;
    }

    // Validate size: Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setContentFeedback({
        type: "danger",
        message: "Image file size exceeds maximum limit of 10MB.",
      });
      return;
    }

    setIngredientsImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setIngredientsImagePreview(previewUrl);
    setRemoveIngredientsImage(false);
    setContentFeedback({
      type: "info",
      message: `Image ready: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB). Click "Save Product Content" to upload and save.`,
    });
  };

  const handleRemoveIngredientsImage = () => {
    setIngredientsImageFile(null);
    setIngredientsImagePreview("");
    setRemoveIngredientsImage(true);
    setContentFeedback({
      type: "warning",
      message: "Image marked for removal. Click \"Save Product Content\" to apply changes.",
    });
  };

  const saveProductContent = async (e) => {
    if (e) e.preventDefault();
    if (!selectedContentProductId) {
      alert("Please select a product first.");
      return;
    }

    const validIngredients = contentIngredients
      .filter(ing => ing && ing.name && ing.name.trim().length > 0)
      .map((ing, idx) => ({
        name: ing.name.trim(),
        percentage: ing.percentage ? ing.percentage.trim() : "",
        description: ing.description ? ing.description.trim() : "",
        order: ing.order !== undefined ? ing.order : idx,
      }));

    setSavingContent(true);
    setContentFeedback(null);

    try {
      const formData = new FormData();
      formData.append("description", contentDescription);
      formData.append("ingredients", JSON.stringify(validIngredients));
      formData.append("tabConfig", JSON.stringify(contentTabConfig));

      if (ingredientsImageFile) {
        formData.append("ingredientsImage", ingredientsImageFile);
      } else if (removeIngredientsImage) {
        formData.append("removeIngredientsImage", "true");
      }

      let res = await authFetch(`${API_BASE}/products/${selectedContentProductId}/content`, {
        method: 'PATCH',
        body: formData,
      });

      let data = await res.json().catch(() => ({}));

      // Fallback to standard product update endpoint if /content route is missing
      if (res.status === 404 || data.message === "API Route not found") {
        const currentProd = products.find(p => p._id === selectedContentProductId);
        if (currentProd?.images) {
          formData.append("remainingImages", JSON.stringify(currentProd.images));
        }

        res = await authFetch(`${API_BASE}/products/${selectedContentProductId}`, {
          method: 'PUT',
          body: formData,
        });
        data = await res.json().catch(() => ({}));
      }

      if (res.ok && data.success) {
        const updatedProduct = data.product;
        const newImg = updatedProduct?.ingredientsImage !== undefined
          ? updatedProduct.ingredientsImage
          : (removeIngredientsImage ? "" : (contentIngredientsImage || ""));

        setContentIngredientsImage(newImg);
        setIngredientsImagePreview(newImg);
        setIngredientsImageFile(null);
        setRemoveIngredientsImage(false);

        setContentFeedback({
          type: "success",
          message: "Product content (Description, Key Ingredients, Ingredients Section Image, and Tab Config) updated successfully!",
        });
        setProducts(prev => prev.map(p => p._id === selectedContentProductId ? {
          ...p,
          description: contentDescription,
          tabConfig: contentTabConfig,
          ingredients: validIngredients,
          keyIngredients: validIngredients,
          ingredientsImage: newImg,
        } : p));
      } else {
        setContentFeedback({
          type: "danger",
          message: data.message || "Failed to update product content.",
        });
      }
    } catch (err) {
      console.error("Error saving product content:", err);
      setContentFeedback({
        type: "danger",
        message: "An error occurred while saving product content.",
      });
    } finally {
      setSavingContent(false);
    }
  };

  const handleTabImageChange = (fieldName, file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setTabImagesFeedback({
        type: "danger",
        message: "Invalid file format. Only JPG, JPEG, PNG, and WEBP formats are supported.",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setTabImagesFeedback({
        type: "danger",
        message: "Image size exceeds maximum limit of 10MB.",
      });
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setTabImagesData(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        file,
        preview: previewUrl,
        remove: false,
      },
    }));
    setTabImagesFeedback(null);
  };

  const handleTabImageRemove = (fieldName) => {
    setTabImagesData(prev => ({
      ...prev,
      [fieldName]: {
        url: "",
        file: null,
        preview: "",
        remove: true,
      },
    }));
    setTabImagesFeedback(null);
  };

  const saveProductTabImages = async (e) => {
    if (e) e.preventDefault();
    if (!selectedTabImageProductId) {
      alert("Please select a product first.");
      return;
    }

    setSavingTabImages(true);
    setTabImagesFeedback(null);

    try {
      const formData = new FormData();

      // How to Use Image
      if (tabImagesData.howToUseImage.file) {
        formData.append("howToUseImage", tabImagesData.howToUseImage.file);
      } else if (tabImagesData.howToUseImage.remove) {
        formData.append("removeHowToUseImage", "true");
      }

      // What It Does Image
      if (tabImagesData.whatItDoesImage.file) {
        formData.append("whatItDoesImage", tabImagesData.whatItDoesImage.file);
      } else if (tabImagesData.whatItDoesImage.remove) {
        formData.append("removeWhatItDoesImage", "true");
      }

      // Ingredients Image
      if (tabImagesData.ingredientsImage.file) {
        formData.append("ingredientsImage", tabImagesData.ingredientsImage.file);
      } else if (tabImagesData.ingredientsImage.remove) {
        formData.append("removeIngredientsImage", "true");
      }

      const res = await authFetch(`${API_BASE}/products/${selectedTabImageProductId}/tab-images`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const returnedImages = data.tabImages || data.product || {};
        const newHowToUse = returnedImages.howToUseImage !== undefined ? returnedImages.howToUseImage : (tabImagesData.howToUseImage.remove ? "" : tabImagesData.howToUseImage.url);
        const newWhatItDoes = returnedImages.whatItDoesImage !== undefined ? returnedImages.whatItDoesImage : (tabImagesData.whatItDoesImage.remove ? "" : tabImagesData.whatItDoesImage.url);
        const newIngredients = returnedImages.ingredientsImage !== undefined ? returnedImages.ingredientsImage : (tabImagesData.ingredientsImage.remove ? "" : tabImagesData.ingredientsImage.url);

        setTabImagesData({
          howToUseImage: { url: newHowToUse, file: null, preview: newHowToUse, remove: false },
          whatItDoesImage: { url: newWhatItDoes, file: null, preview: newWhatItDoes, remove: false },
          ingredientsImage: { url: newIngredients, file: null, preview: newIngredients, remove: false },
        });

        // Update global products list so UI stays instantly synchronized
        setProducts(prev => prev.map(p => p._id === selectedTabImageProductId ? {
          ...p,
          howToUseImage: newHowToUse,
          whatItDoesImage: newWhatItDoes,
          ingredientsImage: newIngredients,
        } : p));

        setTabImagesFeedback({
          type: "success",
          message: "Product tab images saved successfully! Storefront will reflect the latest images.",
        });
      } else {
        setTabImagesFeedback({
          type: "danger",
          message: data.message || "Failed to update product tab images.",
        });
      }
    } catch (err) {
      console.error("Error saving tab images:", err);
      setTabImagesFeedback({
        type: "danger",
        message: "An error occurred while saving tab images. Please try again.",
      });
    } finally {
      setSavingTabImages(false);
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
        const res = await authFetch(`${API_BASE}/admin/refunds`);
        const data = await res.json();
        if (res.ok && data.success) setRefunds(data.refunds);
      } else if (tab === "refund-settings") {
        const res = await authFetch(`${API_BASE}/admin/refund-settings`);
        const data = await res.json();
        if (res.ok && data.success) setRefundSettings(data.settings);
      } else if (tab === "reviews") {
        await fetchAdminReviews();
      } else if (tab === "product-content" || tab === "product-tab-images") {
        const res = await fetch(`${API_BASE}/products?admin=true&limit=100`);
        const data = await res.json();
        if (res.ok && data.success) setProducts(data.products);
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

  const handleRetryShiprocketSync = async (orderId) => {
    setIsSyncingShiprocket(true);
    try {
      const res = await authFetch(`${API_BASE}/orders/${orderId}/sync-shiprocket`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "Order successfully synced to Shiprocket portal!");
        if (data.order) {
          setEditingItem(data.order);
        }
        fetchTabContent("orders");
      } else {
        alert(data.message || "Failed to sync order to Shiprocket");
        fetchTabContent("orders");
      }
    } catch (err) {
      console.error("Retry Shiprocket sync error:", err);
      alert(err.message || "Network error syncing with Shiprocket");
    } finally {
      setIsSyncingShiprocket(false);
    }
  };

  const handleMakeRefund = async (refund) => {
    const orderAmount = refund.orderId?.totalPrice || 0;
    const refundCharge = 50;
    const refundAmount = Math.max(0, orderAmount - refundCharge);

    if (orderAmount < 50) {
      alert("Refund cannot be processed because the order amount is less than the refund charge.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to refund this order?\n\nOrder Amount: ₹${orderAmount.toFixed(2)}\nRefund Charge: ₹${refundCharge.toFixed(2)}\nRefund Amount: ₹${refundAmount.toFixed(2)}`
    );

    if (!confirmed) return;

    try {
      const res = await authFetch(`${API_BASE}/admin/refunds/${refund.orderId?._id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Refund processed successfully!");
        fetchTabContent("refunds");
      } else {
        alert(data.message || "Failed to process refund.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing refund.");
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
    setProductImageError("");
    setIsSavingProduct(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("benefit", benefit);
    formData.append("mrpPrice", mrpPrice);
    formData.append("salePrice", salePrice);
    formData.append("qty", qty);
    formData.append("isShippingPaid", isShippingPaid);
    formData.append("categoryId", categoryId);
    formData.append("sizes", JSON.stringify(selectedSizes));
    formData.append("tabConfig", JSON.stringify(tabConfig));
    formData.append("ingredients", JSON.stringify(ingredients));

    // Append remaining images state on edit (preserves existing images and handles removals)
    if (editingItem) {
      formData.append("remainingImages", JSON.stringify(existingProductImages));
    }

    // Append multiple newly selected files
    if (newProductFiles && newProductFiles.length > 0) {
      for (const file of newProductFiles) {
        formData.append("images", file);
      }
    }

    const url = editingItem
      ? `${API_BASE}/products/${editingItem._id}`
      : `${API_BASE}/products`;
    const method = editingItem ? "PUT" : "POST";

    try {
      const res = await authFetch(url, { method, body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        newProductPreviews.forEach((previewUrl) => {
          try { URL.revokeObjectURL(previewUrl); } catch (e) { }
        });
        setExistingProductImages([]);
        setNewProductFiles([]);
        setNewProductPreviews([]);
        setProductImageError("");
        setEditingItem(null);
        setModalType("");
        fetchTabContent("products");
      } else {
        const errorMsg = data.message || "Failed to save product.";
        setProductImageError(errorMsg);
        alert(errorMsg);
      }
    } catch (err) {
      console.error("Error saving product:", err);
      setProductImageError("An error occurred while saving the product.");
      alert("Error saving product.");
    } finally {
      setIsSavingProduct(false);
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
      setIsShippingPaid(item ? item.isShippingPaid : false);
      setCategoryId(item ? item.categoryId?._id || item.categoryId || "" : "");
      setSelectedSizes(item && item.sizes ? item.sizes.map(s => {
        if (typeof s === 'string' || !s.size) {
          return { size: s._id || s, mrpPrice: item.mrpPrice, salePrice: item.salePrice };
        }
        return { size: s.size._id || s.size, mrpPrice: s.mrpPrice, salePrice: s.salePrice };
      }) : []);
      setTabConfig(item && item.tabConfig ? {
        descriptionEnabled: item.tabConfig.descriptionEnabled !== false,
        ingredientsEnabled: item.tabConfig.ingredientsEnabled !== false,
        reviewsEnabled: item.tabConfig.reviewsEnabled !== false,
      } : {
        descriptionEnabled: true,
        ingredientsEnabled: true,
        reviewsEnabled: true,
      });
      const modalIngs = (item && item.ingredients && item.ingredients.length > 0)
        ? item.ingredients
        : (item && item.keyIngredients ? item.keyIngredients : []);
      setIngredients(modalIngs.map(ing => ({
        name: ing.name || "",
        percentage: ing.percentage || "",
        description: ing.description || "",
      })));
      setImageFiles([]);

      // Initialize multiple product images state
      newProductPreviews.forEach((previewUrl) => {
        try { URL.revokeObjectURL(previewUrl); } catch (e) { }
      });
      const currentImgs = item && item.images
        ? (Array.isArray(item.images) ? [...item.images] : (typeof item.images === 'string' ? [item.images] : []))
        : [];
      setExistingProductImages(currentImgs);
      setNewProductFiles([]);
      setNewProductPreviews([]);
      setProductImageError("");
      setIsSavingProduct(false);
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
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control bg-dark border-secondary text-white py-12 pe-5"
                  style={{ borderRadius: "8px" }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="position-absolute top-50 translate-middle-y end-0 pe-3 bg-transparent border-0 text-secondary"
                  style={{ zIndex: 10, cursor: 'pointer', outline: 'none' }}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
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
            <FiGrid size={18} /> Dashboard
            <FiChevronRight size={16} className="chevron-icon" />
          </button>
          <button className={`nav-item-btn ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
            <FiBox size={18} /> Product
            <FiChevronRight size={16} className="chevron-icon" />
          </button>
          <button className={`nav-item-btn ${activeTab === "product-content" ? "active" : ""}`} onClick={() => setActiveTab("product-content")}>
            <FiFileText size={18} /> Product Content
            <FiChevronRight size={16} className="chevron-icon" />
          </button>
          <button className={`nav-item-btn ${activeTab === "product-tab-images" ? "active" : ""}`} onClick={() => setActiveTab("product-tab-images")}>
            <FiImage size={18} /> Product Tab Images
            <FiChevronRight size={16} className="chevron-icon" />
          </button>
          <button className={`nav-item-btn ${activeTab === "categories" ? "active" : ""}`} onClick={() => setActiveTab("categories")}>
            <FiLayers size={18} /> Categories
            <FiChevronRight size={16} className="chevron-icon" />
          </button>

          <div className="px-4 mb-2 mt-4">
            <span className="text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>- APPS</span>
          </div>
          <button className={`nav-item-btn ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            <FiShoppingBag size={18} /> Orders
            <FiChevronRight size={16} className="chevron-icon" />
          </button>
          <button className={`nav-item-btn ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>
            <FiStar size={18} /> Reviews
            {pendingReviewsCount > 0 && (
              <span className="badge bg-warning text-dark ms-auto me-2" style={{ fontSize: '10px', padding: '3px 6px', borderRadius: '10px' }}>
                {pendingReviewsCount}
              </span>
            )}
            <FiChevronRight size={16} className={`chevron-icon ${pendingReviewsCount > 0 ? '' : 'ms-auto'}`} />
          </button>

          <div className="mt-4 mb-2 ps-3 text-muted small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>
            Refund Management
          </div>
          <button className={`nav-item-btn ${activeTab === "refunds" ? "active" : ""}`} onClick={() => setActiveTab("refunds")}>
            <FiRotateCcw size={18} /> Refunds Dashboard
            <FiChevronRight size={16} className="chevron-icon" />
          </button>
          <button className={`nav-item-btn ${activeTab === "refund-settings" ? "active" : ""}`} onClick={() => setActiveTab("refund-settings")}>
            <FiSettings size={18} /> Refund Settings
            <FiChevronRight size={16} className="chevron-icon" />
          </button>
          <button className={`nav-item-btn ${activeTab === "sizes" ? "active" : ""}`} onClick={() => setActiveTab("sizes")}>
            <FiSliders size={18} /> Sizes
            <FiChevronRight size={16} className="chevron-icon" />
          </button>
          <button className={`nav-item-btn ${activeTab === "customers" ? "active" : ""}`} onClick={() => setActiveTab("customers")}>
            <FiUsers size={18} /> Customers
            <FiChevronRight size={16} className="chevron-icon" />
          </button>
          <button className={`nav-item-btn ${activeTab === "banners" ? "active" : ""}`} onClick={() => setActiveTab("banners")}>
            <FiImage size={18} /> Home Banners
            <FiChevronRight size={16} className="chevron-icon" />
          </button>
          <button className={`nav-item-btn ${activeTab === "videos" ? "active" : ""}`} onClick={() => setActiveTab("videos")}>
            <FiVideo size={18} /> Videos
            <FiChevronRight size={16} className="chevron-icon" />
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 mt-auto border-top" style={{ borderColor: '#f1f5f9' }}>
          <Link to="/" className="btn w-100 text-start mb-2 d-flex align-items-center gap-2" style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600' }}>
            <FiHome size={16} /> Switch to Store
          </Link>
          <button onClick={logout} className="btn w-100 text-start d-flex align-items-center gap-2" style={{ backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '13px', padding: '10px 16px', border: '1px solid #fee2e2', borderRadius: '8px', fontWeight: '600' }}>
            <FiLogOut size={16} /> Sign Out
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
                        <th>Tabs Config</th>
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
                              <div className="d-flex flex-column gap-1" style={{ fontSize: '11px', minWidth: '110px' }}>
                                <span className={`badge ${prod.tabConfig?.descriptionEnabled !== false ? 'bg-success text-white' : 'bg-secondary text-white'}`} style={{ fontSize: '10px' }}>
                                  Desc: {prod.tabConfig?.descriptionEnabled !== false ? 'ON' : 'OFF'}
                                </span>
                                <span className={`badge ${prod.tabConfig?.ingredientsEnabled !== false ? 'bg-success text-white' : 'bg-secondary text-white'}`} style={{ fontSize: '10px' }}>
                                  Ingr ({prod.ingredients?.length || 0}): {prod.tabConfig?.ingredientsEnabled !== false ? 'ON' : 'OFF'}
                                </span>
                                <span className={`badge ${prod.tabConfig?.reviewsEnabled !== false ? 'bg-success text-white' : 'bg-secondary text-white'}`} style={{ fontSize: '10px' }}>
                                  Reviews: {prod.tabConfig?.reviewsEnabled !== false ? 'ON' : 'OFF'}
                                </span>
                              </div>
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
                              <button className="btn btn-sm btn-outline-primary mr-2" onClick={() => {
                                setSelectedContentProductId(prod._id);
                                setActiveTab("product-content");
                              }} title="Manage Description and Key Ingredients">Content</button>
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

            {/* Product Content Management Tab */}
            {activeTab === "product-content" && (() => {
              const selectedProduct = products.find(p => p._id === selectedContentProductId) || products[0] || null;

              return (
                <div className="product-content-management">
                  {/* Header Bar */}
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 p-3 bg-white rounded shadow-sm border">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <FiFileText size={22} className="text-primary" />
                        <h4 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Product Content Management</h4>
                      </div>
                      <p className="text-muted small mb-0 mt-1">
                        Manage rich Product Description and dynamic Key Ingredients separately for each product
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {selectedContentProductId && (
                        <a
                          href={`/ProductDetails?id=${selectedContentProductId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                          title="Open storefront product page in a new tab"
                        >
                          <FiHome size={14} /> View Storefront
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
                        onClick={saveProductContent}
                        disabled={savingContent || !selectedContentProductId}
                      >
                        {savingContent ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiCheck size={16} /> Save Product Content
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Feedback Banner */}
                  {contentFeedback && (
                    <div className={`alert alert-${contentFeedback.type} alert-dismissible fade show d-flex align-items-center justify-content-between mb-4`} role="alert">
                      <div>
                        {contentFeedback.type === "success" ? <FiCheck className="me-2" /> : <FiX className="me-2" />}
                        {contentFeedback.message}
                      </div>
                      <button type="button" className="btn-close" onClick={() => setContentFeedback(null)} aria-label="Close"></button>
                    </div>
                  )}

                  {/* Step 1: Product Selector Card */}
                  <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: "11px" }}>Step 1</span>
                        <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Select Product to Manage</h6>
                      </div>
                      {selectedProduct && (
                        <span className="badge bg-light text-dark border" style={{ fontSize: "11px" }}>
                          ID: {selectedProduct._id}
                        </span>
                      )}
                    </div>
                    <div className="card-body p-3">
                      <div className="row align-items-center">
                        <div className="col-12 col-md-7 mb-2 mb-md-0">
                          <label className="small fw-bold text-muted mb-1 block">Choose Product from Catalog</label>
                          <select
                            className="form-select form-select-lg"
                            value={selectedContentProductId}
                            onChange={(e) => {
                              setSelectedContentProductId(e.target.value);
                              setContentFeedback(null);
                            }}
                            style={{ fontSize: "15px", fontWeight: "500" }}
                          >
                            <option value="">-- Choose a product ({products.length} available) --</option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} — ₹{p.salePrice} ({p.categoryId?.name || "General"})
                              </option>
                            ))}
                          </select>
                        </div>
                        {selectedProduct && (
                          <div className="col-12 col-md-5">
                            <div className="d-flex align-items-center gap-3 p-2 bg-light rounded border">
                              <img
                                src={selectedProduct.images?.[0] || "assets/images/products/serum_product.png"}
                                alt={selectedProduct.name}
                                style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                              />
                              <div className="overflow-hidden">
                                <div className="fw-bold text-truncate" style={{ fontSize: "14px", color: "#0f172a" }}>
                                  {selectedProduct.name}
                                </div>
                                <div className="small text-muted">
                                  ₹{selectedProduct.salePrice} &bull; Stock: {selectedProduct.qty} units &bull; {selectedProduct.categoryId?.name || "Skin Care"}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedContentProductId ? (
                    <div className="row g-4">
                      {/* Section 1: Product Description */}
                      <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                          <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: "11px" }}>Section 1</span>
                                <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Product Description Management</h6>
                              </div>
                              <small className="text-muted">
                                Enter and format complete product description (supports paragraphs, headings, bold text, lists, and line breaks).
                              </small>
                            </div>
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                              Rich Text Formatter
                            </span>
                          </div>
                          <div className="card-body p-3">
                            <div className="border rounded overflow-hidden" style={{ minHeight: "260px" }}>
                              <CKEditor
                                editor={ClassicEditor}
                                config={{
                                  licenseKey: "GPL",
                                  plugins: [Essentials, Bold, Italic, Font, Paragraph, List, Heading, Table, Undo, CKLink],
                                  toolbar: [
                                    "heading",
                                    "|",
                                    "bold",
                                    "italic",
                                    "fontColor",
                                    "fontBackgroundColor",
                                    "|",
                                    "bulletedList",
                                    "numberedList",
                                    "insertTable",
                                    "link",
                                    "undo",
                                    "redo",
                                  ],
                                }}
                                data={contentDescription}
                                onChange={(event, editor) => {
                                  setContentDescription(editor.getData());
                                }}
                              />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <small className="text-muted">
                                Content is automatically saved against product ID: <code>{selectedContentProductId}</code>
                              </small>
                              <small className="text-muted">
                                {contentDescription.replace(/<[^>]*>/g, "").length} characters
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Key Ingredients */}
                      <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                          <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: "11px" }}>Section 2</span>
                                <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Key Ingredients – Multiple Add Option</h6>
                              </div>
                              <small className="text-muted">
                                Add multiple dynamic ingredients with Name (required), optional Percentage/Quantity, and Description.
                              </small>
                            </div>

                            <button
                              type="button"
                              className="btn btn-sm btn-primary d-flex align-items-center gap-1 px-3 py-1 fw-semibold"
                              onClick={() => {
                                setContentIngredients([
                                  ...contentIngredients,
                                  { name: "", percentage: "", description: "" },
                                ]);
                              }}
                            >
                              <FiPlus size={16} /> Add Ingredient
                            </button>
                          </div>

                          <div className="card-body p-3">
                            {contentIngredients.length === 0 ? (
                              <div className="text-center p-4 bg-light rounded border border-dashed">
                                <FiLayers size={36} className="text-muted mb-2" />
                                <h6 className="fw-bold mb-1" style={{ color: "#334155" }}>No Ingredients Added Yet</h6>
                                <p className="text-muted small mb-3">
                                  Add dynamic key ingredients for this product to display in the &quot;Ingredient Facts&quot; section.
                                </p>
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                                  onClick={() => {
                                    setContentIngredients([
                                      { name: "", percentage: "", description: "" },
                                    ]);
                                  }}
                                >
                                  <FiPlus size={14} /> Add First Ingredient
                                </button>
                              </div>
                            ) : (
                              <div className="d-flex flex-column gap-3">
                                {contentIngredients.map((ing, idx) => (
                                  <div
                                    key={idx}
                                    className="p-3 bg-white rounded border shadow-sm position-relative"
                                    style={{ borderLeft: "4px solid #4f46e5" }}
                                  >
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                      <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-dark text-white rounded-pill px-2" style={{ fontSize: "11px" }}>
                                          Ingredient #{idx + 1}
                                        </span>
                                        {ing.name && (
                                          <span className="fw-bold" style={{ fontSize: "14px", color: "#1e293b" }}>
                                            {ing.name} {ing.percentage ? `(${ing.percentage})` : ""}
                                          </span>
                                        )}
                                      </div>

                                      <div className="d-flex align-items-center gap-1">
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-secondary px-2 py-1"
                                          disabled={idx === 0}
                                          onClick={() => {
                                            if (idx === 0) return;
                                            const updated = [...contentIngredients];
                                            const temp = updated[idx];
                                            updated[idx] = updated[idx - 1];
                                            updated[idx - 1] = temp;
                                            setContentIngredients(updated);
                                          }}
                                          title="Move Up"
                                        >
                                          ↑
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-secondary px-2 py-1"
                                          disabled={idx === contentIngredients.length - 1}
                                          onClick={() => {
                                            if (idx === contentIngredients.length - 1) return;
                                            const updated = [...contentIngredients];
                                            const temp = updated[idx];
                                            updated[idx] = updated[idx + 1];
                                            updated[idx + 1] = temp;
                                            setContentIngredients(updated);
                                          }}
                                          title="Move Down"
                                        >
                                          ↓
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 px-2 py-1"
                                          onClick={() => {
                                            setContentIngredients(contentIngredients.filter((_, i) => i !== idx));
                                          }}
                                          title="Remove this ingredient"
                                        >
                                          <FiTrash2 size={13} /> Remove
                                        </button>
                                      </div>
                                    </div>

                                    <div className="row g-2 mb-2">
                                      <div className="col-12 col-md-7">
                                        <label className="small fw-semibold text-muted mb-1 block">
                                          Ingredient Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="e.g. Ectoin, Niacinamide, Tranexamic Acid"
                                          value={ing.name}
                                          onChange={(e) => {
                                            const updated = [...contentIngredients];
                                            updated[idx].name = e.target.value;
                                            setContentIngredients(updated);
                                          }}
                                          required
                                        />
                                      </div>
                                      <div className="col-12 col-md-5">
                                        <label className="small fw-semibold text-muted mb-1 block">
                                          Percentage / Quantity <span className="text-muted fw-normal">(Optional)</span>
                                        </label>
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="e.g. 2%, 10%, 500mg, or leave blank"
                                          value={ing.percentage}
                                          onChange={(e) => {
                                            const updated = [...contentIngredients];
                                            updated[idx].percentage = e.target.value;
                                            setContentIngredients(updated);
                                          }}
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="small fw-semibold text-muted mb-1 block">
                                        Ingredient Description &amp; Benefits <span className="text-muted fw-normal">(Explains active benefits on customer page)</span>
                                      </label>
                                      <textarea
                                        rows={2}
                                        className="form-control"
                                        placeholder="e.g. A naturally derived extremolyte used in skincare for its skin-protective and hydration-supporting properties."
                                        value={ing.description || ""}
                                        onChange={(e) => {
                                          const updated = [...contentIngredients];
                                          updated[idx].description = e.target.value;
                                          setContentIngredients(updated);
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}

                                <div className="d-flex justify-content-between align-items-center pt-2">
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                                    onClick={() => {
                                      setContentIngredients([
                                        ...contentIngredients,
                                        { name: "", percentage: "", description: "" },
                                      ]);
                                    }}
                                  >
                                    <FiPlus size={14} /> Add Another Ingredient
                                  </button>
                                  <span className="text-muted small">
                                    Total: {contentIngredients.length} ingredient{contentIngredients.length === 1 ? "" : "s"} &bull; Order preserved
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Ingredients Section Image */}
                      <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                          <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: "11px" }}>Section 3</span>
                                <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Ingredients Section Image</h6>
                              </div>
                              <small className="text-muted">
                                Upload an image displayed in the Ingredients section on the customer product details page.
                              </small>
                            </div>
                            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: "11px" }}>
                              JPG, JPEG, PNG, WEBP (Max 10MB)
                            </span>
                          </div>

                          <div className="card-body p-4">
                            {ingredientsImagePreview ? (
                              <div className="d-flex flex-column flex-md-row gap-4 align-items-start">
                                <div
                                  className="position-relative border rounded p-2 bg-light shadow-sm"
                                  style={{
                                    maxWidth: "380px",
                                    width: "100%",
                                    textAlign: "center",
                                    borderRadius: "10px",
                                  }}
                                >
                                  <img
                                    src={ingredientsImagePreview}
                                    alt="Ingredients section preview"
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "260px",
                                      width: "auto",
                                      height: "auto",
                                      objectFit: "contain",
                                      borderRadius: "6px",
                                      display: "block",
                                      margin: "0 auto",
                                    }}
                                  />
                                  <div className="mt-2 text-center">
                                    {ingredientsImageFile ? (
                                      <span className="badge bg-warning text-dark">
                                        New Image (Unsaved Preview &bull; {(ingredientsImageFile.size / (1024 * 1024)).toFixed(2)} MB)
                                      </span>
                                    ) : (
                                      <span className="badge bg-success text-white">
                                        Current Saved Image
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="d-flex flex-column gap-3 flex-grow-1">
                                  <div>
                                    <h6 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
                                      {ingredientsImageFile ? "Ready to Save New Image" : "Image Active on Storefront"}
                                    </h6>
                                    <p className="text-muted small mb-0">
                                      This image displays dynamically under the Ingredients section on the product details page. You can replace or remove it at any time.
                                    </p>
                                  </div>

                                  <div className="d-flex flex-wrap gap-2">
                                    <label
                                      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 px-3 py-2"
                                      style={{ cursor: "pointer", fontWeight: "600" }}
                                    >
                                      <FiImage size={15} /> Replace Image
                                      <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                        onChange={handleIngredientsImageChange}
                                        hidden
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 px-3 py-2"
                                      onClick={handleRemoveIngredientsImage}
                                      style={{ fontWeight: "600" }}
                                    >
                                      <FiTrash2 size={15} /> Remove Image
                                    </button>
                                  </div>

                                  <div className="small text-muted border-top pt-2 mt-auto">
                                    &bull; <strong>Recommended:</strong> High-resolution infographic, ingredient breakdown, or lab facts graphic.<br />
                                    &bull; Click <strong>Save Product Content</strong> below to persist your changes.
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="border border-2 border-dashed rounded p-4 text-center bg-light"
                                style={{
                                  borderRadius: "12px",
                                  borderColor: "#cbd5e1",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <FiImage size={40} className="text-secondary mb-2" />
                                <h6 className="fw-bold mb-1" style={{ color: "#334155" }}>
                                  No Ingredients Section Image Uploaded
                                </h6>
                                <p className="text-muted small mb-3">
                                  Upload a custom ingredients graphic or infographic for this product.<br />
                                  Supports JPG, JPEG, PNG, and WEBP formats (up to 10MB).
                                </p>

                                <label
                                  className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2 px-4 py-2"
                                  style={{ cursor: "pointer", fontWeight: "600" }}
                                >
                                  <FiPlus size={16} /> Choose Image from Computer
                                  <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    onChange={handleIngredientsImageChange}
                                    hidden
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Product Details Tab Configuration */}
                      <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                          <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: "11px" }}>Section 4</span>
                                <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Product Details Tab Configuration</h6>
                              </div>
                              <small className="text-muted">
                                Configure which tabs are visible to customers on this product's storefront page.
                              </small>
                            </div>
                            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: "11px" }}>
                              Independent Per Product
                            </span>
                          </div>

                          <div className="card-body p-4">
                            <div className="row g-3">
                              {/* 1. Description Tab Switch */}
                              <div className="col-12 col-md-4">
                                <div className="p-3 border rounded h-100 bg-white">
                                  <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="fw-bold" style={{ color: "#1e293b" }}>Description Tab</span>
                                    <div className="form-check form-switch m-0">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="contentDescTabToggle"
                                        style={{ width: "2.3em", height: "1.2em", cursor: "pointer" }}
                                        checked={contentTabConfig.descriptionEnabled}
                                        onChange={(e) => setContentTabConfig(prev => ({ ...prev, descriptionEnabled: e.target.checked }))}
                                      />
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center justify-content-between">
                                    <small className="text-muted">Show product description</small>
                                    <span className={`badge ${contentTabConfig.descriptionEnabled ? "bg-success" : "bg-secondary"}`}>
                                      {contentTabConfig.descriptionEnabled ? "Enabled" : "Disabled"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* 2. Key Ingredients Tab Switch */}
                              <div className="col-12 col-md-4">
                                <div className="p-3 border rounded h-100 bg-white">
                                  <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="fw-bold" style={{ color: "#1e293b" }}>Key Ingredients Tab</span>
                                    <div className="form-check form-switch m-0">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="contentIngTabToggle"
                                        style={{ width: "2.3em", height: "1.2em", cursor: "pointer" }}
                                        checked={contentTabConfig.ingredientsEnabled}
                                        onChange={(e) => setContentTabConfig(prev => ({ ...prev, ingredientsEnabled: e.target.checked }))}
                                      />
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center justify-content-between">
                                    <small className="text-muted">Show ingredients &amp; graphic</small>
                                    <span className={`badge ${contentTabConfig.ingredientsEnabled ? "bg-success" : "bg-secondary"}`}>
                                      {contentTabConfig.ingredientsEnabled ? "Enabled" : "Disabled"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* 3. Customer Reviews Tab Switch */}
                              <div className="col-12 col-md-4">
                                <div className="p-3 border rounded h-100 bg-white">
                                  <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="fw-bold" style={{ color: "#1e293b" }}>Customer Reviews Tab</span>
                                    <div className="form-check form-switch m-0">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="contentRevTabToggle"
                                        style={{ width: "2.3em", height: "1.2em", cursor: "pointer" }}
                                        checked={contentTabConfig.reviewsEnabled}
                                        onChange={(e) => setContentTabConfig(prev => ({ ...prev, reviewsEnabled: e.target.checked }))}
                                      />
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center justify-content-between">
                                    <small className="text-muted">Show reviews &amp; submission</small>
                                    <span className={`badge ${contentTabConfig.reviewsEnabled ? "bg-success" : "bg-secondary"}`}>
                                      {contentTabConfig.reviewsEnabled ? "Enabled" : "Disabled"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="col-12">
                        <div className="p-3 bg-white rounded shadow-sm border d-flex flex-wrap align-items-center justify-content-between gap-3">
                          <div>
                            <span className="fw-semibold text-dark">Ready to apply changes?</span>
                            <div className="text-muted small">
                              Updates will immediately reflect on the frontend product details page for this product.
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                            onClick={saveProductContent}
                            disabled={savingContent || !selectedContentProductId}
                          >
                            {savingContent ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Saving Content...
                              </>
                            ) : (
                              <>
                                <FiCheck size={16} /> Save Product Content
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card p-5 text-center bg-white border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                      <FiBox size={40} className="text-muted mx-auto mb-3" />
                      <h5 className="fw-bold" style={{ color: "#0f172a" }}>Please Select a Product</h5>
                      <p className="text-muted small mb-0">
                        Choose a product from the dropdown above to load and edit its description and key ingredients.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Product Tab Image Management Tab */}
            {activeTab === "product-tab-images" && (() => {
              const selectedProduct = products.find(p => p._id === selectedTabImageProductId) || products[0] || null;

              const filteredProducts = (products || []).filter(p => {
                if (!tabImagesSearch.trim()) return true;
                const query = tabImagesSearch.toLowerCase();
                return (p.name && p.name.toLowerCase().includes(query)) ||
                  (p._id && p._id.toLowerCase().includes(query));
              });

              return (
                <div className="product-tab-image-management">
                  {/* Header Bar */}
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 p-3 bg-white rounded shadow-sm border">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <FiImage size={22} className="text-primary" />
                        <h4 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Product Tab Image Management</h4>
                      </div>
                      <p className="text-muted small mb-0 mt-1">
                        Manage independent product images for the <strong>How to Use</strong>, <strong>What It Does</strong>, and <strong>Ingredients</strong> tabs.
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {selectedTabImageProductId && (
                        <a
                          href={`/ProductDetails?id=${selectedTabImageProductId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                          title="Open storefront product page in a new tab"
                        >
                          <FiHome size={14} /> View Storefront
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
                        onClick={saveProductTabImages}
                        disabled={savingTabImages || !selectedTabImageProductId}
                      >
                        {savingTabImages ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Saving Images...
                          </>
                        ) : (
                          <>
                            <FiCheck size={16} /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Feedback Banner */}
                  {tabImagesFeedback && (
                    <div className={`alert alert-${tabImagesFeedback.type} alert-dismissible fade show d-flex align-items-center justify-content-between mb-4`} role="alert">
                      <div>
                        {tabImagesFeedback.type === "success" ? <FiCheck className="me-2" /> : <FiX className="me-2" />}
                        {tabImagesFeedback.message}
                      </div>
                      <button type="button" className="btn-close" onClick={() => setTabImagesFeedback(null)} aria-label="Close"></button>
                    </div>
                  )}

                  {/* Step 1: Product Selector Card */}
                  <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: "11px" }}>Step 1</span>
                        <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Select Product to Manage Tab Images</h6>
                      </div>
                      {selectedProduct && (
                        <span className="badge bg-light text-dark border" style={{ fontSize: "11px" }}>
                          ID: {selectedProduct._id}
                        </span>
                      )}
                    </div>
                    <div className="card-body p-3">
                      <div className="row align-items-center">
                        <div className="col-12 col-md-5 mb-2 mb-md-0">
                          <label className="small fw-bold text-muted mb-1 block">Quick Search</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Filter by product name or ID..."
                            value={tabImagesSearch}
                            onChange={(e) => setTabImagesSearch(e.target.value)}
                          />
                        </div>
                        <div className="col-12 col-md-7">
                          <label className="small fw-bold text-muted mb-1 block">Choose Product from Catalog</label>
                          <select
                            className="form-select form-select-lg"
                            value={selectedTabImageProductId}
                            onChange={(e) => {
                              setSelectedTabImageProductId(e.target.value);
                            }}
                          >
                            {filteredProducts.map(p => (
                              <option key={p._id} value={p._id}>
                                {p.name} — ₹{p.salePrice} (ID: {p._id})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {selectedProduct && (
                        <div className="d-flex align-items-center gap-3 mt-3 pt-3 border-top">
                          {selectedProduct.images && selectedProduct.images[0] ? (
                            <img
                              src={selectedProduct.images[0]}
                              alt={selectedProduct.name}
                              style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            />
                          ) : (
                            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                              <FiBox className="text-muted" />
                            </div>
                          )}
                          <div>
                            <div className="fw-bold" style={{ color: "#0f172a" }}>{selectedProduct.name}</div>
                            <div className="small text-muted">
                              Category: {selectedProduct.categoryId?.name || "General"} &bull; Price: ₹{selectedProduct.salePrice}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTabImageProductId ? (
                    <div>
                      {/* Three Independent Upload Sections */}
                      <div className="row g-4 mb-4">
                        {/* Section A: How to Use Image */}
                        <div className="col-12 col-lg-4">
                          <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                              <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>How to Use Image</h6>
                              {tabImagesData.howToUseImage.file ? (
                                <span className="badge bg-primary" style={{ fontSize: "11px" }}>Ready to Upload</span>
                              ) : tabImagesData.howToUseImage.remove ? (
                                <span className="badge bg-danger" style={{ fontSize: "11px" }}>Will be Removed</span>
                              ) : tabImagesData.howToUseImage.url ? (
                                <span className="badge bg-success" style={{ fontSize: "11px" }}>Saved Image</span>
                              ) : (
                                <span className="badge bg-secondary" style={{ fontSize: "11px" }}>Default Active</span>
                              )}
                            </div>
                            <div className="card-body p-3 d-flex flex-column">
                              <p className="text-muted small mb-3">
                                Displayed in the storefront <strong>How to Use?</strong> tab section.
                              </p>

                              {/* Preview Area */}
                              <div
                                className="mb-3 rounded d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden"
                                style={{
                                  height: "220px",
                                  border: "2px dashed #cbd5e1",
                                }}
                              >
                                {tabImagesData.howToUseImage.preview && !tabImagesData.howToUseImage.remove ? (
                                  <img
                                    src={tabImagesData.howToUseImage.preview}
                                    alt="How to Use Preview"
                                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                  />
                                ) : (
                                  <div className="text-center p-3 text-muted">
                                    <FiImage size={36} className="text-muted mb-2 opacity-50" />
                                    <div className="small fw-semibold">No custom image uploaded</div>
                                    <div style={{ fontSize: "11px" }}>Default graphic will be displayed</div>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-auto">
                                <input
                                  type="file"
                                  id="howToUseInputFile"
                                  accept="image/jpeg,image/jpg,image/png,image/webp"
                                  style={{ display: "none" }}
                                  onChange={(e) => handleTabImageChange("howToUseImage", e.target.files[0])}
                                />
                                <div className="d-flex gap-2">
                                  <label
                                    htmlFor="howToUseInputFile"
                                    className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 cursor-pointer"
                                  >
                                    <FiEdit3 size={14} />
                                    {tabImagesData.howToUseImage.preview && !tabImagesData.howToUseImage.remove ? "Replace Image" : "Upload Image"}
                                  </label>
                                  {(tabImagesData.howToUseImage.preview || tabImagesData.howToUseImage.url) && !tabImagesData.howToUseImage.remove && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                                      onClick={() => handleTabImageRemove("howToUseImage")}
                                      title="Remove image"
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  )}
                                </div>
                                <div className="text-muted mt-2" style={{ fontSize: "11px" }}>
                                  Formats: JPG, JPEG, PNG, WEBP &bull; Max: 10MB
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section B: What It Does Image */}
                        <div className="col-12 col-lg-4">
                          <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                              <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>What It Does Image</h6>
                              {tabImagesData.whatItDoesImage.file ? (
                                <span className="badge bg-primary" style={{ fontSize: "11px" }}>Ready to Upload</span>
                              ) : tabImagesData.whatItDoesImage.remove ? (
                                <span className="badge bg-danger" style={{ fontSize: "11px" }}>Will be Removed</span>
                              ) : tabImagesData.whatItDoesImage.url ? (
                                <span className="badge bg-success" style={{ fontSize: "11px" }}>Saved Image</span>
                              ) : (
                                <span className="badge bg-secondary" style={{ fontSize: "11px" }}>No Image</span>
                              )}
                            </div>
                            <div className="card-body p-3 d-flex flex-column">
                              <p className="text-muted small mb-3">
                                Displayed in the storefront <strong>What it does?</strong> tab section.
                              </p>

                              {/* Preview Area */}
                              <div
                                className="mb-3 rounded d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden"
                                style={{
                                  height: "220px",
                                  border: "2px dashed #cbd5e1",
                                }}
                              >
                                {tabImagesData.whatItDoesImage.preview && !tabImagesData.whatItDoesImage.remove ? (
                                  <img
                                    src={tabImagesData.whatItDoesImage.preview}
                                    alt="What It Does Preview"
                                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                  />
                                ) : (
                                  <div className="text-center p-3 text-muted">
                                    <FiImage size={36} className="text-muted mb-2 opacity-50" />
                                    <div className="small fw-semibold">No custom image uploaded</div>
                                    <div style={{ fontSize: "11px" }}>Text benefits will be displayed</div>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-auto">
                                <input
                                  type="file"
                                  id="whatItDoesInputFile"
                                  accept="image/jpeg,image/jpg,image/png,image/webp"
                                  style={{ display: "none" }}
                                  onChange={(e) => handleTabImageChange("whatItDoesImage", e.target.files[0])}
                                />
                                <div className="d-flex gap-2">
                                  <label
                                    htmlFor="whatItDoesInputFile"
                                    className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 cursor-pointer"
                                  >
                                    <FiEdit3 size={14} />
                                    {tabImagesData.whatItDoesImage.preview && !tabImagesData.whatItDoesImage.remove ? "Replace Image" : "Upload Image"}
                                  </label>
                                  {(tabImagesData.whatItDoesImage.preview || tabImagesData.whatItDoesImage.url) && !tabImagesData.whatItDoesImage.remove && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                                      onClick={() => handleTabImageRemove("whatItDoesImage")}
                                      title="Remove image"
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  )}
                                </div>
                                <div className="text-muted mt-2" style={{ fontSize: "11px" }}>
                                  Formats: JPG, JPEG, PNG, WEBP &bull; Max: 10MB
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section C: Ingredients Image */}
                        <div className="col-12 col-lg-4">
                          <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                              <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Ingredients Image</h6>
                              {tabImagesData.ingredientsImage.file ? (
                                <span className="badge bg-primary" style={{ fontSize: "11px" }}>Ready to Upload</span>
                              ) : tabImagesData.ingredientsImage.remove ? (
                                <span className="badge bg-danger" style={{ fontSize: "11px" }}>Will be Removed</span>
                              ) : tabImagesData.ingredientsImage.url ? (
                                <span className="badge bg-success" style={{ fontSize: "11px" }}>Saved Image</span>
                              ) : (
                                <span className="badge bg-secondary" style={{ fontSize: "11px" }}>No Image</span>
                              )}
                            </div>
                            <div className="card-body p-3 d-flex flex-column">
                              <p className="text-muted small mb-3">
                                Displayed in the storefront <strong>Ingredients</strong> tab section.
                              </p>

                              {/* Preview Area */}
                              <div
                                className="mb-3 rounded d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden"
                                style={{
                                  height: "220px",
                                  border: "2px dashed #cbd5e1",
                                }}
                              >
                                {tabImagesData.ingredientsImage.preview && !tabImagesData.ingredientsImage.remove ? (
                                  <img
                                    src={tabImagesData.ingredientsImage.preview}
                                    alt="Ingredients Preview"
                                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                  />
                                ) : (
                                  <div className="text-center p-3 text-muted">
                                    <FiImage size={36} className="text-muted mb-2 opacity-50" />
                                    <div className="small fw-semibold">No custom image uploaded</div>
                                    <div style={{ fontSize: "11px" }}>Key ingredients list will be displayed</div>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-auto">
                                <input
                                  type="file"
                                  id="ingredientsInputFile"
                                  accept="image/jpeg,image/jpg,image/png,image/webp"
                                  style={{ display: "none" }}
                                  onChange={(e) => handleTabImageChange("ingredientsImage", e.target.files[0])}
                                />
                                <div className="d-flex gap-2">
                                  <label
                                    htmlFor="ingredientsInputFile"
                                    className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 cursor-pointer"
                                  >
                                    <FiEdit3 size={14} />
                                    {tabImagesData.ingredientsImage.preview && !tabImagesData.ingredientsImage.remove ? "Replace Image" : "Upload Image"}
                                  </label>
                                  {(tabImagesData.ingredientsImage.preview || tabImagesData.ingredientsImage.url) && !tabImagesData.ingredientsImage.remove && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                                      onClick={() => handleTabImageRemove("ingredientsImage")}
                                      title="Remove image"
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  )}
                                </div>
                                <div className="text-muted mt-2" style={{ fontSize: "11px" }}>
                                  Formats: JPG, JPEG, PNG, WEBP &bull; Max: 10MB
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Save Action Bar */}
                      <div className="card border-0 shadow-sm p-3 bg-white d-flex flex-wrap flex-md-row align-items-center justify-content-between gap-3" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        <div>
                          <div className="fw-semibold text-dark">Save Product Tab Images</div>
                          <div className="text-muted small">
                            Images are saved independently against product ID <code>{selectedTabImageProductId}</code> without affecting other fields.
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 fw-semibold"
                          onClick={saveProductTabImages}
                          disabled={savingTabImages || !selectedTabImageProductId}
                        >
                          {savingTabImages ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              Uploading &amp; Saving...
                            </>
                          ) : (
                            <>
                              <FiCheck size={16} /> Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="card p-5 text-center bg-white border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                      <FiBox size={40} className="text-muted mx-auto mb-3" />
                      <h5 className="fw-bold" style={{ color: "#0f172a" }}>Please Select a Product</h5>
                      <p className="text-muted small mb-0">
                        Choose a product from the dropdown above to manage its tab images.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

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
            {activeTab === "refunds" && (() => {
              const approvedRefunds = refunds.filter(r => r.status === 'Approved' || r.status === 'Refunded');
              const totalRefundChargesCollected = approvedRefunds.length * 50;
              const totalRefundAmountPaid = approvedRefunds.reduce((sum, r) => {
                const orderAmount = r.orderId?.totalPrice || 0;
                const calculatedRefund = Math.max(0, orderAmount - 50);
                return sum + calculatedRefund;
              }, 0);

              return (
                <div>
                  {/* Admin Refund Reports / Summary cards */}
                  <div className="row g-4 mb-4">
                    <div className="col-md-3">
                      <div className="stat-card p-4 rounded bg-white shadow-sm border">
                        <span className="text-muted small fw-bold block mb-1">TOTAL ORDERS</span>
                        <h4>{orders?.length || 0}</h4>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-card p-4 rounded bg-white shadow-sm border">
                        <span className="text-muted small fw-bold block mb-1">TOTAL REFUND REQUESTS</span>
                        <h4>{refunds.length}</h4>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-card p-4 rounded bg-white shadow-sm border">
                        <span className="text-muted small fw-bold block mb-1">TOTAL REFUND CHARGES COLLECTED</span>
                        <h4 className="text-success">₹{totalRefundChargesCollected.toFixed(2)}</h4>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-card p-4 rounded bg-white shadow-sm border">
                        <span className="text-muted small fw-bold block mb-1">TOTAL REFUND AMOUNT PAID</span>
                        <h4 className="text-primary">₹{totalRefundAmountPaid.toFixed(2)}</h4>
                      </div>
                    </div>
                  </div>

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
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Order Amount</th>
                          <th>Refund Amount</th>
                          <th>Refund Status</th>
                          <th>Razorpay Refund ID</th>
                          <th>Refund Date</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {refunds
                          .filter(r => r._id?.toLowerCase().includes(searchQuery.toLowerCase()) || r.orderId?.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
                          .slice((refundsPage - 1) * ITEMS_PER_PAGE, refundsPage * ITEMS_PER_PAGE)
                          .map((refund) => {
                            const orderAmount = refund.orderId?.totalPrice || 0;
                            const refundCharge = 50;
                            const refundAmount = Math.max(0, orderAmount - refundCharge);

                            return (
                              <tr key={refund._id} className="align-middle">
                                <td>{refund.orderId?.orderNumber || 'N/A'}</td>
                                <td>{refund.customerId?.name || 'N/A'}</td>
                                <td className="fw-bold">₹{orderAmount.toFixed(2)}</td>
                                <td className="text-primary fw-bold">₹{refundAmount.toFixed(2)}</td>
                                <td>
                                  <span className={`badge bg-${refund.status === 'Approved' || refund.status === 'Refunded' ? 'success' : refund.status === 'Rejected' ? 'danger' : 'warning'}`}>
                                    {refund.status}
                                  </span>
                                </td>
                                <td className="text-secondary fw-semibold">{refund.refundId || refund.orderId?.refundId || 'N/A'}</td>
                                <td>{refund.refundedAt ? new Date(refund.refundedAt).toLocaleDateString() : 'N/A'}</td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                      setEditingItem(refund);
                                      setModalType("refund-details");
                                    }}
                                  >
                                    Review
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
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
              );
            })()}

            {/* Refund Settings Tab */}
            {activeTab === "refund-settings" && (
              <div className="card p-4 border-0 shadow-sm" style={{ maxWidth: '600px' }}>
                <h5 className="mb-4 font-instrument_serif">Refund Configuration</h5>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await authFetch(`${API_BASE}/admin/refund-settings`, {
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
                  <div className="mb-3 form-check form-switch">
                    <input type="checkbox" className="form-check-input" checked={refundSettings?.isEnabled || false} onChange={e => setRefundSettings({ ...refundSettings, isEnabled: e.target.checked })} />
                    <label className="form-check-label fw-bold small">Enable Automatic Refund Deductions</label>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Deduction Type</label>
                    <select className="form-select" value={refundSettings?.refundChargeType || 'Percentage'} onChange={e => setRefundSettings({ ...refundSettings, refundChargeType: e.target.value })}>
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed Amount">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold small">Deduction Value</label>
                    <input type="number" className="form-control" value={refundSettings?.refundChargeValue || 0} onChange={e => setRefundSettings({ ...refundSettings, refundChargeValue: Number(e.target.value) })} />
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

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1 text-dark fw-bold">Customer Reviews Moderation</h5>
                    <p className="text-muted small mb-0">Approve or reject customer reviews before they are displayed on the storefront</p>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <div className="d-flex align-items-center gap-1">
                      <span className="small text-muted fw-semibold">Filter Product:</span>
                      <select
                        className="form-select form-select-sm"
                        style={{ minWidth: "180px", maxWidth: "260px" }}
                        value={reviewsProductFilter}
                        onChange={(e) => {
                          const pId = e.target.value;
                          setReviewsProductFilter(pId);
                          fetchAdminReviews(reviewsFilter, pId);
                        }}
                      >
                        <option value="all">All Products</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="d-flex gap-1 flex-wrap">
                      <button
                        className={`btn btn-sm ${reviewsFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          setReviewsFilter('all');
                          fetchAdminReviews('all', reviewsProductFilter);
                        }}
                      >
                        All
                      </button>
                      <button
                        className={`btn btn-sm ${reviewsFilter === 'Pending' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          setReviewsFilter('Pending');
                          fetchAdminReviews('Pending', reviewsProductFilter);
                        }}
                      >
                        Pending {pendingReviewsCount > 0 && <span className="badge bg-warning text-dark ms-1">{pendingReviewsCount}</span>}
                      </button>
                      <button
                        className={`btn btn-sm ${reviewsFilter === 'Approved' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          setReviewsFilter('Approved');
                          fetchAdminReviews('Approved', reviewsProductFilter);
                        }}
                      >
                        Approved {approvedReviewsCount > 0 && <span className="badge bg-success ms-1">{approvedReviewsCount}</span>}
                      </button>
                      <button
                        className={`btn btn-sm ${reviewsFilter === 'Rejected' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          setReviewsFilter('Rejected');
                          fetchAdminReviews('Rejected', reviewsProductFilter);
                        }}
                      >
                        Rejected {rejectedReviewsCount > 0 && <span className="badge bg-danger ms-1">{rejectedReviewsCount}</span>}
                      </button>
                    </div>
                  </div>
                </div>

                {reviewsLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : adminReviews.length === 0 ? (
                  <div className="card p-5 text-center bg-light border-0">
                    <p className="text-muted mb-0">No reviews found matching status &quot;{reviewsFilter}&quot;.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-premium mb-0">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Customer</th>
                          <th>Rating</th>
                          <th>Review</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminReviews.map((rev) => (
                          <tr key={rev._id} className="align-middle">
                            <td style={{ maxWidth: '180px' }}>
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={rev.productId?.images?.[0] || "assets/images/products/serum_product.png"}
                                  alt=""
                                  width="40"
                                  height="40"
                                  style={{ objectFit: "cover", borderRadius: "4px" }}
                                />
                                <span className="small fw-semibold text-truncate">{rev.productId?.name || "Product"}</span>
                              </div>
                            </td>
                            <td>
                              <div className="fw-semibold">{rev.name}</div>
                              <small className="text-muted">{new Date(rev.createdAt).toLocaleDateString()}</small>
                            </td>
                            <td>
                              <div className="d-flex align-items-center text-warning gap-1">
                                <span>{rev.rating}</span>
                                <FiStar fill="#f59e0b" color="#f59e0b" size={14} />
                              </div>
                            </td>
                            <td style={{ maxWidth: '300px' }}>
                              <div className="fw-bold small">{rev.title}</div>
                              <p className="text-muted small mb-1 text-truncate" title={rev.review}>{rev.review}</p>
                              {(rev.skinType || (rev.skinConcerns && rev.skinConcerns.length > 0)) && (
                                <div className="d-flex gap-1 flex-wrap">
                                  {rev.skinType && <span className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>{rev.skinType}</span>}
                                  {rev.skinConcerns?.map((c, i) => (
                                    <span key={i} className="badge bg-light text-secondary border" style={{ fontSize: '10px' }}>{c}</span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${rev.status === 'Approved'
                                  ? 'bg-success'
                                  : rev.status === 'Pending'
                                    ? 'bg-warning text-dark'
                                    : 'bg-danger'
                                }`}>
                                {rev.status}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="d-flex gap-1 justify-content-end">
                                {rev.status !== 'Approved' && (
                                  <button
                                    className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                    onClick={() => handleUpdateReviewStatus(rev._id, 'Approved')}
                                    title="Approve review"
                                  >
                                    <FiCheck size={14} /> Approve
                                  </button>
                                )}
                                {rev.status !== 'Rejected' && (
                                  <button
                                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                                    onClick={() => handleUpdateReviewStatus(rev._id, 'Rejected')}
                                    title="Reject review"
                                  >
                                    <FiX size={14} /> Reject
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteReview(rev._id)}
                                  title="Delete review"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* --- CRUD MODALS / OVERLAYS (GLASSMORPHIC STYLING) --- */}
      {modalType && (
        <div
          className="modal position-fixed top-0 start-0 w-100 h-100 admin-modal-backdrop"
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          style={{
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            overflow: "hidden",
            padding: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalType("");
            }
          }}
        >
          <div
            className="card border-0 shadow-lg admin-modal-card edit-product-modal"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            style={{
              maxWidth: modalType === "product" ? "880px" : "550px",
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #f1f5f9",
              margin: "auto",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
              height: modalType === "product" ? "90vh" : "auto",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Fixed at top of modal) */}
            <div
              className="admin-modal-header edit-product-modal-header d-flex justify-content-between align-items-center p-4 border-bottom bg-white"
              style={{
                flexShrink: 0,
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
            >
              <div>
                <h4 className="font-instrument_serif text-capitalize fw-bold mb-0" style={{ color: "#0f172a" }}>
                  {editingItem ? "Edit" : "Create"} {modalType}
                </h4>
                {modalType === "product" && (
                  <small className="text-muted">
                    {editingItem ? `Editing: ${editingItem.name || "Product"}` : "Create a new product in the store"}
                  </small>
                )}
              </div>
              <button
                type="button"
                className="btn btn-close-popup border-0 p-0 fs-20"
                style={{ color: "#0f172a", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                onClick={() => setModalType("")}
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Body / Forms */}
            {modalType === "product" ? (
              <form
                id="productModalForm"
                onSubmit={saveProduct}
                className="d-flex flex-column flex-grow-1"
                data-lenis-prevent="true"
                style={{
                  minHeight: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 0%",
                }}
              >
                {/* Scrollable Body */}
                <div
                  className="admin-modal-scrollable edit-product-modal-body p-4"
                  data-lenis-prevent="true"
                  data-lenis-prevent-wheel="true"
                  data-lenis-prevent-touch="true"
                  style={{
                    flex: "1 1 auto",
                    minHeight: 0,
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
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
                      <label className="small block mb-2 fw-bold" style={{ color: "#0f172a" }}>Shipping</label>
                      <div className="form-check form-switch mt-1">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="shippingPaidSwitch"
                          checked={isShippingPaid}
                          onChange={(e) => setIsShippingPaid(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="shippingPaidSwitch">
                          {isShippingPaid ? "Paid Shipping" : "Free Shipping"}
                        </label>
                      </div>
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

                    {/* --- Product Images Gallery & Upload Section --- */}
                    <div className="col-12 mb-4">
                      <div className="card border-0 shadow-sm" style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                        <div className="card-header bg-transparent border-bottom py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                          <div className="d-flex align-items-center gap-2">
                            <FiImage size={20} className="text-primary" />
                            <div>
                              <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Upload Product Images</h6>
                              <small className="text-muted">Upload product photos. The 1st image will be the primary main image in customer details.</small>
                            </div>
                          </div>
                          <span className="badge bg-primary text-white" style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "20px" }}>
                            Total Images: {existingProductImages.length + newProductFiles.length}
                          </span>
                        </div>

                        <div className="card-body p-3">
                          {/* Upload Dropzone / Button */}
                          <div
                            className="p-4 text-center rounded border border-2 border-dashed mb-3"
                            style={{
                              borderColor: "#94a3b8",
                              backgroundColor: "#f8fafc",
                              cursor: "pointer",
                              transition: "all 0.2s ease"
                            }}
                            onClick={() => document.getElementById("productImagesFileInput")?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                handleProductFilesSelected(e.dataTransfer.files);
                              }
                            }}
                          >
                            <FiUploadCloud size={40} className="text-primary mb-2" />
                            <div className="fw-bold" style={{ color: "#0f172a", fontSize: "15px" }}>
                              Upload Product Images
                            </div>
                            <p className="small text-muted mb-2">
                              Click to browse or drag &amp; drop images here (Select multiple images at once)
                            </p>
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-primary px-3 py-1 d-inline-flex align-items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  document.getElementById("productImagesFileInput")?.click();
                                }}
                              >
                                <FiPlus size={14} /> Browse from Computer
                              </button>
                            </div>
                            <small className="text-secondary d-block mt-2" style={{ fontSize: "11px" }}>
                              Supported Formats: JPG, JPEG, PNG, WEBP • Max 10MB per image
                            </small>
                            <input
                              type="file"
                              id="productImagesFileInput"
                              multiple
                              accept="image/jpeg,image/png,image/webp,image/jpg"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                if (e.target.files) {
                                  handleProductFilesSelected(e.target.files);
                                  e.target.value = "";
                                }
                              }}
                            />
                          </div>

                          {/* Validation / Status Messages */}
                          {productImageError && (
                            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                              <FiAlertCircle size={16} className="flex-shrink-0" />
                              <span>{productImageError}</span>
                            </div>
                          )}

                          {isSavingProduct && (
                            <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                              <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                              <span>Uploading product images to Cloudinary and saving... Please wait.</span>
                            </div>
                          )}

                          {/* 1. Existing Uploaded Images (when editing or previously saved) */}
                          {existingProductImages.length > 0 && (
                            <div className="mb-3">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="small fw-bold" style={{ color: "#0f172a" }}>
                                  Existing Uploaded Images ({existingProductImages.length})
                                </span>
                                <small className="text-muted">Saved on server</small>
                              </div>
                              <div className="row g-2">
                                {existingProductImages.map((imgUrl, idx) => (
                                  <div key={idx} className="col-6 col-sm-4 col-md-3">
                                    <div
                                      className="position-relative border rounded p-1 bg-white shadow-sm h-100 d-flex flex-column"
                                      style={{ borderColor: idx === 0 ? "#3b82f6" : "#e2e8f0" }}
                                    >
                                      <div style={{ position: "relative", width: "100%", paddingTop: "100%", borderRadius: "6px", overflow: "hidden", background: "#f1f5f9" }}>
                                        <img
                                          src={imgUrl}
                                          alt={`Product ${idx + 1}`}
                                          style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover"
                                          }}
                                          onError={(e) => { e.target.src = "/assets/images/products/serum_product.png"; }}
                                        />
                                        {idx === 0 && (
                                          <span
                                            className="badge bg-primary text-white position-absolute top-0 start-0 m-1"
                                            style={{ fontSize: "10px", zIndex: 2 }}
                                          >
                                            ★ Main Image
                                          </span>
                                        )}
                                        <span
                                          className="badge bg-dark bg-opacity-75 text-white position-absolute bottom-0 start-0 m-1"
                                          style={{ fontSize: "10px", zIndex: 2 }}
                                        >
                                          #{idx + 1}
                                        </span>
                                      </div>
                                      <div className="d-flex align-items-center justify-content-between mt-1 px-1">
                                        <div className="d-flex gap-1">
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-light p-1"
                                            style={{ fontSize: "11px", lineHeight: 1 }}
                                            disabled={idx === 0}
                                            onClick={() => moveExistingImage(idx, idx - 1)}
                                            title="Move Earlier"
                                          >
                                            <FiArrowLeft size={12} />
                                          </button>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-light p-1"
                                            style={{ fontSize: "11px", lineHeight: 1 }}
                                            disabled={idx === existingProductImages.length - 1}
                                            onClick={() => moveExistingImage(idx, idx + 1)}
                                            title="Move Later"
                                          >
                                            <FiArrowRight size={12} />
                                          </button>
                                        </div>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger p-1"
                                          style={{ fontSize: "11px", lineHeight: 1 }}
                                          onClick={() => removeExistingProductImage(idx)}
                                          title="Remove this image"
                                        >
                                          <FiTrash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 2. Newly Selected Images Previews */}
                          {newProductFiles.length > 0 && (
                            <div className="mb-2">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="small fw-bold text-success">
                                  Newly Selected Images to Upload ({newProductFiles.length})
                                </span>
                                <small className="text-muted">Will be uploaded upon saving</small>
                              </div>
                              <div className="row g-2">
                                {newProductFiles.map((file, idx) => (
                                  <div key={idx} className="col-6 col-sm-4 col-md-3">
                                    <div className="position-relative border border-success rounded p-1 bg-white shadow-sm h-100 d-flex flex-column">
                                      <div style={{ position: "relative", width: "100%", paddingTop: "100%", borderRadius: "6px", overflow: "hidden", background: "#f1f5f9" }}>
                                        <img
                                          src={newProductPreviews[idx]}
                                          alt={file.name}
                                          style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover"
                                          }}
                                        />
                                        <span
                                          className="badge bg-success text-white position-absolute top-0 start-0 m-1"
                                          style={{ fontSize: "10px", zIndex: 2 }}
                                        >
                                          New
                                        </span>
                                        {existingProductImages.length === 0 && idx === 0 && (
                                          <span
                                            className="badge bg-primary text-white position-absolute top-0 end-0 m-1"
                                            style={{ fontSize: "10px", zIndex: 2 }}
                                          >
                                            ★ Main
                                          </span>
                                        )}
                                      </div>
                                      <div className="mt-1 px-1">
                                        <div className="text-truncate small fw-bold" style={{ fontSize: "11px" }} title={file.name}>
                                          {file.name}
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between">
                                          <span className="text-muted" style={{ fontSize: "10px" }}>
                                            {(file.size / 1024).toFixed(0)} KB
                                          </span>
                                          <div className="d-flex gap-1 align-items-center">
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-light p-1"
                                              style={{ fontSize: "10px", lineHeight: 1 }}
                                              disabled={idx === 0}
                                              onClick={() => moveNewImage(idx, idx - 1)}
                                              title="Move Earlier"
                                            >
                                              <FiArrowLeft size={11} />
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-light p-1"
                                              style={{ fontSize: "10px", lineHeight: 1 }}
                                              disabled={idx === newProductFiles.length - 1}
                                              onClick={() => moveNewImage(idx, idx + 1)}
                                              title="Move Later"
                                            >
                                              <FiArrowRight size={11} />
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-outline-danger p-1"
                                              style={{ fontSize: "10px", lineHeight: 1 }}
                                              onClick={() => removeNewProductImage(idx)}
                                              title="Remove before saving"
                                            >
                                              <FiTrash2 size={11} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Helper when no images chosen yet */}
                          {existingProductImages.length === 0 && newProductFiles.length === 0 && (
                            <div className="text-center p-2 text-muted small">
                              No product images uploaded or selected yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- Product Details Tab Management Section --- */}
                    <div className="col-12 mb-3">
                      <div className="card border-0 shadow-sm" style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        <div className="card-header bg-transparent border-bottom py-3 d-flex align-items-center justify-content-between">
                          <div>
                            <h6 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Product Details Tab Management</h6>
                            <small className="text-muted">Configure &amp; enable/disable tabs independently on the Product Details page</small>
                          </div>
                          <span className="badge bg-primary text-white" style={{ fontSize: "11px" }}>Storefront Tabs</span>
                        </div>
                        <div className="card-body p-3">
                          {/* 1. Description Tab Control */}
                          <div className="p-3 mb-3 bg-white rounded border">
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                <div className="fw-bold" style={{ color: "#0f172a" }}>1. Description Tab</div>
                                <small className="text-muted">Enable or disable product description tab on customer details page</small>
                              </div>
                              <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="descTabToggle"
                                  style={{ width: "2.5em", height: "1.3em", cursor: "pointer" }}
                                  checked={tabConfig.descriptionEnabled}
                                  onChange={(e) => setTabConfig(prev => ({ ...prev, descriptionEnabled: e.target.checked }))}
                                />
                                <label className="form-check-label fw-bold mb-0" htmlFor="descTabToggle" style={{ color: tabConfig.descriptionEnabled ? "#16a34a" : "#dc2626" }}>
                                  {tabConfig.descriptionEnabled ? "Enabled" : "Disabled"}
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* 2. Key Ingredients Tab Control */}
                          <div className="p-3 mb-3 bg-white rounded border">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div>
                                <div className="fw-bold" style={{ color: "#0f172a" }}>2. Key Ingredients Tab</div>
                                <small className="text-muted">Enable or disable key ingredients facts and percentage table</small>
                              </div>
                              <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="ingredientsTabToggle"
                                  style={{ width: "2.5em", height: "1.3em", cursor: "pointer" }}
                                  checked={tabConfig.ingredientsEnabled}
                                  onChange={(e) => setTabConfig(prev => ({ ...prev, ingredientsEnabled: e.target.checked }))}
                                />
                                <label className="form-check-label fw-bold mb-0" htmlFor="ingredientsTabToggle" style={{ color: tabConfig.ingredientsEnabled ? "#16a34a" : "#dc2626" }}>
                                  {tabConfig.ingredientsEnabled ? "Enabled" : "Disabled"}
                                </label>
                              </div>
                            </div>

                            {/* Key Ingredients Items Configuration */}
                            <div className="mt-3 pt-3 border-top">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <label className="small fw-bold text-dark mb-0">Key Ingredients List ({ingredients.length})</label>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                  onClick={() => setIngredients([...ingredients, { name: "", percentage: "", description: "" }])}
                                >
                                  <FiPlus size={14} /> Add Ingredient
                                </button>
                              </div>
                              {ingredients.length === 0 ? (
                                <div className="text-muted small p-2 bg-light rounded text-center">
                                  No ingredients added yet. Click &quot;+ Add Ingredient&quot; to configure key ingredients.
                                </div>
                              ) : (
                                <div className="d-flex flex-column gap-2" style={{ maxHeight: "260px", overflowY: "auto" }}>
                                  {ingredients.map((ing, idx) => (
                                    <div key={idx} className="p-2 border rounded bg-light">
                                      <div className="d-flex gap-2 align-items-center mb-1">
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          placeholder="Ingredient Name * (e.g. Niacinamide)"
                                          value={ing.name}
                                          onChange={(e) => {
                                            const updated = [...ingredients];
                                            updated[idx].name = e.target.value;
                                            setIngredients(updated);
                                          }}
                                        />
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          style={{ maxWidth: "160px" }}
                                          placeholder="Percentage (optional)"
                                          value={ing.percentage}
                                          onChange={(e) => {
                                            const updated = [...ingredients];
                                            updated[idx].percentage = e.target.value;
                                            setIngredients(updated);
                                          }}
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                                          title="Remove ingredient"
                                        >
                                          <FiTrash2 size={14} />
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Ingredient description / role (e.g. Skin barrier support)"
                                        value={ing.description || ""}
                                        onChange={(e) => {
                                          const updated = [...ingredients];
                                          updated[idx].description = e.target.value;
                                          setIngredients(updated);
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 3. Customer Reviews Tab Control */}
                          <div className="p-3 bg-white rounded border">
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                <div className="fw-bold" style={{ color: "#0f172a" }}>3. Customer Reviews Tab</div>
                                <small className="text-muted">Enable or disable customer reviews tab and write-review submissions</small>
                              </div>
                              <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="reviewsTabToggle"
                                  style={{ width: "2.5em", height: "1.3em", cursor: "pointer" }}
                                  checked={tabConfig.reviewsEnabled}
                                  onChange={(e) => setTabConfig(prev => ({ ...prev, reviewsEnabled: e.target.checked }))}
                                />
                                <label className="form-check-label fw-bold mb-0" htmlFor="reviewsTabToggle" style={{ color: tabConfig.reviewsEnabled ? "#16a34a" : "#dc2626" }}>
                                  {tabConfig.reviewsEnabled ? "Enabled" : "Disabled"}
                                </label>
                              </div>
                            </div>
                            {!tabConfig.reviewsEnabled && (
                              <div className="mt-2 small text-muted">
                                Note: When disabled, existing reviews are safely stored and will reappear when re-enabled.
                              </div>
                            )}
                          </div>
                        </div>
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
                  </div>
                  <div style={{ height: "16px" }}></div>
                </div>

                {/* Fixed / Sticky Footer with Save and Cancel buttons */}
                <div
                  className="admin-modal-footer edit-product-modal-footer d-flex align-items-center justify-content-between px-4 py-3 bg-white border-top"
                  data-lenis-prevent="true"
                  style={{
                    flexShrink: 0,
                    borderBottomLeftRadius: "16px",
                    borderBottomRightRadius: "16px",
                    boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
                    zIndex: 10,
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: "12px" }}>
                      Total Images: {existingProductImages.length + newProductFiles.length}
                    </span>
                    {isSavingProduct && (
                      <span className="small text-primary d-inline-flex align-items-center gap-1">
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Saving product...
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2"
                      style={{ borderRadius: "8px", fontWeight: 500 }}
                      onClick={() => setModalType("")}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4 py-2 d-inline-flex align-items-center gap-2"
                      style={{ borderRadius: "8px", fontWeight: 600, minWidth: "150px", justifyContent: "center" }}
                      disabled={isSavingProduct}
                    >
                      {isSavingProduct ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          Saving Product...
                        </>
                      ) : (
                        editingItem ? "Update Product" : "Save Product"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div
                className="admin-modal-scrollable p-4"
                data-lenis-prevent="true"
                data-lenis-prevent-wheel="true"
                data-lenis-prevent-touch="true"
                style={{
                  flex: "1 1 auto",
                  minHeight: 0,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch",
                }}
              >
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

                    <div className="mb-3 border-top pt-3" style={{ color: "#0f172a", borderColor: "#f1f5f9" }}>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h6 className="text-uppercase fw-bold mb-0" style={{ fontSize: "11px", letterSpacing: "1px", color: "#9333ea" }}>Shiprocket Synchronization</h6>
                        <span className={`badge ${
                          editingItem.shiprocketSyncStatus === 'SUCCESS' || (editingItem.shiprocketOrderId && !editingItem.shiprocketSyncStatus)
                            ? 'bg-success'
                            : editingItem.shiprocketSyncStatus === 'FAILED'
                            ? 'bg-danger'
                            : 'bg-warning text-dark'
                        }`} style={{ fontSize: "10px", padding: "4px 8px" }}>
                          {editingItem.shiprocketSyncStatus || (editingItem.shiprocketOrderId ? 'SUCCESS' : 'PENDING')}
                        </span>
                      </div>

                      <div className="p-3 rounded mb-2" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <p className="mb-1 text-body-s"><strong>Dermfix Order ID:</strong> {editingItem.orderNumber}</p>
                        <p className="mb-1 text-body-s"><strong>Shiprocket Order ID:</strong> {editingItem.shiprocketOrderId || <span className="text-muted">Not Synced</span>}</p>
                        <p className="mb-1 text-body-s"><strong>Shiprocket Shipment ID:</strong> {editingItem.shiprocketShipmentId || <span className="text-muted">N/A</span>}</p>
                        {editingItem.shiprocketStatus && (
                          <p className="mb-1 text-body-s"><strong>Shiprocket Status:</strong> {editingItem.shiprocketStatus}</p>
                        )}
                        <p className="mb-1 text-body-s"><strong>Last Sync Date:</strong> {editingItem.shiprocketSyncedAt ? new Date(editingItem.shiprocketSyncedAt).toLocaleString() : 'N/A'}</p>

                        {editingItem.shiprocketSyncError && (
                          <div className="mt-2 p-2 rounded text-danger small" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                            <strong>Sync Error:</strong> {editingItem.shiprocketSyncError}
                          </div>
                        )}
                      </div>

                      {editingItem.shiprocketSyncStatus !== 'SUCCESS' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                          onClick={() => handleRetryShiprocketSync(editingItem._id)}
                          disabled={isSyncingShiprocket}
                        >
                          {isSyncingShiprocket ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              <span>Syncing to Shiprocket...</span>
                            </>
                          ) : (
                            <>
                              <span>🔄</span>
                              <span>Retry Shiprocket Sync</span>
                            </>
                          )}
                        </button>
                      )}
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

                {/* Refund Details Modal */}
                {modalType === "refund-details" && editingItem && (() => {
                  const orderAmount = editingItem.orderId?.totalPrice || 0;
                  const refundCharge = 50;
                  const refundAmount = Math.max(0, orderAmount - refundCharge);

                  return (
                    <div>
                      <div className="mb-3 border-bottom pb-3" style={{ color: "#0f172a" }}>
                        <h6 className="block mb-2 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px", color: "#9333ea" }}>Refund Overview</h6>
                        <p className="mb-1 text-body-s"><strong>Refund ID:</strong> {editingItem._id}</p>
                        <p className="mb-1 text-body-s"><strong>Order No:</strong> {editingItem.orderId?.orderNumber}</p>
                        <p className="mb-1 text-body-s"><strong>Customer:</strong> {editingItem.customerId?.name} ({editingItem.customerId?.email})</p>
                        <p className="mb-1 text-body-s"><strong>Status:</strong> <span className={`badge bg-${editingItem.status === 'Approved' || editingItem.status === 'Refunded' ? 'success' : editingItem.status === 'Rejected' ? 'danger' : 'warning'}`}>{editingItem.status}</span></p>
                        <p className="mb-1 text-body-s"><strong>Original Order Amount:</strong> ₹{orderAmount.toFixed(2)}</p>
                        <p className="mb-1 text-body-s"><strong>Refund Processing Charge:</strong> ₹{refundCharge.toFixed(2)}</p>
                        <p className="mb-1 text-body-s"><strong>Refund Amount Sent To Customer:</strong> ₹{refundAmount.toFixed(2)}</p>
                        {editingItem.status === 'Refunded' && (
                          <>
                            <p className="mb-1 text-body-s"><strong>Refund Date:</strong> {editingItem.refundedAt ? new Date(editingItem.refundedAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                            <p className="mb-1 text-body-s"><strong>Razorpay Refund ID:</strong> {editingItem.refundId || editingItem.orderId?.refundId || 'N/A'}</p>
                          </>
                        )}
                      </div>

                      <div className="mb-3 border-bottom pb-3" style={{ color: "#0f172a" }}>
                        <h6 className="block mb-2 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px", color: "#9333ea" }}>Product & Reason</h6>
                        <div className="d-flex align-items-center gap-3 mb-2 p-2 bg-light rounded">
                          {editingItem.productId?.images?.[0] && <img src={editingItem.productId.images[0]} alt="product" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                          <div>
                            <p className="mb-0 fw-semibold text-body-s">{editingItem.productId?.name}</p>
                          </div>
                        </div>
                        <p className="mb-1 text-body-s"><strong>Reason:</strong> {editingItem.reason}</p>
                        <p className="mb-1 text-body-s"><strong>Comments:</strong> {editingItem.comments || 'N/A'}</p>

                        {editingItem.images?.length > 0 && (
                          <div className="mt-2">
                            <strong className="text-body-s">Customer Uploaded Images:</strong>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                              {editingItem.images.map((img, idx) => (
                                <a href={img} target="_blank" rel="noreferrer" key={idx}>
                                  <img src={img} alt="Refund Evidence" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mb-4 pt-2" style={{ color: "#0f172a" }}>
                        <h6 className="block mb-2 text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px", color: "#9333ea" }}>Admin Actions</h6>
                        <label className="form-label small fw-bold">Admin Notes (Optional)</label>
                        <textarea
                          className="form-control form-control-sm mb-3"
                          rows="2"
                          placeholder="Enter notes for this decision..."
                          value={cancelReason} // reusing state for notes
                          onChange={e => setCancelReason(e.target.value)}
                        ></textarea>

                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-info text-white flex-fill" onClick={async () => {
                            if (orderAmount < 50) {
                              alert("Refund cannot be processed because the order amount is less than the refund charge.");
                              return;
                            }
                            try {
                              const res = await authFetch(`${API_BASE}/admin/refunds/${editingItem._id}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'Refunded', adminNotes: cancelReason })
                              });
                              const data = await res.json();
                              if (data.success) {
                                alert("Marked as refunded!");
                                setModalType("");
                                fetchTabContent("refunds");
                              } else {
                                alert(data.message || "Error updating status.");
                              }
                            } catch (err) {
                              alert("Error updating status.");
                            }
                          }}>Mark Refunded</button>
                        </div>
                      </div>

                      <button className="btn btn-secondary w-100 py-10" onClick={() => {
                        setModalType("");
                        setCancelReason("");
                      }}>
                        Close Overview
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
