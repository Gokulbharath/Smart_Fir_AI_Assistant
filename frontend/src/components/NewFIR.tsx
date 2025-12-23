// src/components/NewFIR.tsx
import React, { useState } from 'react';
import { createDraft, submitFIR } from '../api/firService';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import {
  FileText,
  User,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  Save,
  Send,
  Plus,
  X,
  Scale
} from 'lucide-react';

interface VictimDetails {
  name: string;
  age: string;
  gender: string;
  address: string;
  contact: string;
  occupation: string;
}

interface AccusedDetails {
  name: string;
  age: string;
  gender: string;
  address: string;
  description: string;
}

interface IncidentDetails {
  date: string;
  time: string;
  location: string;
  description: string;
  witnesses: string[];
}

const NewFIR: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [victim, setVictim] = useState<VictimDetails>({
    name: '',
    age: '',
    gender: '',
    address: '',
    contact: '',
    occupation: ''
  });

  const [accused, setAccused] = useState<AccusedDetails>({
    name: '',
    age: '',
    gender: '',
    address: '',
    description: ''
  });

  const [incident, setIncident] = useState<IncidentDetails>({
    date: '',
    time: '',
    location: '',
    description: '',
    witnesses: ['']
  });

  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ipcSections = [
    { section: 'IPC 379', offense: 'Theft', punishment: 'Up to 3 years imprisonment', bailable: true },
    { section: 'IPC 356', offense: 'Assault or criminal force in attempt to commit theft', punishment: 'Up to 7 years imprisonment', bailable: false },
    { section: 'IPC 323', offense: 'Voluntarily causing hurt', punishment: 'Up to 1 year imprisonment', bailable: true },
    { section: 'IPC 420', offense: 'Cheating and dishonestly inducing delivery of property', punishment: 'Up to 7 years imprisonment', bailable: false },
    { section: 'IPC 498A', offense: 'Husband or relative of husband subjecting woman to cruelty', punishment: 'Up to 3 years imprisonment', bailable: false }
  ];

  const addWitness = () => {
    setIncident(prev => ({ ...prev, witnesses: [...prev.witnesses, ''] }));
  };

  const removeWitness = (index: number) => {
    setIncident(prev => ({ ...prev, witnesses: prev.witnesses.filter((_, i) => i !== index) }));
  };

  const updateWitness = (index: number, value: string) => {
    setIncident(prev => ({
      ...prev,
      witnesses: prev.witnesses.map((w, i) => (i === index ? value : w))
    }));
  };

  const toggleSection = (section: string) => {
    setSelectedSections(prev => (prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]));
  };

  const steps = [
    { number: 1, title: 'Victim Details', icon: User },
    { number: 2, title: 'Accused Details', icon: AlertTriangle },
    { number: 3, title: 'Incident Details', icon: MapPin },
    { number: 4, title: 'IPC Sections', icon: Scale }
  ];

  const renderStepIndicator = () => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center space-x-3 ${
                currentStep >= step.number ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  currentStep >= step.number
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}
              >
                {currentStep > step.number ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className="font-semibold">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.number
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    : 'bg-slate-200 dark:bg-slate-600'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderVictimForm = () => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
        <User className="w-6 h-6 mr-3 text-blue-600" />
        Victim Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name *</label>
          <input
            type="text"
            value={victim.name}
            onChange={e => setVictim(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            placeholder="Enter victim's full name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Age *</label>
          <input
            type="number"
            value={victim.age}
            onChange={e => setVictim(prev => ({ ...prev, age: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            placeholder="Age"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gender *</label>
          <select
            value={victim.gender}
            onChange={e => setVictim(prev => ({ ...prev, gender: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Contact Number *</label>
          <input
            type="tel"
            value={victim.contact}
            onChange={e => setVictim(prev => ({ ...prev, contact: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            placeholder="+91 XXXXXXXXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Occupation</label>
          <input
            type="text"
            value={victim.occupation}
            onChange={e => setVictim(prev => ({ ...prev, occupation: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            placeholder="Occupation"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Address *</label>
          <textarea
            value={victim.address}
            onChange={e => setVictim(prev => ({ ...prev, address: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            placeholder="Complete address with pin code"
          />
        </div>
      </div>
    </div>
  );

  const renderAccusedForm = () => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
        <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
        Accused Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name</label>
          <input
            type="text"
            value={accused.name}
            onChange={e => setAccused(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            placeholder="Name (if known) or 'Unknown'"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Approximate Age</label>
          <input
            type="text"
            value={accused.age}
            onChange={e => setAccused(prev => ({ ...prev, age: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            placeholder="Age (if known)"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gender</label>
          <select
            value={accused.gender}
            onChange={e => setAccused(prev => ({ ...prev, gender: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Address</label>
          <input
            type="text"
            value={accused.address}
            onChange={e => setAccused(prev => ({ ...prev, address: e.target.value }))}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            placeholder="Address (if known)"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Physical Description</label>
          <textarea
            value={accused.description}
            onChange={e => setAccused(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            placeholder="Physical description, clothing, distinguishing features, etc."
          />
        </div>
      </div>
    </div>
  );

  const renderIncidentForm = () => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
        <MapPin className="w-6 h-6 mr-3 text-green-600" />
        Incident Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date of Incident *</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={incident.date}
              onChange={e => setIncident(prev => ({ ...prev, date: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Time of Incident *</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="time"
              value={incident.time}
              onChange={e => setIncident(prev => ({ ...prev, time: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            />
          </div>
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Location of Incident *</label>
        <textarea
          value={incident.location}
          onChange={e => setIncident(prev => ({ ...prev, location: e.target.value }))}
          rows={2}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          placeholder="Detailed location with landmarks"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Incident Description *</label>
        <textarea
          value={incident.description}
          onChange={e => setIncident(prev => ({ ...prev, description: e.target.value }))}
          rows={6}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          placeholder="Detailed description of what happened..."
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Witnesses</label>
        {incident.witnesses.map((witness, index) => (
          <div key={index} className="flex items-center space-x-3 mb-3">
            <input
              type="text"
              value={witness}
              onChange={e => updateWitness(index, e.target.value)}
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
              placeholder={`Witness ${index + 1} name and contact`}
            />
            {incident.witnesses.length > 1 && (
              <button
                onClick={() => removeWitness(index)}
                type="button"
                className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addWitness}
          type="button"
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Witness</span>
        </button>
      </div>
    </div>
  );

  const renderIPCSections = () => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
        <Scale className="w-6 h-6 mr-3 text-purple-600" />
        Select Applicable IPC Sections
      </h2>
      <div className="space-y-4">
        {ipcSections.map((section, index) => (
          <div
            key={index}
            className="border border-slate-200 dark:border-slate-600 rounded-xl p-5 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              <input
                type="checkbox"
                checked={selectedSections.includes(section.section)}
                onChange={() => toggleSection(section.section)}
                className="mt-1 w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">
                    {section.section}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      section.bailable
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                    }`}
                  >
                    {section.bailable ? 'Bailable' : 'Non-Bailable'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{section.offense}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <strong>Punishment:</strong> {section.punishment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderVictimForm();
      case 2:
        return renderAccusedForm();
      case 3:
        return renderIncidentForm();
      case 4:
        return renderIPCSections();
      default:
        return renderVictimForm();
    }
  };

  const generateFirNumber = () =>
    `FIR/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`;

  const buildPayload = () => {
    return {
      firNumber: generateFirNumber(),
      victim: victim.name,
      accused: accused.name || 'Unknown',
      incident: incident.description,
      date: incident.date,
      time: incident.time,
      location: incident.location,
      ipcSections: selectedSections,
      description: incident.description,
      createdBy: user?.email || 'user'
    };
  };

  const phoneValid = (s: string) => /^\+?\d{10,15}$/.test(s.replace(/\s/g, ''));
  const requiredOk = () =>
    victim.name.trim() &&
    victim.age.trim() &&
    victim.gender.trim() &&
    victim.address.trim() &&
    victim.contact.trim() &&
    incident.date.trim() &&
    incident.time.trim() &&
    incident.location.trim() &&
    incident.description.trim() &&
    phoneValid(victim.contact);

  const setTempBanner = (type: 'success' | 'error', message: string, ms = 3000) => {
    setBanner({ type, message });
    window.setTimeout(() => setBanner(null), ms);
  };

  const onSaveDraft = async () => {
    if (!requiredOk()) {
      setTempBanner('error', 'Fill all required fields and a valid contact number.');
      return;
    }
    try {
      setIsSaving(true);
      const payload = buildPayload();
      const { fir } = await createDraft(payload);
      addNotification({
        title: 'Draft saved',
        message: `FIR ${payload.firNumber} stored in Drafts.`,
        type: 'success'
      });
      setTempBanner('success', `FIR ${payload.firNumber} saved in Drafts.`);
    } catch (e: any) {
      const msg = e?.message || 'Failed to save draft';
      addNotification({ title: 'Error', message: msg, type: 'error' });
      setTempBanner('error', msg, 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const onGenerateFIR = async () => {
    if (!requiredOk()) {
      setTempBanner('error', 'Fill all required fields and a valid contact number.');
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = buildPayload();
      const { fir } = await createDraft(payload); // expects { fir: { _id: string } }
      await submitFIR(fir._id);
      addNotification({
        title: 'Sent for Approval',
        message: `FIR ${payload.firNumber} sent for inspector approval.`,
        type: 'success'
      });
      setTempBanner('success', `FIR ${payload.firNumber} sent for inspector approval.`);
    } catch (e: any) {
      const msg = e?.message || 'Failed to send for approval';
      addNotification({ title: 'Error', message: msg, type: 'error' });
      setTempBanner('error', msg, 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Centered Banner Overlay */}
      {banner && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-live="polite"
          aria-label={banner.type === 'success' ? 'Success' : 'Error'}
        >
          <div
            className={`px-6 py-4 rounded-xl text-center shadow-2xl text-lg font-semibold border max-w-md w-[90%] ${
              banner.type === 'success'
                ? 'bg-green-50 border-green-300 text-green-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            {banner.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 dark:from-green-500 dark:to-emerald-600 rounded-xl p-3 shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Create New FIR
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Fill in the details to create a new First Information Report
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      {renderStepIndicator()}

      {/* Form */}
      {renderCurrentStep()}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1 || isSaving || isSubmitting}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          type="button"
        >
          Previous
        </button>

        <div className="flex space-x-4">
          <button
            onClick={onSaveDraft}
            disabled={isSaving || isSubmitting}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />
            <span>{isSaving ? 'Saving…' : 'Save Draft'}</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
              disabled={isSaving || isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onGenerateFIR}
              disabled={isSaving || isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <Send className={`w-5 h-5 ${isSubmitting ? 'animate-pulse' : ''}`} />
              <span>{isSubmitting ? 'Sending…' : 'Send for Approval'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewFIR;
