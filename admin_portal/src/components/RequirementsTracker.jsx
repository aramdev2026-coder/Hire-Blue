import React, { useState } from 'react';
import { Loader, Folder, FolderOpen, ArrowLeft, Briefcase, Users, Search, Filter, Plus, X, Award, MapPin, Heart, GraduationCap } from 'lucide-react';
import { STATES_AND_DISTRICTS } from '../utils/locationData';
const TN_DISTRICTS = STATES_AND_DISTRICTS["Tamil Nadu"];

const ALL_JOB_ROLES = [
  "Agricultural Laborer",
  "Aircraft Mechanic",
  "Assembly Line Worker",
  "Assembly Technician",
  "Auto Body Repair Technician",
  "Auto Mechanic",
  "Automotive Painter",
  "Baker",
  "Blaster",
  "Boiler Operator",
  "Butcher",
  "CNC Machine Operator",
  "Carpenter",
  "Concrete Finisher",
  "Crane Operator",
  "Delivery Executive",
  "Diesel Mechanic",
  "Dispatcher",
  "Drilling Machine Operator",
  "Drywall Installer",
  "Dyeing Machine Operator",
  "Electrician",
  "Elevator Mechanic",
  "Embroidery Machine Operator",
  "Event Crew",
  "Fabric Cutter",
  "Facility Manager",
  "Farm Equipment Operator",
  "Fire and Safety Officer",
  "Fitter",
  "Fleet Maintenance Supervisor",
  "Forklift Operator",
  "Foundry Worker",
  "General Laborer",
  "Groundskeeper",
  "HVAC Technician",
  "Heavy Equipment Operator",
  "Heavy Truck Driver",
  "Housekeeper",
  "Industrial Electrician",
  "Industrial Painter",
  "Injection Molding Operator",
  "Inventory Clerk",
  "Ironworker",
  "Irrigation Technician",
  "Janitor",
  "Kitchen Helper",
  "Light Vehicle Driver",
  "Line Cook",
  "Loader / Unloader",
  "Logistics Coordinator",
  "Machinist",
  "Maintenance Technician",
  "Mason",
  "Material Handler",
  "Miner",
  "Packaging Operator",
  "Painter",
  "Picker and Packer",
  "Plumber",
  "Production Supervisor",
  "Quality Control Inspector",
  "Roofer",
  "Scaffolder",
  "Security Guard",
  "Sewing Machine Operator",
  "Site Supervisor",
  "Surveyor Assistant",
  "Tailor",
  "Tire Technician",
  "Tool and Die Maker",
  "Turner",
  "Waiter",
  "Warehouse Associate",
  "Weaver",
  "Welder"
];

const HIGH_DEMAND_ROLES = [
  'Merchandiser',
  'Office Assistant',
  'HR Manager',
  'Store In-Charge',
  'Marketing Staff',
  'Delivery Staff',
  'M/c Operator',
  'Driver',
  'Follow-up',
  'Data Entry',
  'Quality Controller',
  'Sales Rep',
  'Supervisor',
  'Documentation',
  'Accountant',
  'Packing / Checking',
  'Production Follow-up'
];

const SALARY_STEPS = [
  10000, 12000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 32000, 35000, 40000, 45000, 50000,
  60000, 70000, 80000, 90000, 100000, 120000, 150000, 180000, 200000, 220000, 250000, 275000, 300000, 330000, 350000, 375000, 400000, 425000, 450000, 475000, 500000
];

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

