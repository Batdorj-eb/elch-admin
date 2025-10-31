import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([
    { id: 1, name: 'admin', email: 'admin@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'saraa', email: 'saraa@example.com', role: 'editor', status: 'active' },
    { id: 3, name: 'bold', email: 'bold@example.com', role: 'author', status: 'suspended' },
  ]);

  const toggleRole = (id) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, role: r.role === 'editor' ? 'author' : 'editor' } : r,
      ),
    );
  const toggleStatus = (id) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'active' ? 'suspended' : 'active' } : r,
      ),
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-extrabолд text-2xl tracking-tight">Хэрэглэгчийн удирдлага</h1>
        <div className="text-sm text-gray-500">
          Таны эрх: <span className="font-semibold">{user?.role}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-left">Нэр</th>
              <th className="p-3 text-left">И-мэйл</th>
              <th className="p-3 text-left">Эрх</th>
              <th className="p-3 text-left">Төлөв</th>
              <th className="p-3 text-right">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3 font-medium">{row.name}</td>
                <td className="p-3">{row.email}</td>
                <td className="p-3">
                  <span
                    className={
                      'rounded-full px-2 py-1 text-xs ' +
                      (row.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700')
                    }
                  >
                    {row.role}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={
                      'rounded-full px-2 py-1 text-xs ' +
                      (row.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700')
                    }
                  >
                    {row.status}
                  </span>
                </td>
                <td className="space-x-2 p-3 text-right">
                  {row.role !== 'admin' && (
                    <button
                      onClick={() => toggleRole(row.id)}
                      className="rounded-md bg-gray-100 px-3 py-1.5 hover:bg-gray-200"
                    >
                      Role
                    </button>
                  )}
                  {row.name !== 'admin' && (
                    <button
                      onClick={() => toggleStatus(row.id)}
                      className="rounded-md bg-gray-100 px-3 py-1.5 hover:bg-gray-200"
                    >
                      Статус
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
