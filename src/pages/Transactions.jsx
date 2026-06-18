import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import {
  formatDateTime,
  formatDepartment,
  formatDisplayEmail,
  formatDisplayName,
  formatMoney,
  getReceiptUrls,
  getTransactionLabel,
} from "../lib/transactionUtils";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  accountant_approved: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  manager_approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

const actionButtonBase =
  "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors";

const Transactions = () => {
  const { user } = useAuth();
  const role = user?.role;

  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

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
      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [isManager, statusFilter]);

  const fetchCustomers = useCallback(async () => {
    const res = await api.get("/customers");
    setCustomers(res.data);
  }, []);

  const fetchSuppliers = useCallback(async () => {
    const res = await api.get("/suppliers");
    setSuppliers(res.data);
  }, []);

  useEffect(() => {
    fetchTransactions();

    if (role === "sales" || role === "general_manager") fetchCustomers();
    if (role === "procurement" || role === "general_manager") fetchSuppliers();
  }, [fetchTransactions, fetchCustomers, fetchSuppliers, role]);

  useEffect(() => {
    if (role === "production") {
      setFormData((prev) => ({ ...prev, payment_type: "paid" }));
    }
  }, [role]);

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

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="p-2">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Finance workflow
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Transactions</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review, filter, and inspect transaction activity with creator details, created
              timestamps, and a dedicated detail view.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canCreate && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                New Transaction
              </button>
            )}
            {isManager && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                Record Payment
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-slate-600" htmlFor="status-filter">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accountant_approved">Accountant Approved</option>
            <option value="manager_approved">Manager Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            type="button"
            onClick={fetchTransactions}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[1220px] divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <Th>Money Amount</Th>
                <Th>Department</Th>
                <Th>Created By</Th>
                <Th>Payment Type</Th>
                <Th>Status</Th>
                <Th>Description</Th>
                <Th>Receipt</Th>
                <Th>Transaction Created Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const creatorName = formatDisplayName(tx.created_by_name, tx.created_by_email);
                  const creatorEmail = formatDisplayEmail(tx.created_by_email);
                  const receiptUrls = getReceiptUrls(tx, api.defaults.baseURL);
                  const statusClass =
                    statusStyles[tx.status] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

                  return (
                    <tr key={tx.id} className="align-top hover:bg-slate-50/70">
                      <Td>
                        <div className="font-semibold text-slate-900">{formatMoney(tx.amount)}</div>
                      </Td>

                      <Td>
                        <div className="text-sm font-medium text-slate-900">
                          {formatDepartment(tx.source_department)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Created by {creatorName}
                        </div>
                      </Td>

                      <Td>
                        <div className="text-sm font-medium text-slate-900">{creatorName}</div>
                        <div className="mt-1 text-xs text-slate-500">{creatorEmail}</div>
                      </Td>

                      <Td>
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                          {getTransactionLabel(tx.payment_type)}
                        </span>
                      </Td>

                      <Td>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}>
                          {tx.status}
                        </span>
                      </Td>

                      <Td>
                        <div className="max-w-[20rem] text-sm text-slate-700">
                          {tx.description ? (
                            <span className="block truncate" title={tx.description}>
                              {tx.description}
                            </span>
                          ) : (
                            <span className="text-slate-400">No description</span>
                          )}
                        </div>
                      </Td>

                      <Td>
                        {receiptUrls.length ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={receiptUrls[0]}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                              >
                                View
                              </a>
                              <a
                                href={receiptUrls[0]}
                                download
                                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
                              >
                                Download
                              </a>
                            </div>
                            {receiptUrls.length > 1 && (
                              <span className="text-xs text-slate-500">
                                +{receiptUrls.length - 1} more file
                                {receiptUrls.length - 1 > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">None</span>
                        )}
                      </Td>

                      <Td>
                        <div className="text-sm text-slate-700">{formatDateTime(tx.created_at)}</div>
                      </Td>

                      <Td>
                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/transactions/${tx.id}`}
                            className={`${actionButtonBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-100`}
                          >
                            View Details
                          </Link>

                          {isAccountant && tx.status === "pending" && (
                            <>
                              <button
                                onClick={() => openAccountantApprove(tx.id)}
                                className={`${actionButtonBase} bg-blue-600 text-white hover:bg-blue-700`}
                              >
                                Accountant Approve
                              </button>
                              <button
                                onClick={() => openReject(tx.id)}
                                className={`${actionButtonBase} bg-rose-600 text-white hover:bg-rose-700`}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isManager && tx.status === "accountant_approved" && (
                            <>
                              <button
                                onClick={() => openApprove(tx.id)}
                                className={`${actionButtonBase} bg-emerald-600 text-white hover:bg-emerald-700`}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openReject(tx.id)}
                                className={`${actionButtonBase} bg-rose-600 text-white hover:bg-rose-700`}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-2 backdrop-blur-sm">
          <div className="relative top-16 mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">New Transaction</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {role === "sales" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Customer *</label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
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

              {role === "procurement" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Supplier *</label>
                  <select
                    required
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
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
                <label className="block text-sm font-medium text-slate-700">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Payment Type *</label>
                {role === "production" ? (
                  <input
                    type="text"
                    disabled
                    value="paid"
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
                  />
                ) : (
                  <select
                    required
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="paid">Paid</option>
                    {role === "sales" && <option value="credit">Credit</option>}
                    {role === "procurement" && <option value="debt">Debt</option>}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Receipt (JPG/PNG/PDF)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  onChange={(e) => setReceiptFiles(Array.from(e.target.files || []))}
                  className="mt-1 block w-full text-sm"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setReceiptFiles([]);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-2 backdrop-blur-sm">
          <div className="relative top-16 mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Payment For *</label>
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
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="customer">Customer Credit</option>
                  <option value="supplier">Supplier Debt</option>
                </select>
              </div>

              {paymentForm.target === "customer" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Customer *</label>
                  <select
                    required
                    value={paymentForm.customer_id}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, customer_id: e.target.value })
                    }
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
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
                  <label className="block text-sm font-medium text-slate-700">Supplier *</label>
                  <select
                    required
                    value={paymentForm.supplier_id}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, supplier_id: e.target.value })
                    }
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
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
                <label className="block text-sm font-medium text-slate-700">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={paymentForm.description}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Receipt (JPG/PNG/PDF)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  onChange={(e) => setPaymentReceipts(Array.from(e.target.files || []))}
                  className="mt-1 block w-full text-sm"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentReceipts([]);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-2 backdrop-blur-sm">
          <div className="relative top-16 mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {actionModal.type === "approve"
                ? "Approve Transaction"
                : actionModal.type === "accountant-approve"
                ? "Accountant Approve"
                : "Reject Transaction"}
            </h3>
            <form onSubmit={handleActionSubmit} className="mt-4 space-y-4">
              {actionModal.type === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                    actionModal.type === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : actionModal.type === "accountant-approve"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-rose-600 hover:bg-rose-700"
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

const Th = ({ children }) => (
  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
    {children}
  </th>
);

const Td = ({ children }) => <td className="px-6 py-4 text-sm text-slate-700">{children}</td>;

export default Transactions;
