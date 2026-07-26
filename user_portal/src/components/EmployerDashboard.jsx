import React, { useState, useEffect } from 'react';
import { Plus, List, Settings, Eye, EyeOff, Briefcase, MapPin, Users, Building2, BadgePercent, Trash2, ArrowRight, ShieldCheck, HelpCircle, LogOut } from 'lucide-react';

import { STATES_AND_DISTRICTS } from '../utils/locationData';
import {
  fetchEmployerOrders,
  updateEmployerOrder,
  fetchEmployerProfile,
  saveEmployerProfile,
  deleteEmployerOrder,
  createJobRequisition,
} from '../services/employerService';
const TN_DISTRICTS = STATES_AND_DISTRICTS["Tamil Nadu"];

import ConfirmModal from './ConfirmModal';
import { ALL_JOB_ROLES, HIGH_DEMAND_ROLES, SALARY_STEPS } from '../constants';

const parseSalaryRange = (salaryStr) => {
  const defaultMin = 15000;
  const defaultMax = 25000;
  if (!salaryStr) return { minVal: defaultMin, maxVal: defaultMax };

  const numbers = salaryStr.match(/\d[\d,.]*/g);
  if (!numbers || numbers.length === 0) return { minVal: defaultMin, maxVal: defaultMax };

  let minParsed = parseInt(numbers[0].replace(/,/g, ''), 10) || defaultMin;
  let maxParsed = numbers[1] ? (parseInt(numbers[1].replace(/,/g, ''), 10) || defaultMax) : minParsed;

  if (maxParsed < minParsed) {
    if (maxParsed * 10 >= minParsed) {
      maxParsed = maxParsed * 10;
    } else if (maxParsed * 100 >= minParsed) {
      maxParsed = maxParsed * 100;
    } else {
      maxParsed = minParsed + 10000;
    }
  }

  return { minVal: minParsed, maxVal: maxParsed };
};

const findClosestIdx = (val) => {
  let closestIdx = 0;
  let minDiff = Math.abs(SALARY_STEPS[0] - val);
  for (let i = 1; i < SALARY_STEPS.length; i++) {
    const diff = Math.abs(SALARY_STEPS[i] - val);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  }
  return closestIdx;
};

const EDUCATION_OPTIONS = [
  "SSLC (10th) Pass",
  "HSC (12th) Pass",
  "ITI Pass",
  "Diploma Pass",
  "Any Degree / Graduate",
  "Post Graduate (PG)",
  "No Education Mandate"
];

const EMPTY_DETAILS = { salaryRange:'', location:[], maritalStatus:'', educationLevel:'', expRequired:0, vacanciesCount:1, minAge:'', maxAge:'' };

