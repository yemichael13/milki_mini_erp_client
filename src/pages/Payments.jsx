import { useEffect, useState } from 'react';
import api from '../lib/api';

const Payments = () => {
  const [tab, setTab] = useState('customer'); // 'customer' | 'supplier'
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    supplier_id: '',
    amount: '',
    payment_date: new Date().toISOString().slice(0, 10),
    reference: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchCustomers();
    fetchSuppliers();
  }, [tab]);

  const endpoint = tab === 'customer' ? '/customer-payments' : '/supplier-payments';

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get(endpoint);
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload =
        tab === 'customer'
          ? {
              customer_id: formData.customer_id,
              amount: formData.amount,
              payment_date: formData.payment_date,
              reference: formData.reference,
            }
          : {
              supplier_id: formData.supplier_id,
              amount: formData.amount,
              payment_date: formData.payment_date,
              reference: formData.reference,
            };

      await api.post(endpoint, payload);
      setShowModal(false);
      setFormData({
        customer_id: '',
        supplier_id: '',
        amount: '',
        payment_date: new Date().toISOString().slice(0, 10),
        reference: '',
      });
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Record Payment
        </button>
      </div>
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setTab('customer')}
          className={`px-4 py-2 rounded-md border ${
            tab === 'customer'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          Customer Payments
        </button>
        <button
          onClick={() => setTab('supplier')}
          className={`px-4 py-2 rounded-md border ${
            tab === 'supplier'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          Supplier Payments
        </button>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {payments.map((payment) => (
            <li key={payment.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">
                      {(payment.customer_name || payment.supplier_name)} - ${parseFloat(payment.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(payment.payment_date).toLocaleDateString()}
                    </p>
                    {payment.reference && (
                      <p className="text-sm text-gray-500">Reference: {payment.reference}</p>
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
            <h3 className="text-lg font-bold mb-4">Record Payment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'customer' ? (
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
              ) : (
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
