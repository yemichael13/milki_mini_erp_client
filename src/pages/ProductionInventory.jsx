import { useEffect, useMemo, useState } from "react";
import { useAuth, normalizeRole } from "../contexts/AuthContext";
import api from "../lib/api";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForms = () => ({
  production: {
    product_id: "",
    quantity_pieces: "",
    production_date: today(),
    description: "",
  },
  release: {
    product_id: "",
    quantity_pieces: "",
    release_date: today(),
    description: "",
  },
  return: {
    product_id: "",
    quantity_pieces: "",
    production_date: today(),
    release_date: today(),
    return_date: today(),
    description: "",
  },
});

const emptyFilters = () => ({
  product_type: "",
  package_size_kg: "",
  package_label: "",
  status: "",
  creator: "",
  approver: "",
  from_date: "",
  to_date: "",
});

const tabs = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "Products" },
  { key: "production", label: "Production Records" },
  { key: "release", label: "Product Releases" },
  { key: "return", label: "Product Returns" },
  { key: "reports", label: "Reports" },
];

const recordMeta = {
  production: {
    title: "Production Records",
    endpoint: "/production-records",
    dateLabel: "Production Date",
    dateFields: ["production_date"],
  },
  release: {
    title: "Product Releases",
    endpoint: "/product-releases",
    dateLabel: "Release Date",
    dateFields: ["release_date"],
  },
  return: {
    title: "Product Returns",
    endpoint: "/product-returns",
    dateLabel: "Return Dates",
    dateFields: ["production_date", "release_date", "return_date"],
  },
};

