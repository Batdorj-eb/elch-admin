import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CategoriesPage() {
  const { apiRequest } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/categories');
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const toSlug = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const onNameChange = (value) => {
    setName(value);
    if (!editingId) {
      setSlug(toSlug(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !slug.trim()) {
      alert('Нэр болон slug оруулна уу.');
      return;
    }

    try {
      if (editingId) {
        // Update category
        const data = await apiRequest(`/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim()
          })
        });

        if (data.success) {
          alert('Амжилттай шинэчлэгдлээ!');
          resetForm();
          loadCategories();
        }
      } else {
        // Create new category
        const data = await apiRequest('/categories', {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim()
          })
        });

        if (data.success) {
          alert('Амжилттай үүсгэгдлээ!');
          resetForm();
          loadCategories();
        }
      }
    } catch (err) {
      alert('Алдаа гарлаа: ' + err.message);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" ангилалыг устгах уу?`)) {
      return;
    }

    try {
      const data = await apiRequest(`/categories/${id}`, {
        method: 'DELETE'
      });

      if (data.success) {
        alert('Амжилттай устгагдлаа!');
        loadCategories();
      }
    } catch (err) {
      alert('Устгахад алдаа гарлаа: ' + err.message);
    }
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-lg font-medium">Ачаалж байна...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Ангилал ({categories.length})
        </h1>
      </div>

      {/* Add/Edit Form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? 'Ангилал засах' : 'Шинэ ангилал нэмэх'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Нэр *</label>
              <input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Улс төр"
                className="w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="uls-tur"
                className="w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Тайлбар</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ангилалын тайлбар (заавал биш)"
              className="w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-red-500 px-6 py-2 text-white hover:bg-red-600"
            >
              {editingId ? 'Шинэчлэх' : 'Нэмэх'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-gray-200 px-6 py-2 hover:bg-gray-300"
              >
                Болих
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Ангилал байхгүй байна.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 text-left font-medium">ID</th>
                  <th className="p-3 text-left font-medium">Нэр</th>
                  <th className="p-3 text-left font-medium">Slug</th>
                  <th className="p-3 text-left font-medium">Тайлбар</th>
                  <th className="p-3 text-left font-medium">Нийтлэл</th>
                  <th className="p-3 text-right font-medium">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-gray-600">{category.id}</td>
                    <td className="p-3 font-medium">{category.name}</td>
                    <td className="p-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="p-3 text-gray-600">
                      {category.description || '-'}
                    </td>
                    <td className="p-3 text-gray-600">
                      {category.article_count || 0}
                    </td>
                    <td className="space-x-2 p-3 text-right">
                      <button
                        onClick={() => handleEdit(category)}
                        className="rounded-md bg-gray-100 px-3 py-1.5 hover:bg-gray-200"
                      >
                        Засах
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="rounded-md bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100"
                      >
                        Устгах
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}