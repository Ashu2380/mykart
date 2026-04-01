
import React, { useState, useContext, useEffect } from 'react';
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaEdit, FaSave, FaTimes, FaHistory, FaMapMarkerAlt,
  FaShieldAlt, FaDownload, FaUserSlash, FaTrashAlt, FaCheckCircle
} from 'react-icons/fa';
import { userDataContext } from '../context/UserContext';
import { authDataContext } from '../context/authContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../component/Title';
 
/* ─────────────────────────────────────────────
   Tabs config
───────────────────────────────────────────── */
const TABS = [
  { id: 'profile',   label: 'Profile',         icon: <FaUser /> },
  { id: 'email',     label: 'Email',            icon: <FaEnvelope /> },
  { id: 'password',  label: 'Password',         icon: <FaLock /> },
  { id: 'activity',  label: 'Login activity',   icon: <FaHistory /> },
  { id: 'privacy',   label: 'Privacy',          icon: <FaShieldAlt /> },
  { id: 'actions',   label: 'Account actions',  icon: <FaTrashAlt /> },
];
 
/* ─────────────────────────────────────────────
   Password strength helper
───────────────────────────────────────────── */
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '',           color: '' },
    { label: 'Weak',       color: '#E24B4A' },
    { label: 'Moderate',   color: '#EF9F27' },
    { label: 'Strong',     color: '#639922' },
    { label: 'Very strong',color: '#3B6D11' },
  ];
  return { score, ...map[score] };
}
 
/* ─────────────────────────────────────────────
   Inline editable field card
───────────────────────────────────────────── */
function ProfileField({ label, field, type = 'text', options = null, profileData, onSave }) {
  const [editing, setEditing]   = useState(false);
  const [tempVal, setTempVal]   = useState('');
 
  const start = () => { setTempVal(profileData[field] || ''); setEditing(true); };
  const cancel = () => setEditing(false);
  const save = () => {
    if (!tempVal.trim()) { toast.error('Field cannot be empty'); return; }
    onSave(field, tempVal);
    setEditing(false);
  };
 
  return (
    <div className="as-field-card">
      <div className="as-field-header">
        <span className="as-field-label">{label}</span>
        {editing ? (
          <div className="as-field-btns">
            <button onClick={save}  className="as-icon-btn green" title="Save"><FaSave /></button>
            <button onClick={cancel} className="as-icon-btn red"   title="Cancel"><FaTimes /></button>
          </div>
        ) : (
          <button onClick={start} className="as-icon-btn blue" title="Edit"><FaEdit /></button>
        )}
      </div>
 
      {editing ? (
        options ? (
          <select
            value={tempVal}
            onChange={e => setTempVal(e.target.value)}
            className="as-input"
            autoFocus
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={tempVal}
            onChange={e => setTempVal(e.target.value)}
            className="as-input"
            placeholder={`Enter ${label.toLowerCase()}`}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          />
        )
      ) : (
        <p className="as-field-value">
          {profileData[field] || <span className="as-muted">Not provided</span>}
        </p>
      )}
    </div>
  );
}
 
