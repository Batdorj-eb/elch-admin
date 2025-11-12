// components/BannerManagement.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://72.60.195.81:5000/api';

export default function BannerManagement() {
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
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/banners/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setBanners(response.data.data);
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

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          image_url: response.data.data.url
        }));
        alert('Зураг амжилттай upload хийгдлээ!');
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
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/banners`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Banner амжилттай үүсгэлээ!');
        setShowModal(false);
        resetForm();
        fetchBanners();
      }
    } catch (error) {
      console.error('Banner үүсгэх алдаа:', error);
      alert('Banner үүсгэхэд алдаа гарлаа');
    }
  };

  // Update banner
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/banners/${editingBanner.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Banner амжилттай засагдлаа!');
        setShowModal(false);
        setEditingBanner(null);
        resetForm();
        fetchBanners();
      }
    } catch (error) {
      console.error('Banner засах алдаа:', error);
      alert('Banner засахад алдаа гарлаа');
    }
  };

  // Delete banner
  const handleDelete = async (id) => {
    if (!confirm('Энэ banner-г устгах уу?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Banner амжилттай устгагдлаа!');
        fetchBanners();
      }
    } catch (error) {
      console.error('Banner устгах алдаа:', error);
      alert('Banner устгахад алдаа гарлаа');
    }
  };

  // Toggle active
  const handleToggle = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/banners/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchBanners();
      }
    } catch (error) {
      console.error('Toggle алдаа:', error);
      alert('Статус солихд алдаа гарлаа');
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
    return <div className="p-8 text-center">Уншиж байна...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banner Удирдлага</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Шинэ Banner
        </button>
      </div>

      {/* Banner List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Horizontal Banners */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Хэвтээ Banner</h2>
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
              <p className="text-gray-500 text-center py-8">Хэвтээ banner байхгүй</p>
            )}
          </div>
        </div>

        {/* Vertical Banners */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Босоо Banner</h2>
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
              <p className="text-gray-500 text-center py-8">Босоо banner байхгүй</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingBanner ? 'Banner засах' : 'Шинэ Banner'}
            </h2>

            <form onSubmit={editingBanner ? handleUpdate : handleCreate}>
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Нэр *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Төрөл *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="horizontal">Хэвтээ</option>
                  <option value="vertical">Босоо</option>
                </select>
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Зураг *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border rounded-lg px-3 py-2"
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-blue-600 mt-1">Уншиж байна...</p>}
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded"
                  />
                )}
              </div>

              {/* Link URL */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Холбоос (заавал биш)</label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="https://example.com"
                />
              </div>

              {/* Display Order */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Эрэмбэ</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Active Status */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active === 1}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Идэвхтэй</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingBanner ? 'Засах' : 'Үүсгэх'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
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
    <div className="border rounded-lg p-3 flex gap-3 items-center">
      <img
        src={banner.image_url}
        alt={banner.title}
        className="w-24 h-16 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{banner.title}</h3>
        <p className="text-sm text-gray-500">
          {banner.link_url ? (
            <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">
              {banner.link_url}
            </a>
          ) : (
            <span className="text-gray-400">Холбоосгүй</span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {banner.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
          </span>
          <span className="text-xs text-gray-500">Эрэмбэ: {banner.display_order}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onToggle(banner.id)}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
          title={banner.is_active ? 'Идэвхгүй болгох' : 'Идэвхтэй болгох'}
        >
          {banner.is_active ? '👁️' : '🚫'}
        </button>
        <button
          onClick={() => onEdit(banner)}
          className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(banner.id)}
          className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}