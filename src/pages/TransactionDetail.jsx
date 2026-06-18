import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import {
  formatDateTime,
  formatDepartment,
  formatDisplayEmail,
  formatDisplayName,
  formatMoney,
  getReceiptKind,
  getReceiptUrls,
  getTransactionLabel,
} from "../lib/transactionUtils";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  accountant_approved: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  manager_approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

const receiptKindLabel = {
  image: "Image preview",
  pdf: "PDF preview",
  file: "File",
  unknown: "File",
};

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/transactions/${id}`);
        setTransaction(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load transaction");
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [id]);

  const receipts = getReceiptUrls(transaction, api.defaults.baseURL);
  const creatorName = formatDisplayName(transaction?.created_by_name, transaction?.created_by_email);
  const creatorEmail = formatDisplayEmail(transaction?.created_by_email);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-slate-600 shadow-sm">
          Loading transaction details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          <p className="font-semibold">Could not load this transaction</p>
          <p className="mt-2 text-sm">{error}</p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => navigate("/transactions")}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Back to Transactions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  const statusClass = statusStyles[transaction.status] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  const approverName = formatDisplayName(transaction?.manager_approved_by_name, transaction?.manager_approved_by_email);
  const rejectedByName = formatDisplayName(transaction?.rejected_by_name, transaction?.rejected_by_email);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/transactions")}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Back to transactions
          </button>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Transaction #{transaction.id}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {getTransactionLabel(transaction.type)} for {formatDepartment(transaction.source_department)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}>
            {transaction.status}
          </span>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {formatMoney(transaction.amount)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Transaction Information</h2>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Read only</span>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Transaction ID" value={transaction.id} />
              <DetailItem label="Department" value={formatDepartment(transaction.source_department)} />
              <DetailItem label="Type" value={getTransactionLabel(transaction.type)} />
              <DetailItem label="Amount" value={formatMoney(transaction.amount)} />
              <DetailItem label="Payment Type" value={getTransactionLabel(transaction.payment_type)} />
              <DetailItem label="Status" value={transaction.status} />
              <DetailItem label="Created Date" value={formatDateTime(transaction.created_at)} />
              <DetailItem label="Last Updated" value={formatDateTime(transaction.updated_at)} />
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Description</dt>
                <dd className="mt-1 whitespace-pre-wrap rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {transaction.description || "No description provided"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Created By</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Name" value={creatorName} />
              <DetailItem label="Email" value={creatorEmail} />
              <DetailItem label="Department" value={formatDepartment(transaction.source_department)} />
              <DetailItem label="Role" value={formatDepartment(transaction.created_by_role)} />
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Approval Information</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Current Status" value={transaction.status} />
              <DetailItem
                label="Manager Approved By"
                value={transaction.manager_approved_by_name ? approverName : "Not available"}
              />
              <DetailItem
                label="Rejected By"
                value={transaction.rejected_by_name ? rejectedByName : "Not available"}
              />
              <DetailItem
                label="Rejection Reason"
                value={transaction.rejection_reason || "Not available"}
              />
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Receipt</h2>
            <p className="mt-1 text-sm text-slate-500">
              Preview the uploaded file without leaving this page.
            </p>

            <div className="mt-4 space-y-4">
              {receipts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No receipt uploaded
                </div>
              ) : (
                receipts.map((url, index) => {
                  const kind = getReceiptKind(url);
                  return (
                    <div key={url} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Receipt {index + 1}
                          </p>
                          <p className="text-xs text-slate-500">
                            {receiptKindLabel[kind] || "File"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Open
                          </a>
                          <a
                            href={url}
                            download
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                          >
                            Download
                          </a>
                        </div>
                      </div>

                      {kind === "image" ? (
                        <img
                          src={url}
                          alt={`Receipt ${index + 1}`}
                          className="max-h-[30rem] w-full rounded-xl object-contain bg-white"
                        />
                      ) : kind === "pdf" ? (
                        <iframe
                          src={url}
                          title={`Receipt ${index + 1}`}
                          className="h-[34rem] w-full rounded-xl border border-slate-200 bg-white"
                        />
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                          Preview unavailable for this file type.
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick Facts</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <InfoRow label="Created by" value={creatorName} />
              <InfoRow label="Department" value={formatDepartment(transaction.source_department)} />
              <InfoRow label="Status" value={transaction.status} />
              <InfoRow label="Payment" value={getTransactionLabel(transaction.payment_type)} />
            </div>
          </section>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          to="/transactions"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Back to Transactions
        </Link>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
    <span className="text-slate-500">{label}</span>
    <span className="text-right font-medium text-slate-900">{value}</span>
  </div>
);

export default TransactionDetail;
