// components/BannerManagement.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function BannerManagement() {
  const { apiRequest, API_URL } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'horizontal',
    image_url: '',
    link_url: '',
    display_order: 0,
    is_active: 1
  });

  // Fetch banners
  const fetchBanners = async () => {
    try {
      const data = await apiRequest('/banners/admin');
      
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      console.error('Banner ачаалах алдаа:', error);
      alert('Banner ачаалахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      setUploading(true);
      
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          image_url: data.data.url
        }));
        alert('Зураг амжилттай upload хийгдлээ!');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Зураг upload хийх алдаа:', error);
      alert('Зураг upload хийхэд алдаа гарлаа');
    } finally {
      setUploading(false);
    }
  };

  // Create banner
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image_url) {
      alert('Нэр болон зураг заавал оруулна уу!');
      return;
    }

    try {
      const data = await apiRequest('/banners', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (data.success) {
        alert('Banner амжилттай үүсгэлээ!');
        setShowModal(false);
        resetForm();
        fetchBanners();
      }
    } catch (error) {
      console.error('Banner үүсгэх алдаа:', error);
      alert(error.message || 'Banner үүсгэхэд алдаа гарлаа');
    }
  };

  // Update banner
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const data = await apiRequest(`/banners/${editingBanner.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (data.success) {
        alert('Banner амжилттай засагдлаа!');
        setShowModal(false);
        setEditingBanner(null);
        resetForm();
        fetchBanners();
      }
    } catch (error) {
      console.error('Banner засах алдаа:', error);
      alert(error.message || 'Banner засахад алдаа гарлаа');
    }
  };

  // Delete banner
  const handleDelete = async (id) => {
    if (!confirm('Энэ banner-г устгах уу?')) return;

    try {
      const data = await apiRequest(`/banners/${id}`, {
        method: 'DELETE'
      });

      if (data.success) {
        alert('Banner амжилттай устгагдлаа!');
        fetchBanners();
      }
    } catch (error) {
      console.error('Banner устгах алдаа:', error);
      alert(error.message || 'Banner устгахад алдаа гарлаа');
    }
  };

  // Toggle active
  const handleToggle = async (id) => {
    try {
      const data = await apiRequest(`/banners/${id}/toggle`, {
        method: 'PATCH'
      });

      if (data.success) {
        fetchBanners();
      }
    } catch (error) {
      console.error('Toggle алдаа:', error);
      alert(error.message || 'Статус солихд алдаа гарлаа');
    }
  };

  // Open edit modal
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      type: banner.type,
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      display_order: banner.display_order,
      is_active: banner.is_active
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      type: 'horizontal',
      image_url: '',
      link_url: '',
      display_order: 0,
      is_active: 1
    });
    setEditingBanner(null);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Banner Удирдлага</h1>
          <p className="text-sm text-gray-600 mt-1">Сайтын banner зарууд удирдах</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Шинэ Banner
        </button>
      </div>

      {/* Banner List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horizontal Banners */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Хэвтээ Banner</h2>
            <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
              {banners.filter(b => b.type === 'horizontal').length} ширхэг
            </span>
          </div>
          <div className="space-y-3">
            {banners
              .filter(b => b.type === 'horizontal')
              .map(banner => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            {banners.filter(b => b.type === 'horizontal').length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-2">📊</div>
                <p className="text-gray-500 text-sm">Хэвтээ banner байхгүй байна</p>
              </div>
            )}
          </div>
        </div>

        {/* Vertical Banners */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Босоо Banner</h2>
            <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full">
              {banners.filter(b => b.type === 'vertical').length} ширхэг
            </span>
          </div>
          <div className="space-y-3">
            {banners
              .filter(b => b.type === 'vertical')
              .map(banner => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            {banners.filter(b => b.type === 'vertical').length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-2">📱</div>
                <p className="text-gray-500 text-sm">Босоо banner байхгүй байна</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingBanner ? 'Banner засах' : 'Шинэ Banner үүсгэх'}
              </h2>
            </div>

            <form onSubmit={editingBanner ? handleUpdate : handleCreate} className="p-6">
              {/* Title */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Нэр <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Banner-ын нэр"
                  required
                />
              </div>

              {/* Type */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Төрөл <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="horizontal">📊 Хэвтээ</option>
                  <option value="vertical">📱 Босоо</option>
                </select>
              </div>

              {/* Image Upload */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Зураг <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Уншиж байна...
                  </p>
                )}
                {formData.image_url && (
                  <div className="mt-3">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              {/* Link URL */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Холбоос <span className="text-gray-400 text-xs">(заавал биш)</span>
                </label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              {/* Display Order */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Эрэмбэ
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Бага тоо эхэнд харагдана</p>
              </div>

              {/* Active Status */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active === 1}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Идэвхтэй байх
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  {editingBanner ? '✓ Хадгалах' : '+ Үүсгэх'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Болих
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Banner Card Component
function BannerCard({ banner, onEdit, onDelete, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-white">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-24 h-16 object-cover rounded border border-gray-200"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 truncate">{banner.title}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {banner.link_url ? (
              <a 
                href={banner.link_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline truncate block"
              >
                🔗 {banner.link_url}
              </a>
            ) : (
              <span className="text-gray-400">Холбоосгүй</span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              banner.is_active 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {banner.is_active ? '✓ Идэвхтэй' : '⊘ Идэвхгүй'}
            </span>
            <span className="text-xs text-gray-500">Эрэмбэ: {banner.display_order}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onToggle(banner.id)}
            className="text-xs px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 rounded transition"
            title={banner.is_active ? 'Идэвхгүй болгох' : 'Идэвхтэй болгох'}
          >
            {banner.is_active ? '👁️' : '🚫'}
          </button>
          <button
            onClick={() => onEdit(banner)}
            className="text-xs px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition"
            title="Засах"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(banner.id)}
            className="text-xs px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded transition"
            title="Устгах"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}