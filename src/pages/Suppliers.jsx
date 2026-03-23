import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const Suppliers = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [search, setSearch] = useState('');
  const canCreate = user?.role === 'procurement';

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers', { params: { search } });
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/suppliers', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create supplier');
    }
  };

  const viewDebt = async (supplierId) => {
    try {
      const res = await api.get(`/suppliers/${supplierId}`, { params: { debt: true } });
      const bal = Number(res.data.debt_balance || 0);
      alert(`Supplier debt balance: ${bal.toLocaleString()}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load supplier debt');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className='p-2'>
      <div className="flex justify-between items-center mb-6 p-4">
        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium cursor-pointer md:text-xl"
          >
            Add Supplier
          </button>
        )}
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {suppliers.map((supplier) => (
            <li key={supplier.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600 truncate">{supplier.name}</p>
                    {supplier.email && <p className="text-sm text-gray-500">{supplier.email}</p>}
                    {supplier.phone && <p className="text-sm text-gray-500">{supplier.phone}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => viewDebt(supplier.id)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    View Debt
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {showModal && canCreate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Add Supplier</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
