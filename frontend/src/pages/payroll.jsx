import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../components/layout/Dashboardlayout";
import AlertPopup from "../components/common/alert";
import { useToast } from "../components/common/ToastContext";
import { getEmployees } from "../services/EmployeeService";
import {
  getAllPayrolls,
  getPayrollsByEmployee,
  addPayroll,
  updatePayrollStatus,
  deletePayroll,
  getPayrollSummary,
} from "../services/payrollservice";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaSpinner,
  FaHandHoldingUsd,
  FaPlus,
  FaFileInvoiceDollar,
  FaSearch,
  FaTimes,
  FaPrint,
  FaTrash,
  FaPlay,
  FaCheck,
} from "react-icons/fa";
import "../style/payroll.css";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function Payroll() {
  const toast = useToast();
  const role = localStorage.getItem("role");
  const canManage = role === "ADMIN" || role === "HR";

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activePayslip, setActivePayslip] = useState(null);

  // Summary stats
  const [summary, setSummary] = useState({
    totalPayrolls: 0,
    draftCount: 0,
    processedCount: 0,
    paidCount: 0,
    totalDisbursed: 0,
    totalPending: 0,
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Confirmation Popup State
  const [popup, setPopup] = useState({
    show: false,
    type: "confirm",
    title: "",
    message: "",
    actionType: null,
    targetId: null,
    targetStatus: null,
  });

  // Form State
  const currentYear = new Date().getFullYear();
  const currentMonthName = MONTHS[new Date().getMonth()];

  const [form, setForm] = useState({
    employeeId: "",
    month: currentMonthName,
    year: currentYear,
    basicSalary: "",
    bonus: 0,
    allowances: 0,
    overtime: 0,
    deduction: 0,
  });

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      if (canManage) {
        const [pRes, eRes, sRes] = await Promise.allSettled([
          getAllPayrolls(),
          getEmployees(),
          getPayrollSummary(),
        ]);

        if (pRes.status === "fulfilled") {
          setPayrolls(pRes.value.data || []);
        }

        if (eRes.status === "fulfilled") {
          setEmployees(eRes.value.data || []);
        }

        if (sRes.status === "fulfilled" && sRes.value.data?.data) {
          setSummary(sRes.value.data.data);
        }
      } else {
        // Employee view: get employee's profile first or employee ID
        const empId = localStorage.getItem("employeeId");
        if (empId) {
          const pRes = await getPayrollsByEmployee(empId);
          setPayrolls(pRes.data?.data || pRes.data || []);
        }
      }
    } catch (err) {
      console.error("Error loading payroll data:", err);
      toast.error("Failed to load payroll records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When selected employee changes in form, auto-fill standard basic salary
  const handleEmployeeChange = (e) => {
    const selectedId = e.target.value;
    const emp = employees.find((x) => String(x.employeeId) === String(selectedId));

    setForm((prev) => ({
      ...prev,
      employeeId: selectedId,
      basicSalary: emp?.salary ? emp.salary : prev.basicSalary,
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "month" ? value : Number(value) || value,
    }));
  };

  // Real-time calculated figures for form preview
  const liveCalculation = useMemo(() => {
    const basic = Number(form.basicSalary) || 0;
    const hra = Math.round(basic * 0.20 * 100) / 100;
    const da = Math.round(basic * 0.10 * 100) / 100;
    const tax = Math.round(basic * 0.05 * 100) / 100;
    const bonus = Number(form.bonus) || 0;
    const allowances = Number(form.allowances) || 0;
    const overtime = Number(form.overtime) || 0;
    const deduction = Number(form.deduction) || 0;

    const net = Math.round((basic + hra + da + bonus + allowances + overtime - tax - deduction) * 100) / 100;

    return { hra, da, tax, net };
  }, [form]);

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!form.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    if (!form.basicSalary || Number(form.basicSalary) <= 0) {
      toast.error("Please enter a valid basic salary");
      return;
    }

    try {
      const payload = {
        employeeId: Number(form.employeeId),
        month: form.month,
        year: Number(form.year),
        basicSalary: Number(form.basicSalary),
        bonus: Number(form.bonus) || 0,
        allowances: Number(form.allowances) || 0,
        overtime: Number(form.overtime) || 0,
        deduction: Number(form.deduction) || 0,
        status: "DRAFT",
      };

      await addPayroll(payload);
      toast.success("Payroll record generated successfully!");
      setShowForm(false);
      setForm({
        employeeId: "",
        month: currentMonthName,
        year: currentYear,
        basicSalary: "",
        bonus: 0,
        allowances: 0,
        overtime: 0,
        deduction: 0,
      });
      loadData();
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error(err.response?.data?.message || "Failed to generate payroll");
    }
  };

  // Status Action triggers
  const promptStatusChange = (id, newStatus) => {
    const title = newStatus === "PROCESSED" ? "Process Payroll?" : "Mark as Paid?";
    const msg =
      newStatus === "PROCESSED"
        ? "Are you sure you want to mark this payroll as PROCESSED?"
        : "Are you sure you want to mark this payroll as PAID? Payment date will be recorded.";

    setPopup({
      show: true,
      type: "confirm",
      title,
      message: msg,
      actionType: "STATUS",
      targetId: id,
      targetStatus: newStatus,
    });
  };

  const promptDelete = (id) => {
    setPopup({
      show: true,
      type: "confirm",
      title: "Delete Payroll Record?",
      message: "Are you sure you want to delete this draft payroll? This action cannot be undone.",
      actionType: "DELETE",
      targetId: id,
      targetStatus: null,
    });
  };

  const handleConfirmAction = async () => {
    const { actionType, targetId, targetStatus } = popup;
    setPopup((prev) => ({ ...prev, show: false }));

    try {
      if (actionType === "STATUS") {
        await updatePayrollStatus(targetId, targetStatus);
        toast.success(`Payroll status updated to ${targetStatus}`);
        loadData();
      } else if (actionType === "DELETE") {
        await deletePayroll(targetId);
        toast.success("Payroll record deleted successfully");
        loadData();
      }
    } catch (err) {
      console.error("Action Error:", err);
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  // Print Handler
  const handlePrintPayslip = () => {
    window.print();
  };

  // Filtered Payrolls
  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((item) => {
      const nameMatch =
        !searchQuery ||
        (item.employeeName && item.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.departmentName && item.departmentName.toLowerCase().includes(searchQuery.toLowerCase()));

      const monthMatch = !filterMonth || item.month === filterMonth;
      const yearMatch = !filterYear || String(item.year) === String(filterYear);
      const statusMatch = !filterStatus || item.status === filterStatus;

      return nameMatch && monthMatch && yearMatch && statusMatch;
    });
  }, [payrolls, searchQuery, filterMonth, filterYear, filterStatus]);

  return (
    <DashboardLayout>
      <AlertPopup
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        confirmText="Confirm"
        onConfirm={handleConfirmAction}
        onClose={() => setPopup((prev) => ({ ...prev, show: false }))}
      />

      <div className="payroll-page">
        {/* Header */}
        <div className="payroll-header">
          <div>
            <h1>Payroll Management</h1>
            <p>Manage salary structures, process monthly payrolls, and view payslips</p>
          </div>
          {canManage && (
            <button className="payroll-add-btn" onClick={() => setShowForm(true)}>
              <FaPlus /> Generate Payroll
            </button>
          )}
        </div>

        {/* Stats Grid */}
        {canManage && (
          <div className="payroll-stat-grid">
            <div className="payroll-stat-card">
              <div>
                <p>Total Records</p>
                <h2>{summary.totalPayrolls}</h2>
              </div>
              <div className="stat-icon-bg total">
                <FaFileInvoiceDollar />
              </div>
            </div>

            <div className="payroll-stat-card">
              <div>
                <p>Processed</p>
                <h2>{summary.processedCount}</h2>
              </div>
              <div className="stat-icon-bg processed">
                <FaSpinner />
              </div>
            </div>

            <div className="payroll-stat-card">
              <div>
                <p>Paid</p>
                <h2>{summary.paidCount}</h2>
              </div>
              <div className="stat-icon-bg paid">
                <FaCheckCircle />
              </div>
            </div>

            <div className="payroll-stat-card">
              <div>
                <p>Total Disbursed</p>
                <h2>₹{summary.totalDisbursed ? summary.totalDisbursed.toLocaleString("en-IN") : "0"}</h2>
              </div>
              <div className="stat-icon-bg disbursed">
                <FaHandHoldingUsd />
              </div>
            </div>
          </div>
        )}

        {/* Add/Generate Payroll Form */}
        {canManage && showForm && (
          <div className="payroll-form-card">
            <div className="payroll-card-header">
              <div>
                <h2>Generate New Monthly Payroll</h2>
                <p>Select employee and input bonus, allowances or deduction details</p>
              </div>
              <button className="payroll-close-btn" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="payroll-form-grid">
                <div className="payroll-form-group">
                  <label>Select Employee *</label>
                  <select
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleEmployeeChange}
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.employeeName} ({emp.designation || "Staff"}) - ID: #{emp.employeeId}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="payroll-form-group">
                  <label>Pay Month *</label>
                  <select name="month" value={form.month} onChange={handleFormChange} required>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="payroll-form-group">
                  <label>Pay Year *</label>
                  <input
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleFormChange}
                    min="2020"
                    max="2035"
                    required
                  />
                </div>

                <div className="payroll-form-group">
                  <label>Basic Salary (₹) *</label>
                  <input
                    type="number"
                    name="basicSalary"
                    value={form.basicSalary}
                    onChange={handleFormChange}
                    placeholder="e.g. 50000"
                    required
                  />
                </div>

                <div className="payroll-form-group">
                  <label>Bonus (₹)</label>
                  <input
                    type="number"
                    name="bonus"
                    value={form.bonus}
                    onChange={handleFormChange}
                    placeholder="0"
                  />
                </div>

                <div className="payroll-form-group">
                  <label>Allowances (₹)</label>
                  <input
                    type="number"
                    name="allowances"
                    value={form.allowances}
                    onChange={handleFormChange}
                    placeholder="0"
                  />
                </div>

                <div className="payroll-form-group">
                  <label>Overtime Pay (₹)</label>
                  <input
                    type="number"
                    name="overtime"
                    value={form.overtime}
                    onChange={handleFormChange}
                    placeholder="0"
                  />
                </div>

                <div className="payroll-form-group">
                  <label>Custom Deductions (₹)</label>
                  <input
                    type="number"
                    name="deduction"
                    value={form.deduction}
                    onChange={handleFormChange}
                    placeholder="0"
                  />
                </div>

                {/* Salary Breakdown Live Summary Box */}
                <div className="salary-summary-box">
                  <div className="salary-summary-item">
                    <label>HRA (20%)</label>
                    <span>₹{liveCalculation.hra.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="salary-summary-item">
                    <label>DA (10%)</label>
                    <span>₹{liveCalculation.da.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="salary-summary-item">
                    <label>Night Shift Allowance</label>
                    <span>Automatically calculated upon generation</span>
                  </div>
                  <div className="salary-summary-item">
                    <label>Income Tax (5%)</label>
                    <span>₹{liveCalculation.tax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="salary-summary-item net">
                    <label>Calculated Net Salary</label>
                    <span>₹{liveCalculation.net.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="payroll-form-actions">
                <button type="submit" className="payroll-save-btn">
                  Generate Payroll
                </button>
                <button
                  type="button"
                  className="payroll-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table & Filters Card */}
        <div className="payroll-table-card">
          <div className="payroll-table-header">
            <div>
              <h2>Payroll Records</h2>
              <p>
                Showing {filteredPayrolls.length} of {payrolls.length} payroll entries
              </p>
            </div>

            {/* Filter controls */}
            <div className="payroll-filters">
              <input
                type="text"
                placeholder="Search employee or dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                <option value="">All Months</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                <option value="">All Years</option>
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="PROCESSED">PROCESSED</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="payroll-table-wrapper">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Period</th>
                  <th>Basic Salary</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      Loading payroll records...
                    </td>
                  </tr>
                ) : filteredPayrolls.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No payroll records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPayrolls.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>
                        <strong>{item.employeeName || "Employee #" + item.employeeId}</strong>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {item.designation || "-"}
                        </div>
                      </td>
                      <td>{item.departmentName || "-"}</td>
                      <td>
                        {item.month} {item.year}
                      </td>
                      <td>₹{item.basicSalary ? item.basicSalary.toLocaleString("en-IN") : 0}</td>
                      <td>
                        <strong style={{ color: "#16a34a" }}>
                          ₹{item.netSalary ? item.netSalary.toLocaleString("en-IN") : 0}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`payroll-status-badge ${
                            item.status ? item.status.toLowerCase() : "draft"
                          }`}
                        >
                          {item.status || "DRAFT"}
                        </span>
                      </td>
                      <td>{item.paymentDate ? item.paymentDate : "-"}</td>
                      <td>
                        <div className="payroll-actions">
                          {/* View Payslip Modal trigger */}
                          <button
                            className="btn-icon-action btn-view-slip"
                            onClick={() => setActivePayslip(item)}
                            title="View Payslip"
                          >
                            <FaFileInvoiceDollar /> Payslip
                          </button>

                          {/* Process trigger */}
                          {canManage && item.status === "DRAFT" && (
                            <button
                              className="btn-icon-action btn-process"
                              onClick={() => promptStatusChange(item.id, "PROCESSED")}
                              title="Process Payroll"
                            >
                              <FaPlay /> Process
                            </button>
                          )}

                          {/* Pay trigger */}
                          {canManage && item.status === "PROCESSED" && (
                            <button
                              className="btn-icon-action btn-pay"
                              onClick={() => promptStatusChange(item.id, "PAID")}
                              title="Mark as Paid"
                            >
                              <FaCheck /> Mark Paid
                            </button>
                          )}

                          {/* Delete trigger */}
                          {canManage && item.status === "DRAFT" && (
                            <button
                              className="btn-icon-action btn-delete"
                              onClick={() => promptDelete(item.id)}
                              title="Delete Record"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payslip View Modal */}
      {activePayslip && (
        <div className="modal-overlay" onClick={() => setActivePayslip(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Salary Payslip Statement</h3>
              <button className="payroll-close-btn" onClick={() => setActivePayslip(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="payslip-container">
                {/* Payslip Header */}
                <div className="payslip-header-brand">
                  <div className="payslip-brand-logo">
                    <div className="brand-icon-box">J</div>
                    <div>
                      <h3 style={{ margin: 0, color: "#172554" }}>JAM ENTERPRISES</h3>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Corporate ERP Payroll System
                      </span>
                    </div>
                  </div>
                  <div className="payslip-meta">
                    <h4>PAYSLIP</h4>
                    <p>
                      Period: {activePayslip.month} {activePayslip.year}
                    </p>
                    <p>Ref #: PAY-{activePayslip.id}</p>
                  </div>
                </div>

                {/* Employee Details Grid */}
                <div className="payslip-info-grid">
                  <div className="payslip-info-item">
                    <span>Employee Name:</span>
                    <strong>{activePayslip.employeeName || "N/A"}</strong>
                  </div>
                  <div className="payslip-info-item">
                    <span>Employee ID:</span>
                    <strong>#{activePayslip.employeeId}</strong>
                  </div>
                  <div className="payslip-info-item">
                    <span>Designation:</span>
                    <strong>{activePayslip.designation || "-"}</strong>
                  </div>
                  <div className="payslip-info-item">
                    <span>Department:</span>
                    <strong>{activePayslip.departmentName || "-"}</strong>
                  </div>
                  <div className="payslip-info-item">
                    <span>Payment Status:</span>
                    <strong style={{ color: activePayslip.status === "PAID" ? "#16a34a" : "#d97706" }}>
                      {activePayslip.status}
                    </strong>
                  </div>
                  <div className="payslip-info-item">
                    <span>Payment Date:</span>
                    <strong>{activePayslip.paymentDate || "Pending"}</strong>
                  </div>
                </div>

                {/* Earnings & Deductions Breakdown */}
                <div className="payslip-breakdown-grid">
                  {/* Earnings Table */}
                  <div>
                    <table className="breakdown-table">
                      <thead>
                        <tr>
                          <th>Earnings</th>
                          <th style={{ textAlign: "right" }}>Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Basic Salary</td>
                          <td className="amount">
                            {(activePayslip.basicSalary || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                        <tr>
                          <td>House Rent Allowance (HRA)</td>
                          <td className="amount">
                            {(activePayslip.hra || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                        <tr>
                          <td>Dearness Allowance (DA)</td>
                          <td className="amount">
                            {(activePayslip.da || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                        <tr>
                          <td>Performance Bonus</td>
                          <td className="amount">
                            {(activePayslip.bonus || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                        <tr>
                          <td>Other Allowances</td>
                          <td className="amount">
                            {(activePayslip.allowances || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                        <tr>
                          <td>Night Shift Allowance</td>
                          <td className="amount">
                            {(activePayslip.nightShiftAllowance || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                        <tr>
                          <td>Overtime Pay</td>
                          <td className="amount">
                            {(activePayslip.overtime || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Deductions Table */}
                  <div>
                    <table className="breakdown-table">
                      <thead>
                        <tr>
                          <th>Deductions</th>
                          <th style={{ textAlign: "right" }}>Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Income Tax Deduction</td>
                          <td className="amount">
                            {(activePayslip.tax || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                        <tr>
                          <td>Other Deductions</td>
                          <td className="amount">
                            {(activePayslip.deduction || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Net Salary Highlights */}
                <div className="payslip-net-box">
                  <div>
                    <span>Total Net Salary Payable</span>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#047857" }}>
                      Inclusive of all earnings and tax deductions
                    </p>
                  </div>
                  <h2>₹{(activePayslip.netSalary || 0).toLocaleString("en-IN")}</h2>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="payroll-save-btn" onClick={handlePrintPayslip}>
                <FaPrint /> Print Payslip
              </button>
              <button className="payroll-cancel-btn" onClick={() => setActivePayslip(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Payroll;
