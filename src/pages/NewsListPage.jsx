import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NewsListPage() {
  const navigate = useNavigate();
  const { apiRequest } = useAuth();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/articles?limit=100');
      if (data.success) {
        setArticles(data.data.articles);
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`"${title}" нийтлэлийг устгах уу?`)) {
      return;
    }

    try {
      const data = await apiRequest(`/articles/${id}`, {
        method: 'DELETE'
      });

      if (data.success) {
        alert('Амжилттай устгагдлаа!');
        loadArticles(); // Reload list
      }
    } catch (err) {
      alert('Устгахад алдаа гарлаа: ' + err.message);
    }
  };

  const filtered = useMemo(() => {
    let result = articles;

    // Filter by search query
    if (query) {
      result = result.filter((a) =>
        a.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    return result;
  }, [articles, query, statusFilter]);

  const getStatusBadge = (status) => {
    const classes = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-yellow-100 text-yellow-700',
    };
    return classes[status] || classes.draft;
  };

  const getStatusText = (status) => {
    const texts = {
      published: 'Нийтлэгдсэн',
      draft: 'Ноорог',
      scheduled: 'Хуваарьт',
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          Мэдээний жагсаалт ({articles.length})
        </h1>
        <button
          onClick={() => navigate('/news/new')}
          className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          + Мэдээ үүсгэх
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Гарчигаар хайх..."
          className="flex-1 rounded-lg border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border-gray-300"
        >
          <option value="all">Бүх статус</option>
          <option value="draft">Ноорог</option>
          <option value="published">Нийтлэгдсэн</option>
          <option value="scheduled">Хуваарьт</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {query || statusFilter !== 'all'
              ? 'Хайлтын үр дүн олдсонгүй.'
              : 'Мэдээ байхгүй байна. Шинэ мэдээ үүсгэнэ үү.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 text-left font-medium">Гарчиг</th>
                  <th className="p-3 text-left font-medium">Ангилал</th>
                  <th className="p-3 text-left font-medium">Зохиогч</th>
                  <th className="p-3 text-left font-medium">Төлөв</th>
                  <th className="p-3 text-left font-medium">Үзсэн</th>
                  <th className="p-3 text-left font-medium">Огноо</th>
                  <th className="p-3 text-right font-medium">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((article) => (
                  <tr key={article.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{article.title}</div>
                      {(article.is_featured || article.is_breaking) && (
                        <div className="mt-1 flex gap-1">
                          {article.is_featured && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              ⭐ Онцлох
                            </span>
                          )}
                          {article.is_breaking && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              🔥 Шуурхай
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-gray-600">
                        {article.category_name || '-'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {article.author_name || 'Admin'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(article.status)}`}
                      >
                        {getStatusText(article.status)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {article.views || 0}
                    </td>
                    <td className="p-3 text-gray-600">
                      {formatDate(article.created_at)}
                    </td>
                    <td className="space-x-2 p-3 text-right">
                      <button
                        onClick={() => navigate(`/news/${article.id}/edit`)}
                        className="rounded-md bg-gray-100 px-3 py-1.5 hover:bg-gray-200"
                      >
                        Засах
                      </button>
                      <button
                        onClick={() => handleDelete(article.id, article.title)}
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