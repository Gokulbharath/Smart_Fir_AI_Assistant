import React, { useState } from 'react';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  Shield,
  Calendar,
  User,
  Tag,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  Lock
} from 'lucide-react';

interface Evidence {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video';
  size: string;
  uploadedBy: string;
  uploadDate: string;
  tags: string[];
  encrypted: boolean;
  description: string;
}

const EvidenceLocker: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([
    {
      id: '1',
      name: 'CCTV_Footage_Sector14_Jan12.mp4',
      type: 'video',
      size: '45.2 MB',
      uploadedBy: 'Inspector Rajesh Kumar',
      uploadDate: '2025-01-12',
      tags: ['CCTV', 'Primary Evidence', 'Theft'],
      encrypted: true,
      description: 'CCTV footage from Sector 14 market showing the theft incident'
    },
    {
      id: '2',
      name: 'Victim_Statement.pdf',
      type: 'document',
      size: '2.1 MB',
      uploadedBy: 'Inspector Rajesh Kumar',
      uploadDate: '2025-01-12',
      tags: ['Statement', 'Victim', 'Primary'],
      encrypted: true,
      description: 'Written statement from the victim Rahul Sharma'
    },
    {
      id: '3',
      name: 'Crime_Scene_Photos.jpg',
      type: 'image',
      size: '8.7 MB',
      uploadedBy: 'Sub-Inspector Priya Sharma',
      uploadDate: '2025-01-12',
      tags: ['Crime Scene', 'Photos', 'Evidence'],
      encrypted: true,
      description: 'High-resolution photos of the crime scene location'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-8 h-8 text-green-600" />;
      case 'video': return <Video className="w-8 h-8 text-purple-600" />;
      default: return <File className="w-8 h-8 text-blue-600" />;
    }
  };

  const filteredEvidence = evidenceList.filter(evidence => {
    const matchesSearch = evidence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evidence.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || evidence.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleFileUpload = (files: FileList) => {
    // Handle file upload logic here
    console.log('Uploading files:', files);
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-green-600 rounded-lg p-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Evidence Locker</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Secure storage for case evidence and documents
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Evidence</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search evidence by name or tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="document">Documents</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evidence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2">
              <File className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Encrypted</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Videos</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-2">
              <Image className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Images</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Evidence Files</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredEvidence.map((evidence) => (
            <div key={evidence.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getFileIcon(evidence.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {evidence.name}
                    </h3>
                    {evidence.encrypted && (
                      <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                        <Lock className="w-3 h-3" />
                        <span>Encrypted</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{evidence.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {evidence.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{evidence.uploadedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{evidence.uploadDate}</span>
                    </div>
                    <span>{evidence.size}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Evidence</h3>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop files here, or click to select
              </p>
              <input
                type="file"
                multiple
                className="hidden"
                id="evidence-upload"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
              <label
                htmlFor="evidence-upload"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                Select Files
              </label>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe the evidence..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Evidence, Primary, CCTV"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceLocker;