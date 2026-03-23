import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

const Transactions = () => {
  const { user } = useAuth();
  const role = user?.role;

  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [receiptFiles, setReceiptFiles] = useState([]);
  const [paymentReceipts, setPaymentReceipts] = useState([]);

  const [formData, setFormData] = useState({
    customer_id: "",
    supplier_id: "",
    amount: "",
    description: "",
    payment_type: "paid",
  });
  const [paymentForm, setPaymentForm] = useState({
    target: "customer",
    customer_id: "",
    supplier_id: "",
    amount: "",
    description: "",
  });

  const [actionModal, setActionModal] = useState({
    open: false,
    txId: null,
    type: "",
  });

  const [rejectionReason, setRejectionReason] = useState("");

  const canCreate = ["sales", "procurement", "production"].includes(role);
  const isManager = role === "general_manager";
  const isAccountant = role === "accountant";

  useEffect(() => {
    fetchTransactions();

    if (role === "sales" || role === "general_manager") fetchCustomers();
    if (role === "procurement" || role === "general_manager") fetchSuppliers();
  }, [statusFilter, role]);

  useEffect(() => {
    if (role === "production") {
      setFormData((prev) => ({ ...prev, payment_type: "paid" }));
    }
  }, [role]);

  const fetchTransactions = async () => {
    try {
      let status = statusFilter;
      if (isManager && statusFilter === "pending") {
        status = "accountant_approved";
      }
      const params = status ? { status } : {};
      const res = await api.get("/transactions", { params });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    const res = await api.get("/customers");
    setCustomers(res.data);
  };

  const fetchSuppliers = async () => {
    const res = await api.get("/suppliers");
    setSuppliers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("amount", formData.amount);
      data.append("description", formData.description);
      data.append("payment_type", formData.payment_type);
      if (receiptFiles.length) {
        receiptFiles.forEach((file) => data.append("receipt", file));
      }

      if (role === "sales") {
        data.append("customer_id", formData.customer_id);
      }

      if (role === "procurement") {
        data.append("supplier_id", formData.supplier_id);
      }

      await api.post("/transactions", data);

      setShowModal(false);

      setFormData({
        customer_id: "",
        supplier_id: "",
        amount: "",
        description: "",
        payment_type: "paid",
      });

      setReceiptFiles([]);

      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create transaction");
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("amount", paymentForm.amount);
      if (paymentForm.description) {
        data.append("description", paymentForm.description);
      }
      if (paymentReceipts.length) {
        paymentReceipts.forEach((file) => data.append("receipt", file));
      }
      if (paymentForm.target === "customer") {
        data.append("customer_id", paymentForm.customer_id);
      } else {
        data.append("supplier_id", paymentForm.supplier_id);
      }

      await api.post("/transactions/record-payment", data);

      setShowPaymentModal(false);
      setPaymentForm({
        target: "customer",
        customer_id: "",
        supplier_id: "",
        amount: "",
        description: "",
      });
      setPaymentReceipts([]);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record payment");
    }
  };

  const openApprove = (id) => {
    setActionModal({ open: true, txId: id, type: "approve" });
  };

  const openAccountantApprove = (id) => {
    setActionModal({ open: true, txId: id, type: "accountant-approve" });
  };

  const openReject = (id) => {
    setActionModal({ open: true, txId: id, type: "reject" });
  };

  const closeActionModal = () => {
    setActionModal({ open: false, txId: null, type: "" });
    setRejectionReason("");
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();

    try {
      if (actionModal.type === "approve") {
        await api.post(`/transactions/${actionModal.txId}/approve`);
      } else if (actionModal.type === "accountant-approve") {
        await api.post(`/transactions/${actionModal.txId}/accountant-approve`);
      } else {
        await api.post(`/transactions/${actionModal.txId}/reject`, {
          rejection_reason: rejectionReason,
        });
      }

      closeActionModal();
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const toReceiptUrl = (receipt) => {
    if (!receipt) return null;
    if (receipt.startsWith("http://") || receipt.startsWith("https://")) return receipt;

    const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
    const normalized = receipt.replace(/\\/g, "/");

    const idx = normalized.indexOf("/uploads/");
    if (idx >= 0) return `${base}${normalized.slice(idx)}`;

    const idx2 = normalized.indexOf("uploads/");
    if (idx2 >= 0) return `${base}/${normalized.slice(idx2)}`;

    if (normalized.startsWith("/")) return `${base}${normalized}`;
    return `${base}/uploads/${normalized}`;
  };

  const getReceiptUrls = (tx) => {
    const receipt = tx?.receipt_path || tx?.receipt_image || tx?.receipt_url;
    if (!receipt) return [];
    if (Array.isArray(receipt)) {
      return receipt.map(toReceiptUrl).filter(Boolean);
    }
    if (typeof receipt === "string") {
      const trimmed = receipt.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.map(toReceiptUrl).filter(Boolean);
          }
        } catch {
          // fall through
        }
      }
      const singleUrl = toReceiptUrl(trimmed);
      return singleUrl ? [singleUrl] : [];
    }
    return [];
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="p-2">

      {/* HEADER */}

      <div className="flex justify-between mb-6 p-4">
        <h1 className="md:text-3xl text-xl font-bold">Transactions</h1>

        <div className="space-x-2">
          {canCreate && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium cursor-pointer md:text-xl"
            >
              New Transaction
            </button>
          )}
          {isManager && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm font-medium cursor-pointer md:text-xl"
            >
              Record Payment
            </button>
          )}
        </div>
      </div>

      {/* FILTER */}

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="mb-4 border px-3 py-2 rounded"
      >
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="manager_approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {/* LIST */}

      <div className="bg-white shadow rounded">
        <ul className="divide-y">

          {transactions.map((tx) => (

            <li key={tx.id} className="p-4 flex justify-between">

              <div>

                <p className="font-semibold text-indigo-600">
                  ${Number(tx.amount).toLocaleString()}
                </p>

                <p className="text-sm text-gray-500">
                  Department: {tx.source_department}
                </p>

                <p className="text-sm text-gray-500">
                  Payment: {tx.payment_type}
                </p>

                <p className="text-sm text-gray-500">
                  Status: {tx.status}
                </p>

                {tx.description && (
                  <p className="text-sm text-gray-500">
                    {tx.description}
                  </p>
                )}

                <p className="text-sm text-gray-500">
                  Receipt: {getReceiptUrls(tx).length ? (
                    <span className="space-x-2">
                      {getReceiptUrls(tx).map((url, idx) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          View {idx + 1}
                        </a>
                      ))}
                    </span>
                  ) : (
                    "None"
                  )}
                </p>

              </div>

              {isAccountant && tx.status === "pending" && (
                <div className="space-x-2">
                  <button
                    onClick={() => openAccountantApprove(tx.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Accountant Approve
                  </button>
                  <button
                    onClick={() => openReject(tx.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}

              {isManager && tx.status === "accountant_approved" && (
                <div className="space-x-2">

                  <button
                    onClick={() => openApprove(tx.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => openReject(tx.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>

                </div>
              )}

            </li>

          ))}

        </ul>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">New Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {role === "sales" && (
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
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {role === "procurement" && (
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
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Type *</label>
                {role === "production" ? (
                  <input
                    type="text"
                    disabled
                    value="paid"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                ) : (
                  <select
                    required
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="paid">Paid</option>
                    {role === "sales" && <option value="credit">Credit</option>}
                    {role === "procurement" && <option value="debt">Debt</option>}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Receipt (JPG/PNG/PDF)</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  onChange={(e) => setReceiptFiles(Array.from(e.target.files || []))}
                  className="mt-1 block w-full text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setReceiptFiles([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-2">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Record Payment</h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment For *</label>
                <select
                  value={paymentForm.target}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      target: e.target.value,
                      customer_id: "",
                      supplier_id: "",
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="customer">Customer Credit</option>
                  <option value="supplier">Supplier Debt</option>
                </select>
              </div>

              {paymentForm.target === "customer" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer *</label>
                  <select
                    required
                    value={paymentForm.customer_id}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, customer_id: e.target.value })
                    }
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
                    value={paymentForm.supplier_id}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, supplier_id: e.target.value })
                    }
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
                  min="0"
                  required
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={paymentForm.description}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, description: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Receipt (JPG/PNG/PDF)</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  onChange={(e) => setPaymentReceipts(Array.from(e.target.files || []))}
                  className="mt-1 block w-full text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentReceipts([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionModal.open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">
              {actionModal.type === "approve"
                ? "Approve Transaction"
                : actionModal.type === "accountant-approve"
                ? "Accountant Approve"
                : "Reject Transaction"}
            </h3>
            <form onSubmit={handleActionSubmit} className="space-y-4">
              {actionModal.type === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-md ${
                    actionModal.type === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : actionModal.type === "accountant-approve"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirm
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