export default function EmployerDashboard({ backendUrl, employerId, companyName, authToken, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('POST_JOBS'); // 'POST_JOBS' or 'ORDERS' or 'SETTINGS'
  
  // SETTINGS STATE
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // POST JOBS STATE
  const [roleInput, setRoleInput] = useState('');
  const [roleQuery, setRoleQuery] = useState('');
  const [isRoleInputFocused, setIsRoleInputFocused] = useState(false);
  const [addedRoles, setAddedRoles] = useState([]);
  const [isFillingDetails, setIsFillingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [jobDetails, setJobDetails] = useState({}); // { 'Role1': { salary... }, 'Role2': {...} }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectRole = (roleName) => {
    const role = roleName.trim();
    if (!role) return;
    if (!addedRoles.includes(role)) {
      setAddedRoles(prev => [...prev, role]);
      setJobDetails(prev => ({ ...prev, [role]: prev[role] || { ...EMPTY_DETAILS } }));
    }
    setRoleQuery('');
  };

  // ORDERS STATE
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [generatorError, setGeneratorError] = useState('');
  const [modalError, setModalError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState(null);

  useEffect(() => {
    if (activeMenu === 'ORDERS') fetchOrders();
    if (activeMenu === 'SETTINGS') fetchSettingsProfile();
  }, [activeMenu]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const data = await fetchEmployerOrders(employerId);
      setOrders(data.jobs || []);
    } catch (e) {
      console.error('Failed to fetch orders', e);
    }
    setIsLoadingOrders(false);
  };

  const updateOrder = async (orderId, updatedDetails) => {
    try {
      await updateEmployerOrder(orderId, updatedDetails);
      fetchOrders();
      return true;
    } catch (e) {
      setModalError(e.message || 'Failed to update requisition.');
      return false;
    }
  };

  const fetchSettingsProfile = async () => {
    setEmailError('');
    setEmailSuccess('');
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const data = await fetchEmployerProfile();
      if (data.employer) {
        setSettingsEmail(data.employer.email || '');
      }
    } catch (e) {
      setEmailError(e.message || 'Failed to load profile.');
    }
  };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!settingsEmail.trim()) {
      setEmailError('Email is required.');
      return;
    }

    setIsSavingEmail(true);
    try {
      await saveEmployerProfile({ email: settingsEmail.trim() });
      setEmailSuccess('Email address updated successfully.');
    } catch (err) {
      setEmailError(err.message || 'Failed to update email.');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setNewPasswordError('');
    setConfirmPasswordError('');
    setPasswordSuccess('');

    let hasErr = false;

    if (!settingsPassword.trim()) {
      setNewPasswordError('New password is required.');
      hasErr = true;
    } else if (settingsPassword.length < 6) {
      setNewPasswordError('Password must be at least 6 characters.');
      hasErr = true;
    }

    if (!settingsConfirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your new password.');
      hasErr = true;
    } else if (settingsPassword.trim() && settingsPassword !== settingsConfirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      hasErr = true;
    }

    if (hasErr) return;

    setIsSavingPassword(true);
    try {
      await saveEmployerProfile({ password: settingsPassword.trim() });
      setPasswordSuccess('Password changed successfully.');
      setSettingsPassword('');
      setSettingsConfirmPassword('');
      setNewPasswordError('');
      setConfirmPasswordError('');
    } catch (err) {
      setNewPasswordError(err.message || 'Failed to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // --- JOB POSTING HANDLERS ---
  const handleAddRole = (e) => {
    e.preventDefault();
    const role = roleInput.trim();
    if (!role || addedRoles.includes(role)) return;
    setAddedRoles(prev => [...prev, role]);
    setJobDetails(prev => ({ ...prev, [role]: prev[role] || { ...EMPTY_DETAILS } }));
    setRoleInput('');
  };

  const handleRemoveRole = (role) => {
    const idx = addedRoles.indexOf(role);
    const next = addedRoles.filter(r => r !== role);
    setAddedRoles(next);
    setJobDetails(prev => {
      const copy = { ...prev };
      delete copy[role];
      return copy;
    });
    // Keep active tab valid
    if (activeTab > idx) setActiveTab(activeTab - 1);
    else if (activeTab === idx) setActiveTab(Math.max(0, idx - 1));
    if (isFillingDetails && next.length === 0) setIsFillingDetails(false);
  };

  const startDetailFill = () => {
    if (addedRoles.length > 0) setIsFillingDetails(true);
  };

  const handleDetailChange = (role, field, value) => {
    setJobDetails(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value
      }
    }));
  };

  const autoFillTrends = (role) => {
    setJobDetails(prev => ({
      ...prev,
      [role]: {
        salaryRange: '₹15,000 - ₹20,000',
        location: ['Coimbatore'],
        maritalStatus: 'No Preference',
        educationLevel: '12th Pass / ITI',
        expRequired: 2,
        vacanciesCount: 1,
        minAge: '',
        maxAge: ''
      }
    }));
  };

  const submitJobs = async () => {
    setGeneratorError('');
    // Validate that all fields are filled for every added role
    for (const role of addedRoles) {
      const details = jobDetails[role];
      if (!details) {
        setGeneratorError(`Please configure parameters for role: ${role}`);
        return;
      }
      if (!details.salaryRange) {
        setGeneratorError(`Please select a Target Salary Range for role: ${role}`);
        return;
      }
      if (!Array.isArray(details.location) || details.location.length === 0) {
        setGeneratorError(`Please select at least one Target Location district for role: ${role}`);
        return;
      }
      if (!details.educationLevel) {
        setGeneratorError(`Please select an Education Cutoff for role: ${role}`);
        return;
      }
      if (!details.maritalStatus) {
        setGeneratorError(`Please select a Marital Status option for role: ${role}`);
        return;
      }
      if (details.vacanciesCount === undefined || details.vacanciesCount === null || Number(details.vacanciesCount) < 1) {
        setGeneratorError(`Please specify a valid Number of Vacancies (at least 1) for role: ${role}`);
        return;
      }
      const minAgeVal = details.minAge === '' || details.minAge === undefined ? 18 : Number(details.minAge);
      const maxAgeVal = details.maxAge === '' || details.maxAge === undefined ? 99 : Number(details.maxAge);
      if (isNaN(minAgeVal) || minAgeVal < 18) {
        setGeneratorError(`Minimum age must be at least 18 for role: ${role}`);
        return;
      }
      if (isNaN(maxAgeVal) || maxAgeVal < minAgeVal) {
        setGeneratorError(`Maximum age must be greater than or equal to minimum age for role: ${role}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const promises = addedRoles.map(async (role) => {
        const details = jobDetails[role];
        const minAgeVal = details.minAge === '' || details.minAge === undefined ? 18 : Number(details.minAge);
        const maxAgeVal = details.maxAge === '' || details.maxAge === undefined ? 99 : Number(details.maxAge);
        const payload = [{
          roleTitle: role,
          salaryRange: details.salaryRange,
          location: details.location,
          maritalStatus: details.maritalStatus,
          educationLevel: details.educationLevel,
          expRequired: Number(details.expRequired) || 0,
          vacanciesCount: Number(details.vacanciesCount) || 1,
          minAge: minAgeVal,
          maxAge: maxAgeVal
        }];

        return createJobRequisition(employerId, payload);
      });

      const results = await Promise.all(promises);
      const allSuccess = results.every(res => res.ok);

      if (allSuccess) {
        setAddedRoles([]);
        setJobDetails({});
        setIsFillingDetails(false);
        setActiveMenu('ORDERS');
        setGeneratorError('');
      } else {
        setGeneratorError('Some job requisitions failed to post. Please verify details.');
      }
    } catch (e) {
      setGeneratorError('Failed to submit job requisitions.');
    }
    setIsSubmitting(false);
  };

  const deleteOrder = (orderId) => {
    setDeletingOrderId(orderId);
  };

  const confirmDeleteOrder = async (orderId) => {
    setDeletingOrderId(null);
    setOrdersError('');
    try {
      await deleteEmployerOrder(orderId);
      fetchOrders();
    } catch (e) {
      setOrdersError(e.message || 'Failed to delete order.');
    }
  };

  const totalRequisitions = orders.length;
  const totalMatches = orders.reduce((sum, o) => sum + (o.matchedCandidates?.length || 0), 0);

  return (
    <div className="emp-layout">
      <style>{`
        .emp-layout {
          display: flex;
          height: 100%;
          background-color: #f1f5f9;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          width: 100%;
          overflow: hidden;
        }
        .emp-sidebar-label,
        .emp-sidebar-title,
        .emp-sidebar-link,
        .emp-section-title,
        .emp-card-header,
        .emp-kpi-label,
        .emp-kpi-value,
        .emp-field-label,
        .role-preset-btn,
        .emp-tab-pill,
        .order-title,
        .order-meta-badge,
        .candidate-kpi-sub,
        .emp-tag-chip,
        .employer-submit-btn,
        .emp-modal-title {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .emp-mono-text {
          font-family: 'JetBrains Mono', Courier, monospace;
        }
        .emp-sidebar {
          width: 280px;
          background: linear-gradient(180deg, #090d16 0%, #1e1b4b 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          color: #cbd5e1;
          flex-shrink: 0;
          height: 100%;
        }
        .emp-sidebar-brand {
          padding: 28px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .emp-sidebar-label {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #818cf8;
        }
        .emp-sidebar-title {
          font-size: 1.15rem;
          font-weight: 900;
          margin-top: 4px;
          word-break: break-all;
          background: linear-gradient(135deg, #60a5fa 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .emp-sidebar-nav {
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .emp-sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: all 0.2s ease;
          border-left: 4px solid transparent;
        }
        .emp-sidebar-link:hover {
          background-color: rgba(255, 255, 255, 0.04);
          color: #f1f5f9;
        }
        .emp-sidebar-link:focus {
          outline: none !important;
        }
        .emp-sidebar-link.active {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.05) 100%) !important;
          color: #a5b4fc !important;
          border-left: 4px solid #6366f1 !important;
          font-weight: 700;
          box-shadow: none !important;
        }

        .emp-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-y: auto;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .emp-main::-webkit-scrollbar {
          display: none !important;
        }
        .emp-container {
          max-width: 1120px;
          width: 100%;
          margin: 0 auto;
          padding: 12px 20px;
        }

        /* Executive Metrics Grid - AI Accent Border Look */
        .emp-kpi-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 12px;
        }
        .emp-kpi-card {
          background: #ffffff !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
          transition: all 0.25s ease;
        }
        .emp-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          border-color: #cbd5e1 !important;
        }
        .blue-kpi {
          border-left: 4px solid #3b82f6 !important;
        }
        .green-kpi {
          border-left: 4px solid #10b981 !important;
        }
        .purple-kpi {
          border-left: 4px solid #8b5cf6 !important;
        }
        .emp-kpi-info {
          display: flex;
          flex-direction: column;
        }
        .emp-kpi-label {
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b !important;
        }
        .emp-kpi-value {
          font-size: 1.45rem;
          font-weight: 900;
          margin-top: 4px;
          line-height: 1.1;
          color: #0f172a !important;
        }
        .emp-kpi-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .blue-kpi .emp-kpi-icon-wrapper {
          background-color: #eff6ff;
          color: #3b82f6;
        }
        .green-kpi .emp-kpi-icon-wrapper {
          background-color: #ecfdf5;
          color: #10b981;
        }
        .purple-kpi .emp-kpi-icon-wrapper {
          background-color: #f5f3ff;
          color: #8b5cf6;
        }

        /* General Forms & Cards - Modern AI Outline Accent Theme */
        .emp-section-header {
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .emp-section-title {
          font-size: 1.25rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        .emp-card {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-left: 4px solid #3b82f6; /* Glowing side color for grid */
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02);
          margin-bottom: 12px;
          overflow: visible;
        }
        .emp-card-header {
          padding: 10px 18px;
          background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }
        .emp-card-body {
          padding: 12px 18px;
        }
        
        .role-chips-panel {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          max-height: 106px;
          overflow-y: auto;
        }
        .role-preset-btn {
          padding: 8px 16px;
          font-size: 0.775rem;
          font-weight: 600;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background-color: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .role-preset-btn:hover {
          border-color: #cbd5e1;
          background-color: #f8fafc;
          color: #0f172a;
        }
        .role-preset-btn.selected {
          background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
          border-color: transparent !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2) !important;
        }

        .emp-form-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .emp-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .emp-field-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .emp-input {
          width: 100%;
          padding: 10px 14px;
          font-size: 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
        }
        .emp-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }
        .emp-select {
          width: 100%;
          padding: 10px 14px;
          font-size: 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .emp-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        .emp-tag-holder {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        .emp-tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .emp-tag-chip:hover {
          background: #ffe4e6;
          border-color: #fecdd3;
          color: #be123c;
        }

        /* Modern Segmented Control Tab Bar */
        .emp-tab-track {
          display: flex;
          gap: 4px;
          background: #e2e8f0;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 20px;
          overflow-x: auto;
        }
        .emp-tab-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .emp-tab-pill.active {
          color: #0f172a;
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
        }
        .emp-tab-pill-close {
          border: none;
          background: transparent;
          color: #94a3b8;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: 4px;
        }
        .emp-tab-pill-close:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        .emp-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        /* Active Hiring Requisitions - Side Accent Border Style */
        .order-card-group {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .order-block {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-left: 4px solid #4f46e5; /* Strong purple AI anchor bar */
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02);
          overflow: hidden;
          transition: all 0.25s ease;
        }
        .order-block:hover {
          border-color: #cbd5e1;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04);
        }
        .order-block-header {
          padding: 16px 24px;
          background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .order-title {
          font-size: 1.1rem;
          font-weight: 900;
          color: #0f172a;
        }
        .order-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        .order-meta-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.725rem;
          font-weight: 600;
          color: #475569;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
        }

        /* Sourced Candidates */
        .candidate-kpi-sub {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 2px dashed #e2e8f0;
        }
        .cand-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 12px;
        }
        .cand-card {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-left: 3.5px solid #10b981; /* Sleek side color indicator */
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(15, 23, 42, 0.01);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .cand-card:hover {
          border-color: #10b981;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.08);
        }
        .cand-meta-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 10px;
          font-size: 0.75rem;
          color: #475569;
        }
        .cand-meta-item {
          display: flex;
          justify-content: space-between;
          padding-bottom: 4px;
          border-bottom: 1px solid #f1f5f9;
        }
        .cand-meta-item:last-child {
          border-bottom: none;
        }

        /* Primary Styled Buttons - AI Purple Blue Gradient */
        .employer-submit-btn {
          background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 10px 24px !important;
          font-weight: 650 !important;
          font-size: 0.875rem !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2) !important;
          text-decoration: none !important;
        }
        .employer-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3) !important;
        }
        .employer-submit-btn:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
        .search-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 100;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
          max-height: 200px;
          overflow-y: auto;
          margin-top: 4px;
        }
        .search-dropdown-item {
          padding: 10px 14px;
          cursor: pointer;
          border-bottom: 1px solid #f1f5f9;
          background: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          font-weight: 550;
          color: #1e293b;
          transition: all 0.15s ease;
        }
        .search-dropdown-item:hover {
          background-color: #f8fafc !important;
          color: #2563eb !important;
        }
        .search-dropdown-item.custom-add-item {
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 650;
          border-bottom: none;
        }
        .search-dropdown-item.custom-add-item:hover {
          background: #dbeafe !important;
          color: #1e40af !important;
        }
      `}</style>

      {/* SIDEBAR PANEL */}
      <div className="emp-sidebar">
        <div className="emp-sidebar-brand">
          <div className="emp-sidebar-label">Employer Console</div>
          <div className="emp-sidebar-title">{companyName || 'Corporate Portal'}</div>
        </div>

        <div className="emp-sidebar-nav">
          <button 
            type="button" 
            onClick={() => setActiveMenu('POST_JOBS')} 
            className={`emp-sidebar-link ${activeMenu === 'POST_JOBS' ? 'active' : ''}`}
          >
            <Plus size={16} />
            <span>Post New Roles</span>
          </button>
          <button 
            type="button" 
            onClick={() => setActiveMenu('ORDERS')} 
            className={`emp-sidebar-link ${activeMenu === 'ORDERS' ? 'active' : ''}`}
          >
            <List size={16} />
            <span>Active Orders</span>
          </button>
          <button 
            type="button" 
            onClick={() => setActiveMenu('SETTINGS')} 
            className={`emp-sidebar-link ${activeMenu === 'SETTINGS' ? 'active' : ''}`}
          >
            <Settings size={16} />
            <span>Security Settings</span>
          </button>
        </div>

        <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button 
            type="button" 
            onClick={onLogout} 
            className="emp-sidebar-link"
            style={{ color: '#fecdd3' }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* VIEWPORT PANEL */}
      <div className="emp-main">
        <div className="emp-container">

          {/* VIEW: POST NEW JOBS */}
          {activeMenu === 'POST_JOBS' && (
            <div>
              <div className="emp-section-header">
                <h1 className="emp-section-title">Requisition Generator</h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                  Create and target structured hiring orders to dispatch to our screening agents.
                </p>
              </div>

              {!isFillingDetails ? (
                <div className="emp-card">
                  <div className="emp-card-header">
                    <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>Quick Preset Selection (High Demand)</h3>
                  </div>
                  <div className="emp-card-body">
                    <div className="role-chips-panel">
                      {HIGH_DEMAND_ROLES.map(r => (
                        <button
                          key={r}
                          type="button"
                          className={`role-preset-btn ${addedRoles.includes(r) ? 'selected' : ''}`}
                          onClick={() => handleSelectRole(r)}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    <div className="emp-form-stack" style={{ marginTop: '12px' }}>
                      <div className="emp-field">
                        <label className="emp-field-label">Search & Add Job Roles</label>
                        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                          <input
                            type="text"
                            className="emp-input"
                            id="emp-role-input"
                            placeholder="Type to search roles (e.g. Electrician, Carpenter, Welder)..."
                            value={roleQuery}
                            onChange={e => setRoleQuery(e.target.value)}
                            onFocus={() => setIsRoleInputFocused(true)}
                            onBlur={() => setTimeout(() => setIsRoleInputFocused(false), 200)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (roleQuery.trim()) {
                                  handleSelectRole(roleQuery);
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (roleQuery.trim()) {
                                handleSelectRole(roleQuery);
                              }
                            }}
                            className="employer-submit-btn"
                            style={{ width: 'auto', padding: '10px 24px', flexShrink: 0 }}
                          >
                            Add Role
                          </button>

                          {(roleQuery.trim() || isRoleInputFocused) && (() => {
                            const trimmedQuery = roleQuery.trim().toLowerCase();
                            const allSearchableRoles = [...new Set([...ALL_JOB_ROLES, ...HIGH_DEMAND_ROLES])];
                            const filteredSuggestions = trimmedQuery
                              ? allSearchableRoles.filter(r => r.toLowerCase().includes(trimmedQuery)).slice(0, 8)
                              : allSearchableRoles.slice(0, 10);
                            const isExactMatch = allSearchableRoles.some(r => r.toLowerCase() === trimmedQuery);

                            if (filteredSuggestions.length === 0 && !trimmedQuery) return null;

                            return (
                              <div className="search-dropdown-menu">
                                {filteredSuggestions.map(r => {
                                  const isSelected = addedRoles.includes(r);
                                  return (
                                    <div
                                      key={r}
                                      className="search-dropdown-item"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => handleSelectRole(r)}
                                    >
                                      <span>{r}</span>
                                      {isSelected && (
                                        <span style={{ color: '#2563eb', fontSize: '11px', fontWeight: 700 }}>✓ Added</span>
                                      )}
                                    </div>
                                  );
                                })}

                                {trimmedQuery && !isExactMatch && (
                                  <div
                                    className="search-dropdown-item custom-add-item"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSelectRole(roleQuery)}
                                  >
                                    + Add "{roleQuery.trim()}" as a new role
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                          💡 Can't find the targeted role in the list? Type your custom role and click the <strong>Add Role</strong> button.
                        </p>
                      </div>

                      <div className="emp-field" style={{ marginTop: '8px' }}>
                        <label className="emp-field-label">Added Requisitions Queue</label>
                        <div className="emp-tag-holder">
                          {addedRoles.length === 0 ? (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No roles queued yet. Select from presets above or write a custom role.</span>
                          ) : null}
                          {addedRoles.map(role => (
                            <button
                              key={role}
                              type="button"
                              className="emp-tag-chip"
                              onClick={() => handleRemoveRole(role)}
                              title="Remove from queue"
                            >
                              <span>{role}</span>
                              <span style={{ color: '#ef4444' }}>×</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="employer-submit-btn"
                        style={{ marginTop: '12px', padding: '12px' }}
                        onClick={startDetailFill}
                        disabled={addedRoles.length === 0}
                      >
                        <span>Configure Role Parameter Details</span>
                        <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="emp-tab-track">
                    {addedRoles.map((role, idx) => (
                      <div key={role} className={`emp-tab-pill ${activeTab === idx ? 'active' : ''}`} onClick={() => setActiveTab(idx)}>
                        <span>{role}</span>
                        <button
                          type="button"
                          className="emp-tab-pill-close"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRole(role);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {addedRoles.length > 0 && (
                    <div className="emp-card">
                      <div className="emp-card-header">
                        <div>
                          <span className="emp-kpi-label">Configuring Target Parameters</span>
                          <h3 style={{ fontWeight: '800', fontSize: '1.2rem', color: '#0f172a', marginTop: '4px' }}>
                            {addedRoles[activeTab]}
                          </h3>
                        </div>
                        <button
                          type="button"
                          className="role-preset-btn selected"
                          style={{ borderRadius: '8px' }}
                          onClick={() => autoFillTrends(addedRoles[activeTab])}
                        >
                          ✨ Auto-Fill Market Trends
                        </button>
                      </div>

                      <div className="emp-card-body">
                        {generatorError && (
                          <div style={{
                            padding: '12px 16px',
                            background: '#fef2f2',
                            border: '1px solid #fca5a5',
                            borderRadius: '8px',
                            color: '#b91c1c',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            marginBottom: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>⚠️ {generatorError}</span>
                            <button
                              type="button"
                              onClick={() => setGeneratorError('')}
                              style={{ background: 'none', border: 'none', color: '#b91c1c', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                            >
                              ×
                            </button>
                          </div>
                        )}
                        {(() => {
                          const activeRole = addedRoles[activeTab] || addedRoles[0];
                          const details = jobDetails[activeRole] || { ...EMPTY_DETAILS };
                          return (
                            <div className="emp-form-stack" style={{ gap: '16px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                                {/* Left Column: Salary & Location */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                  <div className="emp-field">
                                    <label className="emp-field-label">Target Salary Range</label>
                                    {(() => {
                                      const salaryStr = details.salaryRange || '₹15,000 - ₹25,000';
                                      const { minVal, maxVal } = parseSalaryRange(salaryStr);
                                      const minIdx = findClosestIdx(minVal);
                                      const maxIdx = findClosestIdx(maxVal);

                                      const handleMinSliderChange = (e) => {
                                        const newMinIdx = Math.min(parseInt(e.target.value, 10), maxIdx - 1);
                                        const formattedSalary = `₹${SALARY_STEPS[newMinIdx].toLocaleString('en-IN')} - ₹${SALARY_STEPS[maxIdx].toLocaleString('en-IN')}`;
                                        handleDetailChange(activeRole, 'salaryRange', formattedSalary);
                                      };

                                      const handleMaxSliderChange = (e) => {
                                        const newMaxIdx = Math.max(parseInt(e.target.value, 10), minIdx + 1);
                                        const formattedSalary = `₹${SALARY_STEPS[minIdx].toLocaleString('en-IN')} - ₹${SALARY_STEPS[newMaxIdx].toLocaleString('en-IN')}`;
                                        handleDetailChange(activeRole, 'salaryRange', formattedSalary);
                                      };

                                      const leftPercent = (minIdx / (SALARY_STEPS.length - 1)) * 100;
                                      const rightPercent = (maxIdx / (SALARY_STEPS.length - 1)) * 100;

                                      return (
                                        <div className="salary-slider-wrapper" style={{ padding: '5px 0 10px' }}>
                                          <div className="salary-display" style={{ fontSize: '0.9rem', padding: '6px 12px', marginBottom: '8px', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontWeight: '700' }}>
                                            {salaryStr}
                                          </div>

                                          <div className="range-slider-container" style={{ height: '16px', position: 'relative', width: '100%' }}>
                                            <div className="range-slider-track" style={{ height: '4px', background: '#e2e8f0', borderRadius: '4px', position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, right: 0 }} />
                                            <div
                                              className="range-slider-highlight"
                                              style={{
                                                position: 'absolute',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                height: '4px',
                                                background: '#2563eb',
                                                borderRadius: '4px',
                                                left: `${leftPercent}%`,
                                                width: `${rightPercent - leftPercent}%`
                                              }}
                                            />
                                            <input
                                              type="range"
                                              min={0}
                                              max={SALARY_STEPS.length - 1}
                                              value={minIdx}
                                              onChange={handleMinSliderChange}
                                              className="range-slider-input"
                                              style={{ position: 'absolute', width: '100%', pointerEvents: 'auto', appearance: 'none', background: 'none', height: 0, top: '50%', transform: 'translateY(-50%)', outline: 'none' }}
                                            />
                                            <input
                                              type="range"
                                              min={0}
                                              max={SALARY_STEPS.length - 1}
                                              value={maxIdx}
                                              onChange={handleMaxSliderChange}
                                              className="range-slider-input"
                                              style={{ position: 'absolute', width: '100%', pointerEvents: 'auto', appearance: 'none', background: 'none', height: 0, top: '50%', transform: 'translateY(-50%)', outline: 'none' }}
                                            />
                                          </div>

                                          <div className="salary-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                                            <span>Min: ₹10,000</span>
                                            <span>Max: ₹5,00,000</span>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  <div className="emp-field">
                                    <label className="emp-field-label">Target Locations (Tamil Nadu Districts)</label>
                                    <select 
                                      className="emp-select"
                                      value=""
                                      onChange={e => {
                                        if (e.target.value) {
                                          const currentLocs = Array.isArray(details.location) ? details.location : [];
                                          if (!currentLocs.includes(e.target.value)) {
                                            handleDetailChange(activeRole, 'location', [...currentLocs, e.target.value]);
                                          }
                                        }
                                      }}
                                    >
                                      <option value="">Select District…</option>
                                      {TN_DISTRICTS.filter(d => !(Array.isArray(details.location) ? details.location : []).includes(d)).map(d => (
                                        <option key={d} value={d}>{d}</option>
                                      ))}
                                    </select>
                                    <div className="emp-tag-holder" style={{ marginTop: '8px', maxHeight: '68px', overflowY: 'auto' }}>
                                      {(Array.isArray(details.location) ? details.location : []).length === 0 ? (
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No locations selected yet. Choose from the dropdown above.</span>
                                      ) : (
                                        (Array.isArray(details.location) ? details.location : []).map(d => (
                                          <button
                                            key={d}
                                            type="button"
                                            className="emp-tag-chip"
                                            onClick={() => {
                                              const currentLocs = Array.isArray(details.location) ? details.location : [];
                                              handleDetailChange(activeRole, 'location', currentLocs.filter(x => x !== d));
                                            }}
                                            title="Click to remove"
                                          >
                                            <span>{d}</span>
                                            <span style={{ color: '#ef4444' }}>×</span>
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Right Column: Core Mandates */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="emp-field">
                                      <label className="emp-field-label">Marital Status Mandate <span style={{ color: '#ef4444' }}>*</span></label>
                                      <select
                                        required
                                        className="emp-select"
                                        value={details.maritalStatus || ''}
                                        onChange={e => handleDetailChange(activeRole, 'maritalStatus', e.target.value)}
                                      >
                                        <option value="">Select marital status mandate...</option>
                                        <option value="No Preference">No Preference</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                      </select>
                                    </div>

                                    <div className="emp-field">
                                      <label className="emp-field-label">Education Cutoff <span style={{ color: '#ef4444' }}>*</span></label>
                                      <select
                                        required
                                        className="emp-select"
                                        value={details.educationLevel || ''}
                                        onChange={e => handleDetailChange(activeRole, 'educationLevel', e.target.value)}
                                      >
                                        <option value="">Select education cutoff...</option>
                                        <option value="No Education Mandate">No Education Mandate</option>
                                        {EDUCATION_OPTIONS.map(opt => (
                                          <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                      </select>
                                      {validationErrors?.educationLevel && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{validationErrors.educationLevel}</p>}
                                    </div>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="emp-field">
                                      <label className="emp-field-label">Minimum Experience Mandate (Years)</label>
                                      <input
                                        className="emp-input"
                                        type="number"
                                        min="0"
                                        value={details.expRequired === 0 ? '' : details.expRequired}
                                        onChange={e => {
                                          const val = e.target.value;
                                          const numVal = val === '' ? 0 : parseInt(val, 10) || 0;
                                          handleDetailChange(activeRole, 'expRequired', numVal);
                                        }}
                                        placeholder="0 (Freshers Welcome)"
                                      />
                                    </div>

                                    <div className="emp-field">
                                      <label className="emp-field-label">Number of Vacancies <span style={{ color: '#ef4444' }}>*</span></label>
                                      <input
                                        className="emp-input"
                                        type="number"
                                        min="1"
                                        value={details.vacanciesCount === 0 || details.vacanciesCount === undefined ? '' : details.vacanciesCount}
                                        onChange={e => {
                                          const val = e.target.value;
                                          const numVal = val === '' ? 0 : parseInt(val, 10) || 0;
                                          handleDetailChange(activeRole, 'vacanciesCount', numVal);
                                        }}
                                        placeholder="1"
                                      />
                                    </div>

                                    <div className="emp-field">
                                      <label className="emp-field-label">Min Age Limit</label>
                                      <input
                                        className="emp-input"
                                        type="number"
                                        min="18"
                                        max="99"
                                        value={details.minAge === undefined || details.minAge === null ? '' : details.minAge}
                                        onChange={e => {
                                          const val = e.target.value;
                                          const numVal = val === '' ? '' : parseInt(val, 10);
                                          handleDetailChange(activeRole, 'minAge', numVal);
                                        }}
                                        placeholder="18"
                                      />
                                    </div>

                                    <div className="emp-field">
                                      <label className="emp-field-label">Max Age Limit</label>
                                      <input
                                        className="emp-input"
                                        type="number"
                                        min="18"
                                        max="99"
                                        value={details.maxAge === undefined || details.maxAge === null ? '' : details.maxAge}
                                        onChange={e => {
                                          const val = e.target.value;
                                          const numVal = val === '' ? '' : parseInt(val, 10);
                                          handleDetailChange(activeRole, 'maxAge', numVal);
                                        }}
                                        placeholder="99"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-3 pt-4 border-t border-slate-100" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button 
                                  type="button" 
                                  className="role-preset-btn"
                                  style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem', color: '#475569', borderColor: '#cbd5e1', background: '#f1f5f9' }} 
                                  onClick={() => setIsFillingDetails(false)}
                                >
                                  ← Back / Add More
                                </button>
                                <button 
                                  type="button" 
                                  className="employer-submit-btn" 
                                  style={{ width: 'auto', padding: '10px 28px' }}
                                  onClick={submitJobs} 
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? 'Publishing...' : 'Publish Requisitions'}
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW: ORDERS & MATCHES */}
          {activeMenu === 'ORDERS' && (
            <div>
              <div className="emp-section-header">
                <h1 className="emp-section-title">Active Hiring Requisitions</h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                  Monitor posted specifications and unblind sourced candidate listings.
                </p>
              </div>

              {/* Executive KPI Row */}
              <div className="emp-kpi-container">
                <div className="emp-kpi-card blue-kpi">
                  <div className="emp-kpi-info">
                    <span className="emp-kpi-label">Active Orders</span>
                    <span className="emp-kpi-value">{totalRequisitions}</span>
                  </div>
                  <div className="emp-kpi-icon-wrapper">
                    <Briefcase size={20} />
                  </div>
                </div>

                <div className="emp-kpi-card green-kpi">
                  <div className="emp-kpi-info">
                    <span className="emp-kpi-label">Sourced Matches</span>
                    <span className="emp-kpi-value">{totalMatches}</span>
                  </div>
                  <div className="emp-kpi-icon-wrapper">
                    <Users size={20} />
                  </div>
                </div>

              </div>

              {isLoadingOrders ? (
                <div className="emp-card" style={{ padding: '40px', textAlign: 'center' }}>
                  <div className="animate-spin" style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Refreshing market requisitions...</p>
                </div>
              ) : (
                <div className="order-card-group">
                  {ordersError && (
                    <div style={{
                      padding: '12px 16px',
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      color: '#b91c1c',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      marginBottom: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>⚠️ {ordersError}</span>
                      <button
                        type="button"
                        onClick={() => setOrdersError('')}
                        style={{ background: 'none', border: 'none', color: '#b91c1c', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {orders.length === 0 ? (
                    <div className="emp-card" style={{ padding: '48px', textAlign: 'center' }}>
                      <Building2 size={48} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
                      <h4 style={{ fontWeight: '700', color: '#334155' }}>No Requisitions Active</h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '380px', margin: '8px auto 16px' }}>
                        Create active job listings inside the Requisition Generator to begin finding matching talent.
                      </p>
                      <button 
                        type="button" 
                        className="employer-submit-btn" 
                        style={{ width: 'auto', padding: '10px 24px', margin: '0 auto' }}
                        onClick={() => setActiveMenu('POST_JOBS')}
                      >
                        Create First Order
                      </button>
                    </div>
                  ) : null}

                  {orders.map(order => (
                    <div key={order.id} className="order-block">
                      <div className="order-block-header">
                        <div>
                          <h3 className="order-title">{order.roleTitle}</h3>
                          <div className="order-meta-row">
                            <span className="order-meta-badge">
                              <MapPin size={12} className="text-slate-400" />
                              <span>Location: {Array.isArray(order.location) ? order.location.join(', ') : (order.location || '—')}</span>
                            </span>
                            <span className="order-meta-badge">
                              <BadgePercent size={12} className="text-slate-400" />
                              <span>Salary: {order.salaryRange}</span>
                            </span>
                            <span className="order-meta-badge">
                              <HelpCircle size={12} className="text-slate-400" />
                              <span>Education Target: {order.educationLevel}</span>
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            type="button" 
                            className="role-preset-btn selected" 
                            style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                            onClick={() => setEditingOrder(order)}
                          >
                            <span>✏️ Edit</span>
                          </button>
                          <button 
                            type="button" 
                            className="role-preset-btn" 
                            style={{ color: '#ffffff', borderColor: '#ef4444', background: '#ef4444', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                            onClick={() => deleteOrder(order.id)}
                          >
                            <Trash2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            Delete Requisition
                          </button>
                        </div>
                      </div>

                      <div className="emp-card-body" style={{ background: '#fafbfc' }}>
                        <div className="candidate-kpi-sub">
                          Algorithmic Sourced Candidates ({order.matchedCandidates?.length || 0})
                        </div>
                        
                        {order.matchedCandidates?.length === 0 ? (
                          <div style={{ padding: '24px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.25rem' }}>🔍</span>
                            <div>
                              <p style={{ fontSize: '0.825rem', fontWeight: '600', color: '#334155' }}>Sourcing Sprints Active</p>
                              <p style={{ fontSize: '0.785rem', color: '#64748b', marginTop: '2px' }}>
                                No candidates matched yet. Our recruitment engine is screening new registrations for this role.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="cand-grid">
                            {order.matchedCandidates.map(c => (
                              <div key={c.id} className="cand-card">
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>{c.fullName || 'Talent Profile'}</span>
                                    <span className="emp-mono-text" style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', fontWeight: '700', color: '#475569' }}>
                                      {c.candidateIdNumber}
                                    </span>
                                  </div>
                                  <div className="cand-meta-list">
                                    <div className="cand-meta-item">
                                      <span>Experience</span>
                                      <strong>{c.experienceYears} Years</strong>
                                    </div>
                                    <div className="cand-meta-item">
                                      <span>Education</span>
                                      <strong>{c.topEducation}</strong>
                                    </div>
                                    <div className="cand-meta-item">
                                      <span>Location</span>
                                      <strong>{Array.isArray(c.location) ? c.location.join(', ') : (c.location || '—')}</strong>
                                    </div>
                                    <div className="cand-meta-item">
                                      <span>Gender</span>
                                      <strong>{c.gender}</strong>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                  <button 
                                    type="button" 
                                    className="employer-submit-btn" 
                                    style={{ fontSize: '0.8rem', padding: '8px' }}
                                  >
                                    Request Full Unblind
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeMenu === 'SETTINGS' && (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <div className="emp-section-header">
                <h1 className="emp-section-title">Security Profile settings</h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                  Manage credentials and update profile access logs.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Email Panel */}
                <div className="emp-card">
                  <div className="emp-card-header">
                    <div>
                      <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>Update Contact Email</h3>
                      <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>Configure the primary billing and notification address.</p>
                    </div>
                  </div>

                  <div className="emp-card-body">
                    <form onSubmit={handleSaveEmail} className="emp-form-stack" noValidate>
                      {emailSuccess && <div className="alert-box success" style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>✅ {emailSuccess}</div>}

                      <div className="emp-field">
                        <label className="emp-field-label">Account Email Address</label>
                        <input
                          type="email"
                          className={`emp-input${emailError ? ' input-error' : ''}`}
                          value={settingsEmail}
                          onChange={(e) => {
                            setSettingsEmail(e.target.value);
                            if (emailError) setEmailError('');
                          }}
                          placeholder="hr@company.com"
                        />
                        {emailError && (
                          <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '6px', fontWeight: '500' }}>
                            {emailError}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="submit"
                          disabled={isSavingEmail}
                          className="employer-submit-btn"
                          style={{ width: 'auto', padding: '10px 24px' }}
                        >
                          {isSavingEmail ? 'Saving...' : 'Update Email Address'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Password Panel */}
                <div className="emp-card">
                  <div className="emp-card-header">
                    <div>
                      <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>Update Corporate Password</h3>
                      <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>Choose a secure password combining alpha-numeric tokens.</p>
                    </div>
                  </div>

                  <div className="emp-card-body">
                    <form onSubmit={handleSavePassword} className="emp-form-stack" noValidate>
                      {passwordSuccess && <div className="alert-box success" style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>✅ {passwordSuccess}</div>}
                      
                      <div className="emp-field">
                        <label className="emp-field-label">New Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type={showPassword ? "text" : "password"}
                            className={`emp-input${newPasswordError ? ' input-error' : ''}`}
                            value={settingsPassword}
                            onChange={(e) => {
                              setSettingsPassword(e.target.value);
                              if (newPasswordError) setNewPasswordError('');
                              if (confirmPasswordError && settingsConfirmPassword && e.target.value === settingsConfirmPassword) {
                                setConfirmPasswordError('');
                              }
                            }}
                            placeholder="Set new password"
                            style={{ paddingRight: '40px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {newPasswordError && (
                          <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '6px', fontWeight: '500' }}>
                            {newPasswordError}
                          </p>
                        )}
                      </div>
 
                      <div className="emp-field">
                        <label className="emp-field-label">Confirm New Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className={`emp-input${confirmPasswordError ? ' input-error' : ''}`}
                            value={settingsConfirmPassword}
                            onChange={(e) => {
                              setSettingsConfirmPassword(e.target.value);
                              if (confirmPasswordError) setConfirmPasswordError('');
                            }}
                            placeholder="Confirm new password"
                            style={{ paddingRight: '40px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {confirmPasswordError && (
                          <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '6px', fontWeight: '500' }}>
                            {confirmPasswordError}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="submit"
                          disabled={isSavingPassword}
                          className="employer-submit-btn"
                          style={{ width: 'auto', padding: '10px 24px' }}
                        >
                          {isSavingPassword ? 'Saving...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Requisition Edit Modal */}
      {editingOrder && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            className="emp-card" 
            style={{ 
              width: '100%', 
              maxWidth: '640px', 
              margin: '0 auto', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#ffffff'
            }}
          >
            <div 
              className="emp-card-header" 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px 20px', 
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Edit Active Requisition</span>
                <h3 style={{ fontWeight: '800', fontSize: '1.15rem', color: '#0f172a', marginTop: '2px' }}>
                  {editingOrder.roleTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <div 
              className="emp-card-body" 
              style={{ 
                overflowY: 'auto', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px' 
              }}
            >
              {modalError && (
                <div style={{
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>⚠️ {modalError}</span>
                  <button
                    type="button"
                    onClick={() => setModalError('')}
                    style={{ background: 'none', border: 'none', color: '#b91c1c', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="emp-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* Target Salary Range */}
                <div className="emp-field">
                  <label className="emp-field-label">Target Salary Range</label>
                  {(() => {
                    const salaryStr = editingOrder.salaryRange || '₹15,000 - ₹25,000';
                    const { minVal, maxVal } = parseSalaryRange(salaryStr);
                    const minIdx = findClosestIdx(minVal);
                    const maxIdx = findClosestIdx(maxVal);

                    const handleMinSliderChange = (e) => {
                      const newMinIdx = Math.min(parseInt(e.target.value, 10), maxIdx - 1);
                      const formattedSalary = `₹${SALARY_STEPS[newMinIdx].toLocaleString('en-IN')} - ₹${SALARY_STEPS[maxIdx].toLocaleString('en-IN')}`;
                      setEditingOrder(prev => ({ ...prev, salaryRange: formattedSalary }));
                    };

                    const handleMaxSliderChange = (e) => {
                      const newMaxIdx = Math.max(parseInt(e.target.value, 10), minIdx + 1);
                      const formattedSalary = `₹${SALARY_STEPS[minIdx].toLocaleString('en-IN')} - ₹${SALARY_STEPS[newMaxIdx].toLocaleString('en-IN')}`;
                      setEditingOrder(prev => ({ ...prev, salaryRange: formattedSalary }));
                    };

                    const leftPercent = (minIdx / (SALARY_STEPS.length - 1)) * 100;
                    const rightPercent = (maxIdx / (SALARY_STEPS.length - 1)) * 100;

                    return (
                      <div className="salary-slider-wrapper" style={{ padding: '5px 0 10px' }}>
                        <div className="salary-display" style={{ fontSize: '0.85rem', padding: '6px 12px', marginBottom: '8px', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontWeight: '700' }}>
                          ₹{SALARY_STEPS[minIdx].toLocaleString('en-IN')} - ₹{SALARY_STEPS[maxIdx].toLocaleString('en-IN')}
                        </div>

                        <div className="range-slider-container" style={{ height: '16px', position: 'relative', width: '100%' }}>
                          <div className="range-slider-track" style={{ height: '4px', background: '#e2e8f0', borderRadius: '4px', position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 0, right: 0 }} />
                          <div
                            className="range-slider-highlight"
                            style={{
                              position: 'absolute',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              height: '4px',
                              background: '#2563eb',
                              borderRadius: '4px',
                              left: `${leftPercent}%`,
                              width: `${rightPercent - leftPercent}%`
                            }}
                          />
                          <input
                            type="range"
                            min={0}
                            max={SALARY_STEPS.length - 1}
                            value={minIdx}
                            onChange={handleMinSliderChange}
                            className="range-slider-input"
                            style={{ position: 'absolute', width: '100%', pointerEvents: 'auto', appearance: 'none', background: 'none', height: 0, top: '50%', transform: 'translateY(-50%)', outline: 'none' }}
                          />
                          <input
                            type="range"
                            min={0}
                            max={SALARY_STEPS.length - 1}
                            value={maxIdx}
                            onChange={handleMaxSliderChange}
                            className="range-slider-input"
                            style={{ position: 'absolute', width: '100%', pointerEvents: 'auto', appearance: 'none', background: 'none', height: 0, top: '50%', transform: 'translateY(-50%)', outline: 'none' }}
                          />
                        </div>

                        <div className="salary-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', color: '#64748b', fontWeight: '550' }}>
                          <span>Min: ₹10,000</span>
                          <span>Max: ₹5,00,000</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Target Locations */}
                <div className="emp-field">
                  <label className="emp-field-label">Target Locations (Tamil Nadu Districts)</label>
                  <select 
                    className="emp-select"
                    value=""
                    onChange={e => {
                      if (e.target.value) {
                        const currentLocs = Array.isArray(editingOrder.location) ? editingOrder.location : [];
                        if (!currentLocs.includes(e.target.value)) {
                          setEditingOrder(prev => ({ ...prev, location: [...currentLocs, e.target.value] }));
                        }
                      }
                    }}
                  >
                    <option value="">Select District…</option>
                    {TN_DISTRICTS.filter(d => !(Array.isArray(editingOrder.location) ? editingOrder.location : []).includes(d)).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div className="emp-tag-holder" style={{ marginTop: '8px' }}>
                    {(Array.isArray(editingOrder.location) ? editingOrder.location : []).length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No locations selected.</span>
                    ) : (
                      (Array.isArray(editingOrder.location) ? editingOrder.location : []).map(d => (
                        <button
                          key={d}
                          type="button"
                          className="emp-tag-chip"
                          onClick={() => {
                            const currentLocs = Array.isArray(editingOrder.location) ? editingOrder.location : [];
                            setEditingOrder(prev => ({ ...prev, location: currentLocs.filter(x => x !== d) }));
                          }}
                          title="Remove Location"
                        >
                          <span>{d}</span>
                          <span style={{ color: '#ef4444' }}>×</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="emp-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* Marital Status */}
                <div className="emp-field">
                  <label className="emp-field-label">Marital Status Mandate <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    required
                    className="emp-select"
                    value={editingOrder.maritalStatus || ''}
                    onChange={e => setEditingOrder(prev => ({ ...prev, maritalStatus: e.target.value }))}
                  >
                    <option value="">Select marital status mandate...</option>
                    <option value="No Preference">No Preference</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>

                {/* Education Level */}
                <div className="emp-field">
                  <label className="emp-field-label">Education Cutoff <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    required
                    className="emp-select"
                    value={editingOrder.educationLevel || ''}
                    onChange={e => setEditingOrder(prev => ({ ...prev, educationLevel: e.target.value }))}
                  >
                    <option value="">Select education cutoff...</option>
                    <option value="No Education Mandate">No Education Mandate</option>
                    {EDUCATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Experience & Vacancies Row */}
              <div className="emp-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
                <div className="emp-field">
                  <label className="emp-field-label">Minimum Experience Mandate (Years)</label>
                  <input
                    className="emp-input"
                    type="number"
                    min="0"
                    value={editingOrder.expRequired === 0 ? '' : editingOrder.expRequired}
                    onChange={e => {
                      const val = e.target.value;
                      const numVal = val === '' ? 0 : parseInt(val, 10) || 0;
                      setEditingOrder(prev => ({ ...prev, expRequired: numVal }));
                    }}
                    placeholder="0 (Freshers Welcome)"
                  />
                </div>

                <div className="emp-field">
                  <label className="emp-field-label">Number of Vacancies <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    required
                    className="emp-input"
                    type="number"
                    min="1"
                    value={editingOrder.vacanciesCount === 0 || editingOrder.vacanciesCount === undefined ? '' : editingOrder.vacanciesCount}
                    onChange={e => {
                      const val = e.target.value;
                      const numVal = val === '' ? 0 : parseInt(val, 10) || 0;
                      setEditingOrder(prev => ({ ...prev, vacanciesCount: numVal }));
                    }}
                    placeholder="1"
                  />
                </div>

                <div className="emp-field">
                  <label className="emp-field-label">Min Age Limit</label>
                  <input
                    className="emp-input"
                    type="number"
                    min="18"
                    max="99"
                    value={editingOrder.minAge === undefined || editingOrder.minAge === null ? '' : editingOrder.minAge}
                    onChange={e => {
                      const val = e.target.value;
                      const numVal = val === '' ? '' : parseInt(val, 10);
                      setEditingOrder(prev => ({ ...prev, minAge: numVal }));
                    }}
                    placeholder="18"
                  />
                </div>

                <div className="emp-field">
                  <label className="emp-field-label">Max Age Limit</label>
                  <input
                    className="emp-input"
                    type="number"
                    min="18"
                    max="99"
                    value={editingOrder.maxAge === undefined || editingOrder.maxAge === null ? '' : editingOrder.maxAge}
                    onChange={e => {
                      const val = e.target.value;
                      const numVal = val === '' ? '' : parseInt(val, 10);
                      setEditingOrder(prev => ({ ...prev, maxAge: numVal }));
                    }}
                    placeholder="99"
                  />
                </div>
              </div>
            </div>

            <div 
              style={{ 
                padding: '16px 20px', 
                borderTop: '1px solid #e2e8f0', 
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}
            >
              <button
                type="button"
                className="role-preset-btn"
                style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', background: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' }}
                onClick={() => setEditingOrder(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="employer-submit-btn"
                style={{ width: 'auto', padding: '8px 20px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}
                onClick={async () => {
                  setModalError('');
                  if (Array.isArray(editingOrder.location) && editingOrder.location.length === 0) {
                    setModalError('Please select at least one district location.');
                    return;
                  }
                  if (!editingOrder.maritalStatus) {
                    setModalError('Please select a Marital Status Mandate.');
                    return;
                  }
                  if (!editingOrder.educationLevel) {
                    setModalError('Please select an Education Cutoff.');
                    return;
                  }
                  if (editingOrder.vacanciesCount === undefined || editingOrder.vacanciesCount === null || Number(editingOrder.vacanciesCount) < 1) {
                    setModalError('Please specify a valid Number of Vacancies (at least 1).');
                    return;
                  }
                  const minAgeVal = editingOrder.minAge === '' || editingOrder.minAge === undefined ? 18 : Number(editingOrder.minAge);
                  const maxAgeVal = editingOrder.maxAge === '' || editingOrder.maxAge === undefined ? 99 : Number(editingOrder.maxAge);
                  if (isNaN(minAgeVal) || minAgeVal < 18) {
                    setModalError('Minimum age must be at least 18.');
                    return;
                  }
                  if (isNaN(maxAgeVal) || maxAgeVal < minAgeVal) {
                    setModalError('Maximum age must be greater than or equal to minimum age.');
                    return;
                  }
                  const success = await updateOrder(editingOrder.id, {
                    salaryRange: editingOrder.salaryRange,
                    location: editingOrder.location,
                    maritalStatus: editingOrder.maritalStatus,
                    educationLevel: editingOrder.educationLevel,
                    expRequired: editingOrder.expRequired,
                    vacanciesCount: Number(editingOrder.vacanciesCount) || 1,
                    minAge: minAgeVal,
                    maxAge: maxAgeVal
                  });
                  if (success) {
                    setEditingOrder(null);
                    setModalError('');
                  }
                }}
              >
                Save Specification Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingOrderId}
        title="Delete Requisition"
        message="Are you sure you want to delete this requisition? This action will mark it inactive and remove it from candidate matches."
        onConfirm={() => confirmDeleteOrder(deletingOrderId)}
        onCancel={() => setDeletingOrderId(null)}
        confirmText="Delete Requisition"
        type="danger"
      />
    </div>
  );
}