export default function RequirementsTracker({ jobs, loading, employers = [], onCreateRequirement, onCreateEmployer }) {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL_ROLES');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddEmployerModal, setShowAddEmployerModal] = useState(false);

  // Form States
  const [companyQuery, setCompanyQuery] = useState('');
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [isCompanyInputFocused, setIsCompanyInputFocused] = useState(false);
  const [roleQuery, setRoleQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isRoleInputFocused, setIsRoleInputFocused] = useState(false);
  const [salaryRange, setSalaryRange] = useState('₹15,000 - ₹25,000');
  const [locations, setLocations] = useState([]);
  const [maritalStatus, setMaritalStatus] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [expRequired, setExpRequired] = useState(0);
  const [vacanciesCount, setVacanciesCount] = useState(1);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Inline Employer Form States
  const [empForm, setEmpForm] = useState({ companyName: '', phoneNumber: '', email: '', password: '' });
  const [empModalError, setEmpModalError] = useState('');
  const [empSubmitting, setEmpSubmitting] = useState(false);

  const uniqueRoles = Array.from(
    new Set(jobs.map((job) => job.roleTitle).filter(Boolean))
  ).sort();

  const groupedCompanies = jobs.reduce((acc, job) => {
    const companyName = job.employerName || job.employer?.companyName || 'Unknown Company';
    const roleTitle = job.roleTitle || '';

    if (roleFilter !== 'ALL_ROLES' && roleTitle !== roleFilter) {
      return acc;
    }

    if (searchQuery && !companyName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return acc;
    }

    if (!acc[companyName]) {
      acc[companyName] = {
        companyName: companyName,
        totalOrders: 0,
        totalVacancies: 0,
        requirements: []
      };
    }

    acc[companyName].totalOrders += 1;
    acc[companyName].totalVacancies += parseInt(job.vacanciesCount || 0, 10);
    acc[companyName].requirements.push(job);

    return acc;
  }, {});

  const companyFolders = Object.values(groupedCompanies);

  const handleRequirementSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!selectedEmployer) {
      setModalError('Please select a registered company or add a new one');
      return;
    }
    if (!selectedRole.trim()) {
      setModalError('Please select or specify a target Job Role');
      return;
    }
    if (locations.length === 0) {
      setModalError('Please select at least one Tamil Nadu location district');
      return;
    }
    if (!maritalStatus) {
      setModalError('Please select a Marital Status Mandate');
      return;
    }
    if (!educationLevel) {
      setModalError('Please select an Education Cutoff');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateRequirement({
        employerId: selectedEmployer.id,
        roleTitle: selectedRole,
        salaryRange,
        location: locations,
        maritalStatus: maritalStatus || 'No Preference',
        educationLevel: educationLevel || 'No Education Mandate',
        expRequired,
        vacanciesCount: parseInt(vacanciesCount, 10) || 1
      });
      // Reset & close
      setShowAddModal(false);
      setSelectedEmployer(null);
      setCompanyQuery('');
      setSelectedRole('');
      setRoleQuery('');
      setSalaryRange('₹15,000 - ₹25,000');
      setLocations([]);
      setMaritalStatus('');
      setEducationLevel('');
      setExpRequired(0);
      setVacanciesCount(1);
    } catch (err) {
      setModalError(err.message || 'Failed to post job requirement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEmployerInline = async (e) => {
    e.preventDefault();
    setEmpModalError('');

    if (!empForm.companyName.trim()) {
      setEmpModalError('Company Name is required');
      return;
    }
    if (!empForm.phoneNumber.trim()) {
      setEmpModalError('Phone Number is required');
      return;
    }
    if (!/^\d{10}$/.test(empForm.phoneNumber.trim())) {
      setEmpModalError('Enter a valid 10-digit phone number');
      return;
    }
    if (!empForm.password.trim()) {
      setEmpModalError('Password is required');
      return;
    }

    setEmpSubmitting(true);
    try {
      await onCreateEmployer({
        companyName: empForm.companyName.trim(),
        phoneNumber: empForm.phoneNumber.trim(),
        email: empForm.email.trim() || undefined,
        password: empForm.password.trim(),
        status: 'ACTIVE'
      });
      
      // Look up recently added company to auto-select
      const recentlyAdded = employers.find(
        emp => emp.companyName.toLowerCase() === empForm.companyName.trim().toLowerCase()
      );
      if (recentlyAdded) {
        setSelectedEmployer(recentlyAdded);
        setCompanyQuery(recentlyAdded.companyName);
      } else {
        // Fallback placeholder
        setSelectedEmployer({ id: 'NEW_ACCOUNT', companyName: empForm.companyName.trim() });
        setCompanyQuery(empForm.companyName.trim());
      }

      setEmpForm({ companyName: '', phoneNumber: '', email: '', password: '' });
      setShowAddEmployerModal(false);
    } catch (err) {
      setEmpModalError(err.message || 'Failed to register employer');
    } finally {
      setEmpSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {!selectedCompany && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search across company folders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="relative w-full sm:w-auto flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-xs"
            >
              <option value="ALL_ROLES">All Roles Demand (Show All)</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role} Requisitions Only
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" /> Add Requirement
            </button>
          </div>
        </div>
      )}

      {!selectedCompany ? (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Corporate Demand Directory ({companyFolders.length} Folders Matching Criteria)
          </p>
          
          {companyFolders.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center text-slate-400 text-sm">
              No corporate folders match your current search or filter combinations.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyFolders.map((folder) => (
                <div
                  key={folder.companyName}
                  onClick={() => setSelectedCompany(folder.companyName)}
                  className="bg-white border border-slate-200 hover:border-indigo-500 rounded-xl p-5 shadow-xs flex items-start gap-4 transition-all duration-200 cursor-pointer group hover:shadow-sm"
                >
                  <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-xl transition-colors shrink-0">
                    <Folder className="w-6 h-6 group-hover:hidden" />
                    <FolderOpen className="w-6 h-6 hidden group-hover:block" />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-base tracking-tight truncate group-hover:text-indigo-700 transition-colors">
                      {folder.companyName}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                        {folder.totalOrders} {folder.totalOrders === 1 ? 'Order' : 'Orders'}
                      </span>
                      <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-md">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        {folder.totalVacancies} Openings
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedCompany(null)}
                className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-600 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedCompany}</h3>
                <p className="text-xs text-slate-500">
                  {roleFilter !== 'ALL_ROLES' 
                    ? `Showing order parameters matching specified role: ${roleFilter}` 
                    : 'Displaying complete profile deployment requisitions'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                const targetCompanyEmp = employers.find(
                  e => e.companyName.toLowerCase() === selectedCompany.toLowerCase()
                );
                if (targetCompanyEmp) {
                  setSelectedEmployer(targetCompanyEmp);
                  setCompanyQuery(targetCompanyEmp.companyName);
                }
                setShowAddModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Requirement for {selectedCompany}
            </button>
          </div>

          <div className="space-y-4">
            {groupedCompanies[selectedCompany]?.requirements.map((job) => (
              <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 border-l-4 border-l-indigo-500">
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg text-sm flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-base">{job.roleTitle}</span> 
                    <span className="text-slate-500 text-xs ml-2 font-medium bg-slate-200 px-2 py-0.5 rounded-full">
                      {job.vacanciesCount} Positions Open
                    </span>
                  </div>
                  <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                    Salary Range: {job.salaryRange}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-500 px-1 pt-1">
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-bold uppercase tracking-wider text-[10px]">📍 Locations</span>
                    <span className="text-slate-800 text-sm">
                      {Array.isArray(job.location) ? job.location.join(', ') : job.location || 'Not Specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-bold uppercase tracking-wider text-[10px]">🎓 Education Cutoff</span>
                    <span className="text-slate-800 text-sm">{job.educationLevel || 'No Education Mandate'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-bold uppercase tracking-wider text-[10px]">⏳ Experience Mandate</span>
                    <span className="text-slate-800 text-sm">{job.expRequired === 0 ? 'Freshers Welcomed' : `${job.expRequired} Years`}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Requisition Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all flex flex-col my-8 border border-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-extrabold text-slate-900">Post Corporate Job Requirement</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRequirementSubmit} className="p-6 overflow-y-auto max-h-[75vh] space-y-5 text-sm text-slate-700">
              {modalError && (
                <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-150 rounded-xl font-medium">
                  ⚠️ {modalError}
                </div>
              )}

              {/* Employer Field with Autocomplete */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Company / Employer <span className="text-rose-500">*</span>
                </label>
                
                {selectedEmployer ? (
                  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-150 p-2.5 rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-bold text-indigo-900 text-sm">{selectedEmployer.companyName}</span>
                      <span className="text-[10px] text-indigo-650">Registered Phone: {selectedEmployer.phoneNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployer(null);
                        setCompanyQuery('');
                      }}
                      className="text-xs font-bold text-indigo-750 hover:underline bg-white border border-indigo-200 px-2.5 py-1 rounded cursor-pointer shrink-0"
                    >
                      Change Employer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Type to search registered companies..."
                        value={companyQuery}
                        onChange={(e) => setCompanyQuery(e.target.value)}
                        onFocus={() => setIsCompanyInputFocused(true)}
                        onBlur={() => setTimeout(() => setIsCompanyInputFocused(false), 200)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddEmployerModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 rounded-lg text-xs font-extrabold shrink-0 transition-colors"
                      >
                        + Register Company
                      </button>
                    </div>

                    {/* Show warning if typing and no exact/partial matches */}
                    {companyQuery.trim() && (() => {
                      const query = companyQuery.trim().toLowerCase();
                      const matches = employers.filter(
                        e => e.companyName.toLowerCase().includes(query)
                      );
                      if (matches.length === 0) {
                        return (
                          <div className="p-2.5 bg-rose-50 border border-rose-150 rounded-lg text-rose-700 text-xs font-medium">
                            ⚠️ "{companyQuery}" is not registered. To post requirements for a new company, please register the employer first using the "+ Register Company" button.
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Dropdown Suggestions */}
                    {(companyQuery.trim() || isCompanyInputFocused) && (() => {
                      const query = companyQuery.trim().toLowerCase();
                      const matches = query
                        ? employers.filter(e => e.companyName.toLowerCase().includes(query)).slice(0, 5)
                        : employers.slice(0, 10);

                      if (matches.length === 0) return null;
                      return (
                        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 overflow-hidden divide-y divide-slate-50">
                          {matches.map(emp => (
                            <div
                              key={emp.id}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setSelectedEmployer(emp);
                                setCompanyQuery(emp.companyName);
                                setIsCompanyInputFocused(false);
                              }}
                              className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer font-medium text-slate-800 text-xs flex justify-between"
                            >
                              <span>{emp.companyName}</span>
                              <span className="text-[10px] text-slate-400 uppercase">Phone: {emp.phoneNumber}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Role Selection Autocomplete */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Job Role <span className="text-rose-500">*</span>
                </label>
                {selectedRole ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-150 p-2.5 rounded-lg">
                    <span className="font-bold text-emerald-900 text-sm">💼 {selectedRole}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('');
                        setRoleQuery('');
                      }}
                      className="text-xs font-bold text-emerald-700 hover:underline bg-white border border-emerald-200 px-2.5 py-1 rounded cursor-pointer"
                    >
                      Change Role
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      placeholder="Type to search roles (e.g. Fitter, Driver, Security Guard)..."
                      value={roleQuery}
                      onChange={(e) => setRoleQuery(e.target.value)}
                      onFocus={() => setIsRoleInputFocused(true)}
                      onBlur={() => setTimeout(() => setIsRoleInputFocused(false), 200)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm"
                    />

                    {/* Suggestions dropdown */}
                    {(roleQuery.trim() || isRoleInputFocused) && (() => {
                      const query = roleQuery.trim().toLowerCase();
                      const allRoles = [...new Set([...ALL_JOB_ROLES, ...HIGH_DEMAND_ROLES])];
                      const suggestions = query
                        ? allRoles.filter(r => r.toLowerCase().includes(query)).slice(0, 5)
                        : allRoles.slice(0, 10);
                      const isExactMatch = allRoles.some(r => r.toLowerCase() === query);

                      return (
                        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 overflow-hidden divide-y divide-slate-50">
                          {suggestions.map(role => (
                            <div
                              key={role}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setSelectedRole(role);
                                setRoleQuery('');
                                setIsRoleInputFocused(false);
                              }}
                              className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-800"
                            >
                              {role}
                            </div>
                          ))}

                          {query && !isExactMatch && (
                            <div
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setSelectedRole(roleQuery.trim());
                                setRoleQuery('');
                                setIsRoleInputFocused(false);
                              }}
                              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 cursor-pointer text-xs font-bold text-indigo-705 border-t border-indigo-100"
                            >
                              + Add "{roleQuery.trim()}" as a custom role
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Salary Double Range Slider */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Monthly Salary Range
                </label>
                {(() => {
                  const { minVal, maxVal } = parseSalaryRange(salaryRange);
                  const minIdx = findClosestIdx(minVal);
                  const maxIdx = findClosestIdx(maxVal);

                  const handleMinSliderChange = (e) => {
                    const newMinIdx = Math.min(parseInt(e.target.value, 10), maxIdx - 1);
                    const formattedSalary = `₹${SALARY_STEPS[newMinIdx].toLocaleString('en-IN')} - ₹${SALARY_STEPS[maxIdx].toLocaleString('en-IN')}`;
                    setSalaryRange(formattedSalary);
                  };

                  const handleMaxSliderChange = (e) => {
                    const newMaxIdx = Math.max(parseInt(e.target.value, 10), minIdx + 1);
                    const formattedSalary = `₹${SALARY_STEPS[minIdx].toLocaleString('en-IN')} - ₹${SALARY_STEPS[newMaxIdx].toLocaleString('en-IN')}`;
                    setSalaryRange(formattedSalary);
                  };

                  const leftPercent = (minIdx / (SALARY_STEPS.length - 1)) * 100;
                  const rightPercent = (maxIdx / (SALARY_STEPS.length - 1)) * 100;

                  return (
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                      <div className="text-sm font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg inline-block">
                        {salaryRange}
                      </div>

                      <div className="relative h-6 flex items-center">
                        <div className="absolute left-0 right-0 h-1.5 bg-slate-200 rounded" />
                        <div
                          className="absolute h-1.5 bg-indigo-600 rounded"
                          style={{
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
                          className="absolute w-full appearance-none background-transparent pointer-events-none h-0 outline-none range-slider-input"
                          style={{ pointerEvents: 'auto', background: 'none' }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={SALARY_STEPS.length - 1}
                          value={maxIdx}
                          onChange={handleMaxSliderChange}
                          className="absolute w-full appearance-none background-transparent pointer-events-none h-0 outline-none range-slider-input"
                          style={{ pointerEvents: 'auto', background: 'none' }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase">
                        <span>Min: ₹10,000</span>
                        <span>Max: ₹5,00,000</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Locations Tamil Nadu Districts Select + Chips */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Locations (Tamil Nadu Districts) <span className="text-rose-500">*</span>
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !locations.includes(e.target.value)) {
                      setLocations([...locations, e.target.value]);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="">Select Tamil Nadu District...</option>
                  {TN_DISTRICTS.filter(d => !locations.includes(d)).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {locations.length === 0 ? (
                    <span className="text-xs text-slate-400 italic font-medium">No districts selected yet</span>
                  ) : (
                    locations.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setLocations(locations.filter(l => l !== d))}
                        className="bg-indigo-50 border border-indigo-100 hover:border-indigo-300 text-indigo-705 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                        title="Remove location"
                      >
                        <span>{d}</span>
                        <span className="text-rose-500 font-extrabold">×</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Marital Status */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Marital Status Mandate <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="">Select marital status mandate...</option>
                    <option value="No Preference">No Preference</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>

                {/* Education level */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Education Cutoff <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="">Select education cutoff...</option>
                    <option value="No Education Mandate">No Education Mandate</option>
                    {EDUCATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Min Experience (years) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Min Experience Requirement (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 (Freshers Welcome)"
                    value={expRequired === 0 ? '' : expRequired}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExpRequired(val === '' ? 0 : parseInt(val, 10) || 0);
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                {/* Vacancies Count */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Number of Vacancies (Demanding)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 5"
                    value={vacanciesCount}
                    onChange={(e) => setVacanciesCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 bg-slate-50/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-150 border border-slate-200 text-slate-600 px-5 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-sm hover:shadow shrink-0 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Job Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Employer Registration Modal overlay */}
      {showAddEmployerModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-slate-100">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-slate-900">Register New Employer</h3>
              <button
                onClick={() => setShowAddEmployerModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployerInline} className="p-5 space-y-4 text-xs text-slate-700">
              {empModalError && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-150 rounded-lg font-medium">
                  ⚠️ {empModalError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-bold text-slate-500 uppercase tracking-wider">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Star Logistics"
                  value={empForm.companyName}
                  onChange={(e) => setEmpForm({ ...empForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-500 uppercase tracking-wider">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={empForm.phoneNumber}
                  onChange={(e) => setEmpForm({ ...empForm, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-500 uppercase tracking-wider">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="hr@company.com"
                  value={empForm.email}
                  onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-500 uppercase tracking-wider font-bold">Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Create corporate account password"
                  value={empForm.password}
                  onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEmployerModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={empSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer shadow-sm hover:shadow"
                >
                  {empSubmitting ? 'Registering...' : 'Register Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}