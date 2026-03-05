import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const Transactions = ({ workflow }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    supplier_id: '',
    amount: '',
    description: '',
    payment_type: 'credit',
  });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTransactions();
    if (workflow === 'sales') fetchCustomers();
    if (workflow === 'procurement') fetchSuppliers();
  }, [statusFilter]);

  const isOfficer =
    (workflow === 'sales' && user?.role === 'sales_officer') ||
    (workflow === 'procurement' && user?.role === 'procurement_officer') ||
    (workflow === 'production' && user?.role === 'production_officer');
  const isAccountant = user?.role === 'accountant';
  const isGM = user?.role === 'general_manager';

  const fetchTransactions = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const path = isOfficer ? `/${workflow}/mine` : `/${workflow}`;
      const res = await api.get(path, { params });
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload =
        workflow === 'sales'
          ? {
              customer_id: formData.customer_id,
              amount: formData.amount,
              description: formData.description,
              payment_type: formData.payment_type,
            }
          : workflow === 'procurement'
            ? {
                supplier_id: formData.supplier_id,
                amount: formData.amount,
                description: formData.description,
                payment_type: formData.payment_type,
              }
            : {
                amount: formData.amount,
                description: formData.description,
              };

      await api.post(`/${workflow}`, payload);
      setShowModal(false);
      setFormData({
        customer_id: '',
        supplier_id: '',
        amount: '',
        description: '',
        payment_type: 'credit',
      });
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create transaction');
    }
  };

  const handleApprove = async (id, type) => {
    try {
      await api.post(`/${workflow}/${id}/${type}`);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (reason !== null) {
      try {
        await api.post(`/${workflow}/${id}/reject`, { rejection_reason: reason });
        fetchTransactions();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to reject');
      }
    }
  };

  const canAccountantApprove = (status) => status === 'pending' && isAccountant;
  const canManagerApprove = (status) => status === 'accountant_approved' && isGM;

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 capitalize">{workflow} Transactions</h1>
        {isOfficer && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            New Transaction
          </button>
        )}
      </div>
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accountant_approved">Accountant Approved</option>
          <option value="manager_approved">Manager Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {transactions.map((tx) => (
            <li key={tx.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">
                      {workflow === 'sales'
                        ? `${tx.customer_name} - $${parseFloat(tx.amount).toLocaleString()}`
                        : workflow === 'procurement'
                          ? `${tx.supplier_name} - $${parseFloat(tx.amount).toLocaleString()}`
                          : `$${parseFloat(tx.amount).toLocaleString()}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: <span className="font-medium">{tx.status}</span>
                    </p>
                    {tx.payment_type && (
                      <p className="text-sm text-gray-500">
                        Payment type: <span className="font-medium">{tx.payment_type}</span>
                      </p>
                    )}
                    {tx.description && <p className="text-sm text-gray-500">{tx.description}</p>}
                  </div>
                  <div className="flex space-x-2">
                    {canAccountantApprove(tx.status) && (
                      <button
                        onClick={() => handleApprove(tx.id, 'accountant-approve')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve (Accountant)
                      </button>
                    )}
                    {canManagerApprove(tx.status) && (
                      <button
                        onClick={() => handleApprove(tx.id, 'manager-approve')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve (Manager)
                      </button>
                    )}
                    {(isAccountant || isGM) &&
                      tx.status !== 'manager_approved' && tx.status !== 'rejected' && (
                        <button
                          onClick={() => handleReject(tx.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">New Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {workflow === 'sales' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer *</label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {workflow === 'procurement' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier *</label>
                  <select
                    required
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              {(workflow === 'sales' || workflow === 'procurement') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment type *</label>
                  <select
                    required
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="paid">Paid</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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

export default Transactions;