const badgeClasses = {
  production_pending: "bg-amber-100 text-amber-800",
  production_approved: "bg-sky-100 text-sky-800",
  manager_pending: "bg-violet-100 text-violet-800",
  manager_approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const ProductionInventory = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const canCreate = role === "production_recorder";
  const canProductionApprove = role === "production_approver";
  const canManagerApprove = role === "general_manager";
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [reports, setReports] = useState(null);
  const [records, setRecords] = useState({
    production: [],
    release: [],
    return: [],
  });

  const [filters, setFilters] = useState(emptyFilters);
  const [forms, setForms] = useState(emptyForms);
  const [actionState, setActionState] = useState({
    open: false,
    type: "",
    id: null,
    recordType: "",
    rejection_reason: "",
  });

  const buildParams = () => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params[key] = value;
      }
    });
    return params;
  };

  const fetchAll = async () => {
    setRefreshing(true);
    try {
      const params = buildParams();
      const [productsRes, inventoryRes, reportsRes, productionRes, releaseRes, returnRes] = await Promise.all([
        api.get("/products", { params: { is_active: true } }),
        api.get("/inventory"),
        api.get("/inventory/reports", { params }),
        api.get("/production-records", { params }),
        api.get("/product-releases", { params }),
        api.get("/product-returns", { params }),
      ]);

      setProducts(productsRes.data);
      setInventory(inventoryRes.data);
      setReports(reportsRes.data);
      setRecords({
        production: productionRes.data,
        release: releaseRes.data,
        return: returnRes.data,
      });
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productTypes = useMemo(
    () => Array.from(new Set(products.map((product) => product.product_type))),
    [products]
  );

  const packageSizes = useMemo(
    () => Array.from(new Set(products.map((product) => Number(product.package_size_kg)))).sort((a, b) => a - b),
    [products]
  );

  const setFormValue = (type, field, value) => {
    setForms((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleCreate = async (type) => {
    try {
      const payload = { ...forms[type] };
      await api.post(recordMeta[type].endpoint, payload);
      setForms(emptyForms());
      fetchAll();
      setActiveTab(type);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create record");
    }
  };

  const openAction = (recordType, id, type) => {
    setActionState({
      open: true,
      type,
      id,
      recordType,
      rejection_reason: "",
    });
  };

  const closeAction = () => {
    setActionState({
      open: false,
      type: "",
      id: null,
      recordType: "",
      rejection_reason: "",
    });
  };

  const handleAction = async (event) => {
    event.preventDefault();
    try {
      const { recordType, id, type, rejection_reason } = actionState;
      const url =
        type === "manager-approve"
          ? `${recordMeta[recordType].endpoint}/${id}/manager-approve`
          : type === "approve"
          ? `${recordMeta[recordType].endpoint}/${id}/approve`
          : `${recordMeta[recordType].endpoint}/${id}/reject`;
      const payload = type === "reject" ? { rejection_reason } : undefined;
      await api.post(url, payload);
      closeAction();
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const updateFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(emptyFilters());
  };

  useEffect(() => {
    if (loading) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const renderSummaryCard = (label, value, sublabel = "") => (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-5">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      {sublabel ? <div className="mt-1 text-xs text-slate-400">{sublabel}</div> : null}
    </div>
  );

  const renderFormField = (type, field, label, inputType = "text") => {
    const value = forms[type][field];
    return (
      <div key={field}>
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <input
          type={inputType}
          value={value}
          onChange={(e) => setFormValue(type, field, e.target.value)}
          className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          required
        />
      </div>
    );
  };

  const renderRecordForm = (type) => {
    if (!canCreate) return null;
    const form = forms[type];
    const meta = recordMeta[type];
    return (
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-semibold text-slate-900">Create {meta.title}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Product</label>
            <select
              value={form.product_id}
              onChange={(e) => setFormValue(type, "product_id", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              required
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_type} - {product.package_label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Quantity Pieces</label>
            <input
              type="number"
              min="1"
              value={form.quantity_pieces}
              onChange={(e) => setFormValue(type, "quantity_pieces", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              required
            />
          </div>
          {meta.dateFields.map((field) => renderFormField(type, field, field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), "date"))}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setFormValue(type, "description", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              rows={3}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => handleCreate(type)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Create {meta.title}
          </button>
        </div>
      </div>
    );
  };

  const renderActions = (recordType, record) => {
    if (record.status === "rejected" || record.status === "manager_approved") return null;
    if (canProductionApprove && record.status === "production_pending") {
      return (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openAction(recordType, record.id, "approve")}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => openAction(recordType, record.id, "reject")}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      );
    }
    if (canManagerApprove && ["manager_pending", "production_approved"].includes(record.status)) {
      return (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openAction(recordType, record.id, "manager-approve")}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Manager Approve
          </button>
          <button
            type="button"
            onClick={() => openAction(recordType, record.id, "reject")}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      );
    }
    return null;
  };

  const renderTable = (recordType, rows) => {
    const dateField = recordMeta[recordType].dateFields[recordMeta[recordType].dateFields.length - 1];
    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Pieces</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Quintals</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Creator</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Approvals</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3 text-sm text-slate-900">
                  {record.product_type} {record.package_label ? `- ${record.package_label}` : ""}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{Number(record.quantity_pieces).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {Number(record.total_weight_quintal).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{record[dateField] || record.movement_date}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClasses[record.status] || "bg-slate-100 text-slate-700"}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <div>{record.created_by_name}</div>
                  {record.approved_by_name ? (
                    <div className="text-xs text-slate-400">Approved: {record.approved_by_name}</div>
                  ) : null}
                  {record.manager_approved_by_name ? (
                    <div className="text-xs text-slate-400">Manager: {record.manager_approved_by_name}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {record.rejection_reason ? (
                    <div className="text-xs text-red-600">{record.rejection_reason}</div>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{renderActions(recordType, record)}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={8}>
                  No records found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRecordSection = (type) => {
    const rows = records[type];
    const meta = recordMeta[type];
    return (
      <div className="space-y-6">
        {renderRecordForm(type)}
        <div>
          <h3 className="mb-3 text-xl font-semibold text-slate-900">{meta.title}</h3>
          {renderTable(type, rows)}
        </div>
      </div>
    );
  };

  const inventoryCards = inventory
    ? [
        {
          label: "Total Produced",
          value: `${Number(inventory.total_produced_pieces || 0).toLocaleString()} pcs`,
          sublabel: `${Number(inventory.total_produced_quintals || 0).toLocaleString()} quintals`,
        },
        {
          label: "Total Released",
          value: `${Number(inventory.total_released_pieces || 0).toLocaleString()} pcs`,
          sublabel: `${Number(inventory.total_released_quintals || 0).toLocaleString()} quintals`,
        },
        {
          label: "Total Returned",
          value: `${Number(inventory.total_returned_pieces || 0).toLocaleString()} pcs`,
          sublabel: `${Number(inventory.total_returned_quintals || 0).toLocaleString()} quintals`,
        },
        {
          label: "Current Inventory",
          value: `${Number(inventory.current_inventory_pieces || 0).toLocaleString()} pcs`,
          sublabel: `${Number(inventory.current_inventory_quintals || 0).toLocaleString()} quintals`,
        },
        {
          label: "Pending Approvals",
          value: Number(inventory.pending_approvals || 0).toLocaleString(),
          sublabel: "Awaiting production approver review",
        },
        {
          label: "Pending Manager Reviews",
          value: Number(inventory.pending_manager_reviews || 0).toLocaleString(),
          sublabel: "Awaiting general manager review",
        },
      ]
    : [];

  if (loading) {
    return <div className="py-10 text-center text-slate-500">Loading inventory module...</div>;
  }

  const activeContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {inventoryCards.map((card) => (
                <div key={card.label}>{renderSummaryCard(card.label, card.value, card.sublabel)}</div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">Current Stock by Product</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Balance Pieces</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Balance Quintals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(inventory?.products || []).map((row) => (
                      <tr key={row.product_id}>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {row.product_type} - {row.package_label}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{Number(row.current_balance_pieces).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {Number(row.current_balance_quintals).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "products":
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">Product Master</h3>
            <p className="mt-1 text-sm text-slate-500">Seeded product catalog. Manual creation is disabled.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Package</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Package Size KG</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3 text-sm text-slate-900">{product.product_type}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{product.package_label}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{Number(product.package_size_kg)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "production":
      case "release":
      case "return":
        return renderRecordSection(activeTab);
      case "reports":
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">Product Inventory Summary</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Produced</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Released</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Returned</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Current Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(reports?.product_inventory_summary || []).map((row) => (
                      <tr key={row.product_id}>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {row.product_type} - {row.package_label}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {Number(row.produced_pieces).toLocaleString()} pcs / {Number(row.produced_quintals).toLocaleString(undefined, { maximumFractionDigits: 2 })} qt
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {Number(row.released_pieces).toLocaleString()} pcs / {Number(row.released_quintals).toLocaleString(undefined, { maximumFractionDigits: 2 })} qt
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {Number(row.returned_pieces).toLocaleString()} pcs / {Number(row.returned_quintals).toLocaleString(undefined, { maximumFractionDigits: 2 })} qt
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                          {Number(row.current_balance_pieces).toLocaleString()} pcs / {Number(row.current_balance_quintals).toLocaleString(undefined, { maximumFractionDigits: 2 })} qt
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">Movement History</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Pieces</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Quintals</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(reports?.movement_history || []).map((row) => (
                      <tr key={`${row.movement_type}-${row.record_id}`}>
                        <td className="px-4 py-3 text-sm text-slate-900 capitalize">{row.movement_type}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {row.product_type} - {row.package_label}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{Number(row.quantity_pieces).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {Number(row.total_weight_quintal).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{row.movement_date}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-2">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Production Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage product production, releases, returns, and inventory balances.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAll}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Product Type</label>
          <select
            value={filters.product_type}
            onChange={(e) => updateFilter("product_type", e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {productTypes.map((typeName) => (
              <option key={typeName} value={typeName}>
                {typeName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Package Size KG</label>
          <select
            value={filters.package_size_kg}
            onChange={(e) => updateFilter("package_size_kg", e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {packageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="production_pending">Production Pending</option>
            <option value="production_approved">Production Approved</option>
            <option value="manager_pending">Manager Pending</option>
            <option value="manager_approved">Manager Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Creator</label>
          <input
            value={filters.creator}
            onChange={(e) => updateFilter("creator", e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Name or email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Approver</label>
          <input
            value={filters.approver}
            onChange={(e) => updateFilter("approver", e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Name or email"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700">From Date</label>
            <input
              type="date"
              value={filters.from_date}
              onChange={(e) => updateFilter("from_date", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700">To Date</label>
            <input
              type="date"
              value={filters.to_date}
              onChange={(e) => updateFilter("to_date", e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeTab === tab.key
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Clear Filters
        </button>
      </div>

      {activeContent()}

      {actionState.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">
              {actionState.type === "manager-approve"
                ? "General Manager Approval"
                : actionState.type === "approve"
                ? "Production Approval"
                : "Reject Record"}
            </h3>
            <form className="mt-4 space-y-4" onSubmit={handleAction}>
              {actionState.type === "reject" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Rejection Reason</label>
                  <textarea
                    value={actionState.rejection_reason}
                    onChange={(e) =>
                      setActionState((prev) => ({
                        ...prev,
                        rejection_reason: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    rows={4}
                    required
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-600">Confirm this action to continue.</p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAction}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
                    actionState.type === "reject"
                      ? "bg-red-600 hover:bg-red-700"
                      : actionState.type === "manager-approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-sky-600 hover:bg-sky-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductionInventory;
