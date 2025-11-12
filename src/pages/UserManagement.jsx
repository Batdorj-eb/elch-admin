// components/UserManagement.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserManagement() {
  const { apiRequest, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUserId, setPasswordUserId] = useState(null);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'author',
    avatar: ''
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const data = await apiRequest(`/users?${params.toString()}`);
      
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Хэрэглэгч ачаалах алдаа:', error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const data = await apiRequest('/users/stats/overview');
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Статистик ачаалах алдаа:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [roleFilter, searchQuery]);

  // Create user
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password) {
      alert('Username, email, password заавал оруулна уу!');
      return;
    }

    if (formData.password.length < 6) {
      alert('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой!');
      return;
    }

    try {
      const data = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (data.success) {
        alert('Хэрэглэгч амжилттай үүсгэлээ!');
        setShowModal(false);
        resetForm();
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      alert(error.message || 'Хэрэглэгч үүсгэхэд алдаа гарлаа');
    }
  };

  // Update user
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const { password, ...updateData } = formData;
      
      const data = await apiRequest(`/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (data.success) {
        alert('Хэрэглэгч амжилттай засагдлаа!');
        setShowModal(false);
        setEditingUser(null);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      alert(error.message || 'Хэрэглэгч засахад алдаа гарлаа');
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Нууц үг таарахгүй байна!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой!');
      return;
    }

    try {
      const data = await apiRequest(`/users/${passwordUserId}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ password: newPassword })
      });

      if (data.success) {
        alert('Нууц үг амжилттай солигдлоо!');
        setShowPasswordModal(false);
        setPasswordUserId(null);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      alert(error.message || 'Нууц үг солихд алдаа гарлаа');
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      alert('Өөрийгөө устгах боломжгүй!');
      return;
    }

    if (!confirm('Энэ хэрэглэгчийг устгах уу?')) return;

    try {
      const data = await apiRequest(`/users/${id}`, {
        method: 'DELETE'
      });

      if (data.success) {
        alert('Хэрэглэгч амжилттай устгагдлаа!');
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      alert(error.message || 'Хэрэглэгч устгахад алдаа гарлаа');
    }
  };

  // Open edit modal
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      full_name: user.full_name || '',
      role: user.role,
      avatar: user.avatar || ''
    });
    setShowModal(true);
  };

  // Open password modal
  const openPasswordModal = (userId) => {
    setPasswordUserId(userId);
    setShowPasswordModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'author',
      avatar: ''
    });
    setEditingUser(null);
  };

  // Close modals
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordUserId(null);
    setNewPassword('');
    setConfirmPassword('');
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Хэрэглэгчийн удирдлага</h1>
        <p className="text-sm text-gray-600 mt-1">Системийн хэрэглэгчдийг удирдах</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Нийт</div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
            <div className="text-sm text-red-600">Админ</div>
            <div className="text-2xl font-bold text-red-700">{stats.admins}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
            <div className="text-sm text-blue-600">Редактор</div>
            <div className="text-2xl font-bold text-blue-700">{stats.editors}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
            <div className="text-sm text-green-600">Зохиолч</div>
            <div className="text-2xl font-bold text-green-700">{stats.authors}</div>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="🔍 Нэр, email хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Бүх эрх</option>
            <option value="admin">Админ</option>
            <option value="editor">Редактор</option>
            <option value="author">Зохиолч</option>
          </select>

          {/* Add Button */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
          >
            + Шинэ хэрэглэгч
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Хэрэглэгч</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Эрх</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Үүсгэсэн</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-lg">
                              {user.full_name?.charAt(0) || user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name || user.username}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role === 'admin' ? '👑 Админ' : 
                       user.role === 'editor' ? '✏️ Редактор' : 
                       '✍️ Зохиолч'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('mn-MN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openPasswordModal(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Нууц үг солих"
                      >
                        🔑
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Засах"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Устгах"
                        disabled={user.id === currentUser?.id}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-2">👥</div>
            <p className="text-gray-500">Хэрэглэгч олдсонгүй</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingUser ? 'Хэрэглэгч засах' : 'Шинэ хэрэглэгч үүсгэх'}
              </h2>
            </div>

            <form onSubmit={editingUser ? handleUpdate : handleCreate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                    required
                  />
                </div>

                {/* Password (create only) */}
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Нууц үг <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                      required={!editingUser}
                      minLength={6}
                    />
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Бүтэн нэр
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Эрх
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                  >
                    <option value="author">✍️ Зохиолч</option>
                    <option value="editor">✏️ Редактор</option>
                    <option value="admin">👑 Админ</option>
                  </select>
                </div>

                {/* Avatar URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Зураг (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? '✓ Хадгалах' : '+ Үүсгэх'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200"
                >
                  Болих
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">Нууц үг солих</h2>
            </div>

            <form onSubmit={handleChangePassword} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шинэ нууц үг
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                  required
                  minLength={6}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Нууц үг давтах
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700"
                >
                  🔑 Солих
                </button>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200"
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