import { useEffect, useState } from "react";
import "../style/asset.css";
import {
  addAsset,
  deleteAsset,
  getAllAssets,
  getMyAssets,
  updateAsset,
} from "../services/assetservice";

import { getEmployees } from "../services/EmployeeService";
import DashboardLayout from "../components/layout/Dashboardlayout";
import { useToast } from "../components/common/ToastContext";



function Asset() {
  const toast = useToast();
  const initialForm = {
    assetName: "",
    assetType: "",
    status: "AVAILABLE",
    employeeId: "",
  };    

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [assetForm, setAssetForm] = useState(initialForm);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const role = localStorage.getItem("role");

  const canModify =
    role === "ADMIN" || role === "HR";

  const loadAssets = () => {
    setLoading(true);

    const assetCall = role === "EMPLOYEE" ? getMyAssets() : getAllAssets();

    assetCall
      .then((response) => {
        const assetData =
          response.data.data ?? response.data;

        setAssets(assetData);
      })
      .catch((error) => {
        console.error("Error loading assets:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadEmployees = () => {
    if (role === "EMPLOYEE") return;

    getEmployees()
      .then((response) => {
        const employeeData =
          response.data.data ?? response.data;

        setEmployees(employeeData);
      })
      .catch((error) => {
        console.error("Error loading employees:", error);
      });
  };

  useEffect(() => {
    loadAssets();
    loadEmployees();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "status" && value !== "ASSIGNED") {
      setAssetForm((previousForm) => ({
        ...previousForm,
        status: value,
        employeeId: "",
      }));

      return;
    }

    setAssetForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setAssetForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!assetForm.assetName.trim()) {
      toast.warning("Please enter the asset name");
      return;
    }

    if (!assetForm.assetType.trim()) {
      toast.warning("Please enter the asset type");
      return;
    }

    if (
      assetForm.status === "ASSIGNED" &&
      !assetForm.employeeId
    ) {
      toast.warning("Please select an employee");
      return;
    }

    const assetData = {
      assetName: assetForm.assetName.trim(),
      assetType: assetForm.assetType.trim(),
      status: assetForm.status,

      employee:
        assetForm.status === "ASSIGNED"
          ? {
              employeeId: Number(
                assetForm.employeeId
              ),
            }
          : null,
    };

    setSaving(true);

    const request = editingId
      ? updateAsset(editingId, assetData)
      : addAsset(assetData);

    request
      .then((response) => {
        const message =
          response.data.message ||
          (editingId
            ? "Asset updated successfully"
            : "Asset added successfully");

        toast.success(message);

        resetForm();
        loadAssets();
      })
      .catch((error) => {
        console.error("Error saving asset:", error);

        toast.error(
          error.response?.data?.message ||
            "Unable to save asset"
        );
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleEdit = (asset) => {
    setEditingId(asset.assetId);

    setAssetForm({
      assetName: asset.assetName || "",
      assetType: asset.assetType || "",
      status: asset.status || "AVAILABLE",
      employeeId: asset.employeeId
        ? String(asset.employeeId)
        : "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = (assetId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this asset?"
    );

    if (!confirmed) {
      return;
    }

    deleteAsset(assetId)
      .then((response) => {
        toast.success(
          response.data.message ||
            "Asset deleted successfully"
        );

        loadAssets();
      })
      .catch((error) => {
        console.error("Error deleting asset:", error);

        toast.error(
          error.response?.data?.message ||
            "Unable to delete asset"
        );
      });
  };

  const filteredAssets = assets.filter((asset) => {
    const search = searchText.toLowerCase();

    const matchesSearch =
      asset.assetName
        ?.toLowerCase()
        .includes(search) ||
      asset.assetType
        ?.toLowerCase()
        .includes(search) ||
      asset.employeeName
        ?.toLowerCase()
        .includes(search);

    const matchesStatus =
      !statusFilter ||
      asset.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalAssets = assets.length;

  const availableCount = assets.filter(
    (asset) => asset.status === "AVAILABLE"
  ).length;

  const assignedCount = assets.filter(
    (asset) => asset.status === "ASSIGNED"
  ).length;

  const repairCount = assets.filter(
    (asset) => asset.status === "UNDER_REPAIR"
  ).length;

  const getStatusClass = (status) => {
    return `asset-status ${
      status ? status.toLowerCase() : ""
    }`;
  };

  return (
    <DashboardLayout>
    <div className="asset-page">
      <div className="asset-header">
        <div>
          <h1>Asset Management</h1>

          <p>
            Manage and assign company assets
          </p>
        </div>

        {canModify && (
          <button
            className="asset-add-btn"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Add Asset
          </button>
        )}
      </div>

      <div className="asset-stat-grid">
        <div className="asset-stat-card">
          <div>
            <p>Total Assets</p>
            <h2>{totalAssets}</h2>
          </div>

          <span>📦</span>
        </div>

        <div className="asset-stat-card">
          <div>
            <p>Available</p>
            <h2>{availableCount}</h2>
          </div>

          <span>✅</span>
        </div>

        <div className="asset-stat-card">
          <div>
            <p>Assigned</p>
            <h2>{assignedCount}</h2>
          </div>

          <span>👤</span>
        </div>

        <div className="asset-stat-card">
          <div>
            <p>Under Repair</p>
            <h2>{repairCount}</h2>
          </div>

          <span>🛠️</span>
        </div>
      </div>

      {showForm && canModify && (
        <div className="asset-form-card">
          <div className="asset-card-header">
            <div>
              <h2>
                {editingId
                  ? "Update Asset"
                  : "Add Asset"}
              </h2>

              <p>
                Enter the asset information
              </p>
            </div>

            <button
              type="button"
              className="asset-close-btn"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="asset-form-grid">
              <div className="asset-form-group">
                <label htmlFor="assetName">
                  Asset Name
                </label>

                <input
                  id="assetName"
                  type="text"
                  name="assetName"
                  placeholder="Example: Dell Latitude 5420"
                  value={assetForm.assetName}
                  onChange={handleChange}
                />
              </div>

              <div className="asset-form-group">
                <label htmlFor="assetType">
                  Asset Type
                </label>

                <input
                  id="assetType"
                  type="text"
                  name="assetType"
                  placeholder="Example: Laptop"
                  value={assetForm.assetType}
                  onChange={handleChange}
                />
              </div>

              <div className="asset-form-group">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={assetForm.status}
                  onChange={handleChange}
                >
                  <option value="AVAILABLE">
                    Available
                  </option>

                  <option value="ASSIGNED">
                    Assigned
                  </option>

                  <option value="UNDER_REPAIR">
                    Under Repair
                  </option>

                  <option value="DAMAGED">
                    Damaged
                  </option>

                  <option value="RETIRED">
                    Retired
                  </option>
                </select>
              </div>

              <div className="asset-form-group">
                <label htmlFor="employeeId">
                  Assigned Employee
                </label>

                <select
                  id="employeeId"
                  name="employeeId"
                  value={assetForm.employeeId}
                  onChange={handleChange}
                  disabled={
                    assetForm.status !== "ASSIGNED"
                  }
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee.employeeId}
                      value={employee.employeeId}
                    >
                      {employee.employeeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="asset-form-actions">
              <button
                type="submit"
                className="asset-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Asset"
                    : "Save Asset"}
              </button>

              <button
                type="button"
                className="asset-cancel-btn"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="asset-table-card">
        <div className="asset-table-header">
          <div>
            <h2>Asset List</h2>

            <p>
              View and manage company assets
            </p>
          </div>

          <div className="asset-filters">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">
                All Statuses
              </option>

              <option value="AVAILABLE">
                Available
              </option>

              <option value="ASSIGNED">
                Assigned
              </option>

              <option value="UNDER_REPAIR">
                Under Repair
              </option>

              <option value="DAMAGED">
                Damaged
              </option>

              <option value="RETIRED">
                Retired
              </option>
            </select>
          </div>
        </div>

        <div className="asset-table-wrapper">
          <table className="asset-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Assigned Date</th>

                {canModify && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={canModify ? 7 : 6}
                    className="asset-message"
                  >
                    Loading assets...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan={canModify ? 7 : 6}
                    className="asset-message"
                  >
                    No assets found
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.assetId}>
                    <td>#{asset.assetId}</td>

                    <td>
                      <strong>
                        {asset.assetName}
                      </strong>
                    </td>

                    <td>{asset.assetType}</td>

                    <td>
                      <span
                        className={getStatusClass(
                          asset.status
                        )}
                      >
                        {asset.status?.replace(
                          "_",
                          " "
                        )}
                      </span>
                    </td>

                    <td>
                      {asset.employeeName || "--"}
                    </td>

                    <td>
                      {asset.assignedDate || "--"}
                    </td>

                    {canModify && (
                      <td>
                        <div className="asset-actions">
                          <button
                            className="asset-edit-btn"
                            onClick={() =>
                              handleEdit(asset)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="asset-delete-btn"
                            onClick={() =>
                              handleDelete(
                                asset.assetId
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}

export default Asset;