/* ─────────────────────────────────────────────
   Password input with eye toggle
───────────────────────────────────────────── */
function PasswordInput({ id, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="as-pw-wrap">
      <input
        type={show ? 'text' : 'password'}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="as-input"
      />
      <button
        type="button"
        className="as-eye-btn"
        onClick={() => setShow(s => !s)}
        tabIndex={-1}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}
 
/* ─────────────────────────────────────────────
   Toggle switch
───────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <label className="as-toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="as-toggle-track">
        <span className="as-toggle-thumb" />
      </span>
    </label>
  );
}
 
/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
function AccountSettings() {
  const { userData, setUserData } = useContext(userDataContext);
  const { serverUrl }             = useContext(authDataContext);
 
  const [activeTab,   setActiveTab]   = useState('profile');
  const [loading,     setLoading]     = useState(false);
 
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', dateOfBirth: '', gender: '', alternateEmail: '',
  });
 
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
 
  const [privacy, setPrivacy] = useState({
    emailNotif: true, smsNotif: true, marketing: false,
  });
 
  const [loginHistory,   setLoginHistory]   = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
 
  /* seed profile from context */
  useEffect(() => {
    if (userData) {
      setProfileData({
        name:           userData.name           || '',
        email:          userData.email          || '',
        phone:          userData.phone          || '',
        dateOfBirth:    userData.dateOfBirth    || '',
        gender:         userData.gender         || '',
        alternateEmail: userData.alternateEmail || '',
      });
    }
  }, [userData]);
 
  useEffect(() => { fetchLoginHistory(); }, [userData]);
 
  /* ── API calls ── */
  const handleProfileUpdate = async (field, value) => {
    try {
      setLoading(true);
      const res = await axios.put(`${serverUrl}/api/user/profile`, { [field]: value }, { withCredentials: true });
      if (res.data.success) {
        setProfileData(prev => ({ ...prev, [field]: value }));
        setUserData(prev  => ({ ...prev, [field]: value }));
        toast.success('Profile updated successfully');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
 
  const handlePasswordChange = async e => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match'); return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    try {
      setLoading(true);
      const res = await axios.put(
        `${serverUrl}/api/user/change-password`,
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };
 
  const fetchLoginHistory = async () => {
    if (!userData?._id) return;
    try {
      setHistoryLoading(true);
      const res = await axios.get(`${serverUrl}/api/auth/login-history`, { withCredentials: true });
      setLoginHistory(res.data);
      if (res.data.length === 0) toast.info('No login history found yet');
    } catch {
      toast.error('Failed to load login history');
    } finally {
      setHistoryLoading(false);
    }
  };
 
  const deleteAccount = async () => {
    const confirmation = window.prompt('Type DELETE to permanently remove your account:');
    if (confirmation !== 'DELETE') return;
    try {
      setLoading(true);
      await axios.delete(`${serverUrl}/api/user/delete-account`, { withCredentials: true });
      toast.success('Account deleted successfully');
      setUserData(null);
      window.location.href = '/login';
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };
 
  /* ── Password strength ── */
  const strength = getPasswordStrength(passwordData.newPassword);
  const pwMatch  = passwordData.confirmPassword
    ? passwordData.newPassword === passwordData.confirmPassword
    : null;
 
  /* ────────────────────────────────────────── */
  return (
    <div className="as-root">
      <style>{`
        /* ── Layout ── */
        .as-root {
          width: 100%;
          min-height: 100vh;
          background: #f0f4f8;
          padding: 5.5rem 1.5rem 5rem;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .as-wrap { max-width: 860px; margin: 0 auto; }
 
        /* ── Tab bar ── */
        .as-tabbar {
          display: flex;
          gap: 6px;
          margin-bottom: 1.5rem;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: none;
        }
        .as-tabbar::-webkit-scrollbar { display: none; }
        .as-tab-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #d1dde8;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          background: #fff;
          color: #5a7080;
          transition: all 0.15s;
        }
        .as-tab-btn:hover { background: #e8f0f8; color: #1a3a52; }
        .as-tab-btn.active {
          background: #1a56db;
          color: #fff;
          border-color: #1a56db;
        }
        .as-tab-icon { font-size: 12px; opacity: 0.85; }
 
        /* ── Section card ── */
        .as-card {
          background: #fff;
          border: 1px solid #d9e4ef;
          border-radius: 14px;
          padding: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .as-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #1a2b3c;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .as-card-title svg { color: #1a56db; font-size: 14px; }
 
        /* ── Field cards grid ── */
        .as-fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 12px;
        }
        .as-field-card {
          background: #f7fafc;
          border: 1px solid #d9e4ef;
          border-radius: 10px;
          padding: 14px 16px;
          transition: border-color 0.15s;
        }
        .as-field-card:hover { border-color: #93b4d4; }
        .as-field-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .as-field-label { font-size: 11.5px; font-weight: 600; color: #7a8fa0; text-transform: uppercase; letter-spacing: 0.05em; }
        .as-field-value { font-size: 15px; font-weight: 500; color: #1a2b3c; }
        .as-muted { color: #a0b4c4; font-weight: 400; }
        .as-field-btns { display: flex; gap: 4px; }
        .as-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
          border-radius: 6px;
          font-size: 13px;
          display: flex;
          align-items: center;
          transition: background 0.12s;
        }
        .as-icon-btn.blue { color: #1a56db; }
        .as-icon-btn.blue:hover { background: #e8f0fb; }
        .as-icon-btn.green { color: #2f855a; }
        .as-icon-btn.green:hover { background: #e6f4ed; }
        .as-icon-btn.red { color: #c53030; }
        .as-icon-btn.red:hover { background: #fee2e2; }
 
        /* ── Inputs ── */
        .as-input {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #c4d6e4;
          border-radius: 8px;
          font-size: 14px;
          background: #fff;
          color: #1a2b3c;
          margin-top: 6px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .as-input:focus { outline: none; border-color: #1a56db; box-shadow: 0 0 0 3px rgba(26,86,219,0.10); }
 
        /* ── Password wrap ── */
        .as-pw-wrap { position: relative; }
        .as-pw-wrap .as-input { padding-right: 40px; }
        .as-eye-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #7a8fa0;
          font-size: 14px;
          display: flex;
          align-items: center;
          padding: 4px;
          margin-top: 3px;
        }
        .as-eye-btn:hover { color: #1a2b3c; }
 
        /* ── Strength bar ── */
        .as-strength-bar { display: flex; gap: 5px; margin-top: 8px; }
        .as-seg {
          height: 4px;
          flex: 1;
          border-radius: 2px;
          background: #d9e4ef;
          transition: background 0.3s;
        }
 
        /* ── Form label ── */
        .as-label { font-size: 13px; font-weight: 500; color: #4a6070; margin-bottom: 4px; display: block; }
        .as-form-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
        .as-hint { font-size: 12px; margin-top: 5px; }
 
        /* ── Primary btn ── */
        .as-btn-primary {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: #1a56db;
          color: #fff;
          transition: background 0.15s, opacity 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .as-btn-primary:hover { background: #1445b8; }
        .as-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
 
        /* ── Info banner ── */
        .as-banner {
          background: #fffbea;
          border: 1px solid #f6e05e;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 13px;
          color: #7b5e07;
          margin-top: 12px;
          line-height: 1.6;
        }
 
        /* ── Login table ── */
        .as-table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid #d9e4ef; }
        .as-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .as-table th {
          text-align: left;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #7a8fa0;
          background: #f7fafc;
          border-bottom: 1px solid #d9e4ef;
        }
        .as-table td { padding: 11px 14px; border-bottom: 1px solid #eef3f8; color: #1a2b3c; }
        .as-table tr:last-child td { border-bottom: none; }
        .as-table tr:hover td { background: #f7fafc; }
        .as-ip { font-family: 'DM Mono', monospace; font-size: 12px; background: #eef3f8; padding: 2px 7px; border-radius: 5px; color: #4a6070; }
        .as-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 6px; }
        .as-dot-ok   { background: #38a169; }
        .as-dot-warn { background: #d69e2e; }
 
        /* ── Toggle ── */
        .as-toggle { position: relative; display: inline-block; width: 42px; height: 23px; cursor: pointer; }
        .as-toggle input { opacity: 0; width: 0; height: 0; }
        .as-toggle-track {
          position: absolute;
          inset: 0;
          background: #c4d6e4;
          border-radius: 100px;
          transition: background 0.2s;
        }
        .as-toggle input:checked ~ .as-toggle-track { background: #1a56db; }
        .as-toggle-thumb {
          position: absolute;
          width: 17px;
          height: 17px;
          top: 3px;
          left: 3px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.18);
        }
        .as-toggle input:checked ~ .as-toggle-track .as-toggle-thumb { transform: translateX(19px); }
 
        /* ── Toggle row ── */
        .as-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid #eef3f8;
        }
        .as-toggle-row:last-child { border-bottom: none; }
        .as-toggle-info h3 { font-size: 14px; font-weight: 600; color: #1a2b3c; margin-bottom: 2px; }
        .as-toggle-info p  { font-size: 13px; color: #7a8fa0; }
 
        /* ── Action cards ── */
        .as-action-card {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          background: #fff;
          border: 1px solid #d9e4ef;
          border-radius: 12px;
          padding: 1.2rem 1.4rem;
          margin-bottom: 10px;
        }
        .as-action-card.danger { background: #fff5f5; border-color: #fed7d7; }
        .as-action-card h3 { font-size: 14px; font-weight: 600; color: #1a2b3c; margin-bottom: 4px; }
        .as-action-card.danger h3 { color: #c53030; }
        .as-action-card p { font-size: 13px; color: #7a8fa0; line-height: 1.6; max-width: 360px; }
        .as-action-card.danger p { color: #c53030; opacity: 0.75; }
        .as-action-btn {
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          border: 1px solid #c4d6e4;
          background: #fff;
          color: #1a2b3c;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .as-action-btn:hover { background: #f0f4f8; }
        .as-action-btn.danger {
          background: #fff5f5;
          color: #c53030;
          border-color: #fca5a5;
        }
        .as-action-btn.danger:hover { background: #fee2e2; }
        .as-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
 
        /* ── Email primary badge ── */
        .as-primary-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 100px;
          background: #ebf4ff;
          color: #1a56db;
          letter-spacing: 0.04em;
          vertical-align: middle;
          margin-left: 8px;
        }
 
        /* ── Spinner ── */
        .as-spinner {
          display: inline-block;
          width: 20px; height: 20px;
          border: 2px solid #d9e4ef;
          border-top-color: #1a56db;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
 
        /* ── Empty state ── */
        .as-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #7a8fa0;
        }
        .as-empty svg { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.4; }
        .as-empty p { font-size: 14px; }
      `}</style>
 
      <div className="as-wrap">
        <Title text1={'ACCOUNT'} text2={'SETTINGS'} />
 
        {/* ── Tab bar ── */}
        <div className="as-tabbar" role="tablist">
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              className={`as-tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="as-tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
 
        {/* ══════════════════════════════════════
            PROFILE
        ══════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="as-card">
            <div className="as-card-title"><FaUser /> Profile information</div>
            <div className="as-fields-grid">
              <ProfileField label="Full name"       field="name"           profileData={profileData} onSave={handleProfileUpdate} />
              <ProfileField label="Phone number"    field="phone"   type="tel"    profileData={profileData} onSave={handleProfileUpdate} />
              <ProfileField label="Date of birth"   field="dateOfBirth" type="date" profileData={profileData} onSave={handleProfileUpdate} />
              <ProfileField
                label="Gender" field="gender"
                options={['Male','Female','Other','Prefer not to say']}
                profileData={profileData} onSave={handleProfileUpdate}
              />
              <div style={{ gridColumn: '1 / -1' }}>
                <ProfileField label="Alternate email" field="alternateEmail" type="email" profileData={profileData} onSave={handleProfileUpdate} />
              </div>
            </div>
          </div>
        )}
 
        {/* ══════════════════════════════════════
            EMAIL
        ══════════════════════════════════════ */}
        {activeTab === 'email' && (
          <div className="as-card">
            <div className="as-card-title"><FaEnvelope /> Email settings</div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#7a8fa0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary email</span>
              <span className="as-primary-badge">PRIMARY</span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1a2b3c', marginBottom: 12 }}>{profileData.email}</p>
            <div className="as-banner">
              <strong>Note:</strong> To change your primary email address, please contact customer support for security verification.
            </div>
          </div>
        )}
 
        {/* ══════════════════════════════════════
            PASSWORD
        ══════════════════════════════════════ */}
        {activeTab === 'password' && (
          <div className="as-card">
            <div className="as-card-title"><FaLock /> Password &amp; security</div>
            <form onSubmit={handlePasswordChange} style={{ maxWidth: 460 }}>
              <div className="as-form-row">
                <label className="as-label" htmlFor="pw-current">Current password</label>
                <PasswordInput
                  id="pw-current"
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </div>
 
              <div className="as-form-row">
                <label className="as-label" htmlFor="pw-new">New password</label>
                <PasswordInput
                  id="pw-new"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                {/* Strength bar */}
                <div className="as-strength-bar">
                  {[1,2,3,4].map(i => (
                    <div
                      key={i}
                      className="as-seg"
                      style={{ background: i <= strength.score ? strength.color : undefined }}
                    />
                  ))}
                </div>
                {strength.label && (
                  <span className="as-hint" style={{ color: strength.color }}>{strength.label}</span>
                )}
              </div>
 
              <div className="as-form-row">
                <label className="as-label" htmlFor="pw-confirm">Confirm new password</label>
                <PasswordInput
                  id="pw-confirm"
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
                {pwMatch !== null && (
                  <span className="as-hint" style={{ color: pwMatch ? '#2f855a' : '#c53030' }}>
                    {pwMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                )}
              </div>
 
              <button type="submit" className="as-btn-primary" disabled={loading}>
                {loading ? <span className="as-spinner" /> : <FaCheckCircle />}
                {loading ? 'Changing…' : 'Change password'}
              </button>
            </form>
          </div>
        )}
 
        {/* ══════════════════════════════════════
            LOGIN ACTIVITY
        ══════════════════════════════════════ */}
        {activeTab === 'activity' && (
          <div className="as-card">
            <div className="as-card-title"><FaHistory /> Login activity</div>
            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <span className="as-spinner" />
                <p style={{ marginTop: 12, fontSize: 14, color: '#7a8fa0' }}>Loading history…</p>
              </div>
            ) : loginHistory.length === 0 ? (
              <div className="as-empty">
                <FaHistory />
                <p>No login activity found yet.</p>
              </div>
            ) : (
              <div className="as-table-wrap">
                <table className="as-table">
                  <thead>
                    <tr>
                      <th>Date &amp; time</th>
                      <th>IP address</th>
                      <th>Device</th>
                      <th>Browser / OS</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map((h, i) => (
                      <tr key={i}>
                        <td>
                          {new Date(h.loginTime).toLocaleString('en-IN', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                        <td><span className="as-ip">{h.ip}</span></td>
                        <td>{h.device || 'Desktop'}</td>
                        <td>{h.browser}/{h.os}</td>
                        <td>
                          <span className={`as-dot ${h.location && h.location !== 'Unknown' ? 'as-dot-ok' : 'as-dot-warn'}`} />
                          <FaMapMarkerAlt style={{ fontSize: 11, marginRight: 4, opacity: 0.5 }} />
                          {h.location || 'Unknown'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
 
        {/* ══════════════════════════════════════
            PRIVACY
        ══════════════════════════════════════ */}
        {activeTab === 'privacy' && (
          <div className="as-card">
            <div className="as-card-title"><FaShieldAlt /> Privacy settings</div>
            <div>
              {[
                { key: 'emailNotif', title: 'Email notifications',       desc: 'Orders, offers, and updates via email' },
                { key: 'smsNotif',   title: 'SMS notifications',          desc: 'Order status updates via SMS' },
                { key: 'marketing',  title: 'Marketing communications',   desc: 'Promotional offers and recommendations' },
              ].map(item => (
                <div key={item.key} className="as-toggle-row">
                  <div className="as-toggle-info">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                  <Toggle
                    checked={privacy[item.key]}
                    onChange={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key] }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
 
        {/* ══════════════════════════════════════
            ACCOUNT ACTIONS
        ══════════════════════════════════════ */}
        {activeTab === 'actions' && (
          <>
            <div className="as-action-card">
              <div>
                <h3>Download your data</h3>
                <p>Download a copy of your account data including orders, addresses, and preferences.</p>
              </div>
              <button className="as-action-btn" onClick={() => toast.info('Data download feature coming soon!')}>
                <FaDownload /> Request download
              </button>
            </div>
 
            <div className="as-action-card">
              <div>
                <h3>Deactivate account</h3>
                <p>Temporarily deactivate your account. You can reactivate it anytime by logging in.</p>
              </div>
              <button className="as-action-btn" onClick={() => toast.info('Account deactivation coming soon!')}>
                <FaUserSlash /> Deactivate
              </button>
            </div>
 
            <div className="as-action-card danger">
              <div>
                <h3>Delete account</h3>
                <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
              <button className="as-action-btn danger" onClick={deleteAccount} disabled={loading}>
                <FaTrashAlt /> {loading ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
 
export default AccountSettings;
 