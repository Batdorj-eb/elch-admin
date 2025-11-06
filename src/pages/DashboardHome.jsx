import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function StatCard({ label, value, delta, loading }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      {loading ? (
        <div className="mt-2 h-8 bg-gray-100 rounded animate-pulse"></div>
      ) : (
        <>
          <div className="mt-1 text-2xl font-bold">{value}</div>
          {delta && <div className="mt-1 text-xs text-green-600">{delta}</div>}
        </>
      )}
    </div>
  );
}

export default function DashboardHome() {
  const { apiRequest } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats (you'll need to create this endpoint)
      const statsData = await apiRequest('/api/articles/stats');
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Load recent articles
      const articlesData = await apiRequest('/api/articles?limit=5&sort=created_at&order=desc');
      if (articlesData.success) {
        setRecentArticles(articlesData.data.articles);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      // Set default stats if API fails
      setStats({
        total_articles: 0,
        total_views: 0,
        total_comments: 0,
        total_categories: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('en-US');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} минутын өмнө`;
    } else if (diffHours < 24) {
      return `${diffHours} цагийн өмнө`;
    } else if (diffDays < 7) {
      return `${diffDays} өдрийн өмнө`;
    } else {
      return date.toLocaleDateString('mn-MN', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          Нүүр хуудас
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ELCH News админ панел - Тавтай морил!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Нийт нийтлэл"
          value={formatNumber(stats?.total_articles)}
          delta=""
          loading={loading}
        />
        <StatCard
          label="Нийт үзсэн"
          value={formatNumber(stats?.total_views)}
          delta=""
          loading={loading}
        />
        <StatCard
          label="Сэтгэгдэл"
          value={formatNumber(stats?.total_comments)}
          delta=""
          loading={loading}
        />
        <StatCard
          label="Ангилал"
          value={formatNumber(stats?.total_categories)}
          delta=""
          loading={loading}
        />
      </div>

      {/* Recent Articles */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Сүүлийн үед нийтэлсэн</h2>
          <Link
            to="/news"
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Бүгдийг харах →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        ) : recentArticles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Мэдээ байхгүй байна. Шинэ мэдээ үүсгэнэ үү.
          </div>
        ) : (
          <ul className="divide-y">
            {recentArticles.map((article) => (
              <li key={article.id} className="flex items-center justify-between py-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{article.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <span>{article.category_name || 'Ангилал байхгүй'}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(article.created_at)}</span>
                    {article.is_featured && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-blue-600">⭐ Онцлох</span>
                      </>
                    )}
                    {article.is_breaking && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-red-600">🔥 Шуурхай</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    👁 {article.view_count || 0}
                  </span>
                  <Link
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 whitespace-nowrap"
                    to={`/news/${article.id}/edit`}
                  >
                    Засах
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/news/new"
          className="rounded-2xl border-2 border-dashed border-gray-300 p-6 hover:border-red-500 hover:bg-red-50 transition text-center group"
        >
          <div className="text-3xl mb-2">📝</div>
          <div className="font-semibold group-hover:text-red-600">Шинэ мэдээ үүсгэх</div>
        </Link>

        <Link
          to="/categories"
          className="rounded-2xl border-2 border-dashed border-gray-300 p-6 hover:border-red-500 hover:bg-red-50 transition text-center group"
        >
          <div className="text-3xl mb-2">📁</div>
          <div className="font-semibold group-hover:text-red-600">Ангилал удирдах</div>
        </Link>

        <a
          href={`${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border-2 border-dashed border-gray-300 p-6 hover:border-red-500 hover:bg-red-50 transition text-center group"
        >
          <div className="text-3xl mb-2">🌐</div>
          <div className="font-semibold group-hover:text-red-600">Вэбсайт харах</div>
        </a>
      </div>
    </div>
  );
}