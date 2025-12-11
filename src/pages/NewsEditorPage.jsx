import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Editor from '../components/Editor'; 

export default function NewsEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apiRequest, API_URL } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('draft');
  const [isBreaking, setIsBreaking] = useState(false);
  const [showAuthor, setShowAuthor] = useState(true);

  const [featuredPriority, setFeaturedPriority] = useState(null);
  const [takenSlots, setTakenSlots] = useState({});
  const [publishedAt, setPublishedAt] = useState('');

  useEffect(() => {
    loadCategories();
    checkTakenSlots();
    if (id) {
      loadArticle(id);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await apiRequest('/categories');
      if (data.success) {
        const categoryOrder = [
          'Улс төр',
          'Эдийн засаг', 
          'Нийгэм',
          'Ардын элч',
          'Технологи',
          'Факт шалгалт',
          'Поп мэдээ',
          'Дэлхийд',
          '126 ирц',
          'Бусад'
        ];

        const sortedCategories = data.data.categories.sort((a, b) => {
          const indexA = categoryOrder.indexOf(a.name);
          const indexB = categoryOrder.indexOf(b.name);
          
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          
          return indexA - indexB;
        });

        setCategories(sortedCategories);
        
        if (sortedCategories.length > 0 && !categoryId) {
          setCategoryId(sortedCategories[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const checkTakenSlots = async () => {
    const slots = {};
    
    for (let priority = 1; priority <= 5; priority++) {
      try {
        const data = await apiRequest(`/articles/featured/check/${priority}`);
        if (data.success && data.data.taken) {
          if (data.data.article?.id !== parseInt(id)) {
            slots[priority] = data.data.article;
          }
        }
      } catch (err) {
        console.error(`Failed to check slot ${priority}:`, err);
      }
    }
    
    setTakenSlots(slots);
  };

const loadArticle = async (articleId) => {
  try {
    setLoading(true);
    const data = await apiRequest(`/articles/${articleId}`);
    if (data.success) {
      const article = data.data;
      setTitle(article.title);
      setSlug(article.slug);
      setCategoryId(article.category_id);
      setTags(article.tags || '');
      setContent(article.content);
      setExcerpt(article.excerpt || '');
      setStatus(article.status);
      setFeaturedPriority(article.is_featured || null);
      setIsBreaking(article.is_breaking);
      setShowAuthor(article.show_author !== 0);
      if (article.featured_image || article.cover_image) {
        setCoverPreview(article.featured_image || article.cover_image);
      }
      if (article.published_at) {
        const date = new Date(article.published_at);
        setPublishedAt(date.toISOString().slice(0, 16));
      }
    }
  } catch (err) {
    setError('Нийтлэл ачаалахад алдаа гарлаа.');
    console.error('Failed to load article:', err);
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

  const onTitleChange = (v) => {
    setTitle(v);
    if (!id && !slug) {
      setSlug(toSlug(v));
    }
  };

  const onCoverChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setCoverImage(file);
    const preview = URL.createObjectURL(file);
    setCoverPreview(preview);
  };

  async function uploadImage(file) {
    try {
      console.log('📤 [NewsEditorPage] Starting upload:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('📤 [NewsEditorPage] Sending request to:', `${API_URL}/upload/image`);
      
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: formData
      });

      console.log('📥 [NewsEditorPage] Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 [NewsEditorPage] Response data:', data);
      
      if (data.success && data.data && data.data.url) {
        console.log('✅ [NewsEditorPage] Image uploaded successfully:', data.data.url);
        return { default: data.data.url };
      }
      
      throw new Error(data.message || 'Upload failed');
    } catch (err) {
      console.error('❌ [NewsEditorPage] Image upload failed:', err);
      alert('Зураг upload хийхэд алдаа гарлаа: ' + err.message);
      throw err;
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Гарчиг оруулна уу.');
      return;
    }
    if (!slug.trim()) {
      setError('Slug оруулна уу.');
      return;
    }
    if (!content.trim()) {
      setError('Контент оруулна уу.');
      return;
    }
    if (!categoryId) {
      setError('Ангилал сонгоно уу.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let uploadedCoverUrl = '';
      if (coverImage && coverImage instanceof File) {
        console.log('📤 Uploading cover image...');
        const result = await uploadImage(coverImage);
        uploadedCoverUrl = result.default;
        console.log('✅ Cover uploaded:', uploadedCoverUrl);
      } else if (coverPreview && !coverPreview.startsWith('blob:')) {
        uploadedCoverUrl = coverPreview;
      }

      const payload = {
        title,
        slug,
        category_id: parseInt(categoryId),
        content,
        excerpt: excerpt || '',
        tags: tags || '',
        status,
        is_featured: featuredPriority, 
        is_breaking: isBreaking,
        show_author: showAuthor ? 1 : 0, 
        featured_image: uploadedCoverUrl || '',
        published_at: publishedAt || null
      };

      console.log('📤 Sending payload:', payload);

      const url = id ? `/articles/${id}` : '/articles';
      const method = id ? 'PUT' : 'POST';

      const data = await apiRequest(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (data.success) {
        alert(id ? 'Амжилттай шинэчлэгдлээ!' : 'Амжилттай үүсгэгдлээ!');
        navigate('/news');
      } else {
        setError(data.message || 'Алдаа гарлаа.');
      }
    } catch (err) {
      console.error('❌ Save error:', err);
      setError(err.message || 'Серверийн алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
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
          {id ? 'Мэдээ засах' : 'Мэдээ үүсгэх'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:bg-gray-400"
          >
            {loading ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200"
          >
            Буцах
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="text-sm font-medium">Гарчиг *</label>
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Мэдээний гарчиг"
              className="mt-1 w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              required
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="text-sm font-medium">Товч тайлбар</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Богино тайлбар (2-3 өгүүлбэр)"
              className="mt-1 w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              rows={3}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <Editor 
              value={content}
              onChange={setContent}
              uploadImage={uploadImage}
              placeholder="Контент бичих..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Үндсэн мэдээлэл</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium">Ангилал *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300"
                  required
                >
                  <option value="">Сонгох...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Таг</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="news, economy (таслалаар тусгаарлах)"
                  className="mt-1 w-full rounded-lg border-gray-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Featured Image (Cover зураг) *</label>
                <p className="text-xs text-gray-500 mb-1">
                  Энэ зураг Facebook share дээр харагдана
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onCoverChange}
                  className="mt-1 w-full text-sm"
                />
                {coverPreview && (
                  <div className="mt-2 relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full rounded-lg object-cover h-32 border-2 border-green-200"
                    />
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                      ✅ Uploaded
                    </div>
                  </div>
                )}
                {!coverPreview && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      ⚠️ Featured image байхгүй бол Facebook дээр зураг харагдахгүй
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Төлөв</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Нийтлэх огноо</label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {publishedAt ? (
                    new Date(publishedAt) > new Date() ? (
                      <span className="text-blue-600">⏰ Төлөвлөгдсөн: {new Date(publishedAt).toLocaleString('mn-MN')}</span>
                    ) : (
                      <span className="text-green-600">✅ Нийтлэгдсэн: {new Date(publishedAt).toLocaleString('mn-MN')}</span>
                    )
                  ) : (
                    <span>Хоосон үлдээвэл одоогийн цаг ашиглана</span>
                  )}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold mb-3 block">Онцлох байрлал</label>
                
                <label className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition mb-2">
                  <input
                    type="checkbox"
                    checked={featuredPriority === null}
                    onChange={() => setFeaturedPriority(null)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Энгийн мэдээ</div>
                    <div className="text-xs text-gray-500">Онцлохгүй жирийн мэдээ</div>
                  </div>
                </label>

                {[1, 2, 3, 4, 5].map((priority) => {
                  const isTaken = takenSlots[priority];
                  const isCurrentlySelected = featuredPriority === priority;
                  
                  return (
                    <label
                      key={priority}
                      className={`
                        flex items-start p-3 border rounded-lg transition mb-2
                        ${isCurrentlySelected ? 'bg-blue-50 border-blue-300' : 'cursor-pointer hover:bg-gray-50'}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isCurrentlySelected}
                        onChange={() => setFeaturedPriority(isCurrentlySelected ? null : priority)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {priority === 1 ? '⭐ Ерөнхий онцлох (1-р)' : `✓ ${priority}-р онцлох`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {priority === 1 ? 'Хамгийн том хэмжээтэй харагдана' : 'Дэд хэмжээтэй харагдана'}
                        </div>
                        {isTaken && !isCurrentlySelected && (
                          <div className="text-xs mt-1">
                            <div className="text-orange-600 mb-1">
                              ⚠️ Эзлэгдсэн: "{isTaken.title}"
                            </div>
                            <div className="text-blue-600">
                              💡 Сонговол өмнөх мэдээ автоматаар энгийн мэдээ болно
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}

                <p className="text-xs text-gray-500 mt-2">
                  💡 Зөвхөн 1 сонголт хийх боломжтой
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="breaking"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="breaking" className="text-sm font-medium">
                  Шуурхай мэдээ
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold">SEO</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium">Slug *</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-friendly-slug"
                  className="mt-1 w-full rounded-lg border-gray-300 text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL: /articles/{slug || 'slug'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="show-author"
              checked={showAuthor}
              onChange={(e) => setShowAuthor(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <label htmlFor="show-author" className="text-sm font-medium text-gray-900 cursor-pointer">
                ✍️ Зохиогчийн нэр харуулах
              </label>
              <p className="text-xs text-gray-600 mt-0.5">
                Идэвхжүүлвэл мэдээний зохиогчийн нэр харагдана
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}