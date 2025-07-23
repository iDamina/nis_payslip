// src/pages/Admin.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserFromToken, logout, getToken } from '../utils/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../components/Footer';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('view');
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [passwordUpdate, setPasswordUpdate] = useState({ userId: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const token = getToken();
  const user = getUserFromToken();

  useEffect(() => {
    if (!user) {
      toast.error("⛔ Session expired or unauthorized");
      navigate("/login");
    } else if (user.role !== 'admin') {
      navigate("/forbidden");
    } else {
      fetchUsers();
    }

    setLoading(false);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      toast.error('❌ Failed to load users');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ User created successfully');
      setForm({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      toast.error('❌ Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/users/${passwordUpdate.userId}/password`, {
        password: passwordUpdate.password,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ Password updated');
      setPasswordUpdate({ userId: '', password: '' });
    } catch (err) {
      toast.error('❌ Failed to update password');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('❌ Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("✅ Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2m8.485-8.485l-1.414-1.414M4.929 4.929L3.515 3.515M21 12h-2M5 12H3m16.485 8.485l-1.414-1.414M4.929 19.071L3.515 20.485" />
          </svg>
          <span className="text-gray-600 font-medium">Checking access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className='flex flex-1'>
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-green-800 to-green-900 text-white shadow-xl relative flex flex-col">
          <div className="p-6 flex-grow">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Admin Panel</h2>
                <p className="text-green-200 text-sm">Welcome, {user?.name}</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('view')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'view' 
                    ? 'bg-green-700 text-white shadow-lg' 
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>View Users</span>
              </button>
              
              <button
                onClick={() => setActiveTab('create')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'create' 
                    ? 'bg-green-700 text-white shadow-lg' 
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create User</span>
              </button>
              
              <button
                onClick={() => setActiveTab('update')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'update' 
                    ? 'bg-green-700 text-white shadow-lg' 
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Update Password</span>
              </button>
            </nav>
          </div>
          
          {/* Logout Button - Fixed positioning */}
          <div className="p-6 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-600 hover:bg-opacity-20 rounded-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className='flex-1 p-8'>
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Manage users and system settings</p>
              </div>

              {/* Create User Form */}
              {activeTab === 'create' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
                  </div>
                  
                  <form onSubmit={handleCreate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          placeholder="Enter full name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          placeholder="Enter email address"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                          type="password"
                          placeholder="Enter password"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                          value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          required
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                    >
                      {createLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2m8.485-8.485l-1.414-1.414M4.929 4.929L3.515 3.515M21 12h-2M5 12H3m16.485 8.485l-1.414-1.414M4.929 19.071L3.515 20.485" />
                          </svg>
                          <span>Creating User...</span>
                        </div>
                      ) : (
                        'Create User'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Update Password Form */}
              {activeTab === 'update' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Update User Password</h2>
                  </div>
                  
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                      <select
                        value={passwordUpdate.userId}
                        onChange={(e) => setPasswordUpdate({ ...passwordUpdate, userId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        required
                      >
                        <option value="">Choose a user to update</option>
                        {users.map(u => (
                          <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={passwordUpdate.password}
                        onChange={(e) => setPasswordUpdate({ ...passwordUpdate, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                    >
                      {updateLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2m8.485-8.485l-1.414-1.414M4.929 4.929L3.515 3.515M21 12h-2M5 12H3m16.485 8.485l-1.414-1.414M4.929 19.071L3.515 20.485" />
                          </svg>
                          <span>Updating Password...</span>
                        </div>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Users Table */}
              {activeTab === 'view' && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
                          <p className="text-gray-600">Manage system users and their permissions</p>
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                        {users.length} Users
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">User</th>
                          <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Email</th>
                          <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Role</th>
                          <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-8 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">{u.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                            <td className="px-8 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                u.role === 'admin' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-8 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleDelete(u._id)}
                                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <Footer variant='light' />   
        </div>
      </div>

      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Admin;