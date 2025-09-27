import React, { useState } from 'react';
import { FileText, Download, Send, CreditCard as Edit3, Check, X, Scale, Calendar, MapPin, User, AlertCircle, CheckCircle } from 'lucide-react';

const FIRDraftPreview: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(['IPC 379', 'IPC 356']);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const draftData = {
    firNumber: 'FIR/2025/001234',
    station: 'Sector 14 Police Station',
    date: '2025-01-12',
    time: '21:30',
    victim: {
      name: 'Rahul Sharma',
      age: '28',
      address: '123, Park Street, Sector 15, Delhi - 110001',
      contact: '+91 9876543210'
    },
    accused: 'Unknown person',
    incident: 'Theft of mobile phone and wallet from victim while walking near metro station. The accused approached the victim from behind and snatched the belongings before fleeing the scene.',
    location: 'Sector 14 Market, Near Metro Station, Delhi',
    ipcSections: [
      {
        section: 'IPC 379',
        offense: 'Theft',
        punishment: 'Up to 3 years imprisonment or fine or both',
        bailable: true
      },
      {
        section: 'IPC 356',
        offense: 'Assault or criminal force in attempt to commit theft',
        punishment: 'Up to 7 years imprisonment',
        bailable: false
      },
      {
        section: 'IPC 323',
        offense: 'Voluntarily causing hurt',
        punishment: 'Up to 1 year imprisonment or fine up to ₹1000 or both',
        bailable: true
      }
    ]
  };

  const handleSectionToggle = (section: string) => {
    setSelectedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 rounded-lg p-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FIR Draft Preview</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Review and finalize your First Information Report
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Stop Editing' : 'Edit Draft'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FIR Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">FIR Number</label>
              <p className="text-gray-900 dark:text-white font-mono">{draftData.firNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Police Station</label>
              <p className="text-gray-900 dark:text-white">{draftData.station}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
                <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Calendar className="w-4 h-4" />
                  <span>{draftData.date}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</label>
                <p className="text-gray-900 dark:text-white">{draftData.time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Victim Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Victim Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  defaultValue={draftData.victim.name}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{draftData.victim.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</label>
              <p className="text-gray-900 dark:text-white">{draftData.victim.age} years</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
              <p className="text-gray-900 dark:text-white text-sm">{draftData.victim.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</label>
              <p className="text-gray-900 dark:text-white">{draftData.victim.contact}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Incident Details</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Accused</label>
            {isEditing ? (
              <input 
                type="text" 
                defaultValue={draftData.accused}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{draftData.accused}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location of Incident</label>
            <div className="flex items-start space-x-2 text-gray-900 dark:text-white">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <span>{draftData.location}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Incident Description</label>
            {isEditing ? (
              <textarea 
                defaultValue={draftData.incident}
                rows={4}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{draftData.incident}</p>
            )}
          </div>
        </div>
      </div>

      {/* IPC Sections */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Scale className="w-5 h-5 mr-2" />
          Applicable IPC Sections
        </h2>
        <div className="space-y-4">
          {draftData.ipcSections.map((section, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedSections.includes(section.section)}
                  onChange={() => handleSectionToggle(section.section)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                      {section.section}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      section.bailable 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                    }`}>
                      {section.bailable ? 'Bailable' : 'Non-Bailable'}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">{section.offense}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Punishment:</strong> {section.punishment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => console.log('Downloading PDF...')}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Download PDF</span>
        </button>
        
        <button
          onClick={() => setShowConfirmModal(true)}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <Send className="w-5 h-5" />
          <span>Send to Records</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-mx">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Submission</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to send this FIR to records? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  console.log('FIR sent to records');
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FIRDraftPreview;