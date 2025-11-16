// src/pages/Submissions.jsx

import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Submissions = () => {
  const { apiRequest } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      
      const data = await apiRequest(`/submissions${statusParam}`);
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Саналуудыг унших алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  // Update submission status
  const updateStatus = async (id, status) => {
    const statusText = status === 'approved' ? 'батлах' : 'татгалзах';
    
    if (!window.confirm(`Энэ саналыг ${statusText} уу?`)) {
      return;
    }

    try {
      await apiRequest(`/submissions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });

      alert(`Санал амжилттай ${status === 'approved' ? 'батлагдлаа' : 'татгалзлаа'}`);
      fetchSubmissions();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Төлөв өөрчлөхөд алдаа гарлаа');
    }
  };

  // Delete submission
  const deleteSubmission = async (id) => {
    if (!window.confirm('Энэ саналыг устгах уу? Энэ үйлдлийг буцаах боломжгүй!')) {
      return;
    }

    try {
      await apiRequest(`/submissions/${id}`, {
        method: 'DELETE'
      });

      alert('Санал амжилттай устгагдлаа');
      fetchSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Санал устгахад алдаа гарлаа');
    }
  };

  // View submission details
  const viewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'Хүлээгдэж буй',
      approved: 'Батлагдсан',
      rejected: 'Татгалзсан'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Stats
  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ардын элч - Иргэдийн санал</h1>
        <p className="text-gray-600">Иргэдээс ирсэн санал хүсэлтүүдийг удирдах</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
          <div className="text-sm text-gray-600 mb-1">Нийт</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600 mb-1">Хүлээгдэж буй</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">Батлагдсан</div>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600 mb-1">Татгалзсан</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">Төлөв:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Бүгд
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              <Clock size={16} className="inline mr-1" />
              Хүлээгдэж буй
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <CheckCircle size={16} className="inline mr-1" />
              Батлагдсан
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <XCircle size={16} className="inline mr-1" />
              Татгалзсан
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Уншиж байна...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600 text-lg">Санал байхгүй байна</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Нэр
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Гарчиг
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Холбоо барих
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Төлөв
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Огноо
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{submission.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{submission.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {submission.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {submission.email && <div>{submission.email}</div>}
                        {submission.phone && <div>{submission.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={submission.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {/* View button */}
                        <button
                          onClick={() => viewDetails(submission)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Дэлгэрэнгүй"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Approve button */}
                        {submission.status !== 'approved' && (
                          <button
                            onClick={() => updateStatus(submission.id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                            title="Батлах"
                          >
                            <Check size={18} />
                          </button>
                        )}

                        {/* Reject button */}
                        {submission.status !== 'rejected' && (
                          <button
                            onClick={() => updateStatus(submission.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                            title="Татгалзах"
                          >
                            <X size={18} />
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => deleteSubmission(submission.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Устгах"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Саналын дэлгэрэнгүй
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-gray-900">#{selectedSubmission.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Нэр</label>
                  <p className="text-gray-900">{selectedSubmission.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedSubmission.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedSubmission.email}</p>
                    </div>
                  )}
                  {selectedSubmission.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Утас</label>
                      <p className="text-gray-900">{selectedSubmission.phone}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Гарчиг</label>
                  <p className="text-gray-900 font-medium">{selectedSubmission.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Санал / Хүсэлт</label>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedSubmission.content}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Төлөв</label>
                    <div className="mt-1">
                      <StatusBadge status={selectedSubmission.status} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Огноо</label>
                    <p className="text-gray-900">{formatDate(selectedSubmission.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end gap-3">
                {selectedSubmission.status !== 'approved' && (
                  <button
                    onClick={() => {
                      updateStatus(selectedSubmission.id, 'approved');
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Check size={18} />
                    Батлах
                  </button>
                )}
                {selectedSubmission.status !== 'rejected' && (
                  <button
                    onClick={() => {
                      updateStatus(selectedSubmission.id, 'rejected');
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <X size={18} />
                    Татгалзах
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Хаах
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;