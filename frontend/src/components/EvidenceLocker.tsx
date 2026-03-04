import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  Filter,
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getEvidence, uploadEvidence, getDownloadUrl, type Evidence } from '../api/evidenceService';
import BackButton from './BackButton';

const EvidenceLocker: React.FC = () => {
  // State for evidence list
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Form state for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploadedBy, setUploadedBy] = useState('Inspector Rajesh Kumar'); // Default value
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load evidence on component mount
  useEffect(() => {
    loadEvidence();
  }, []);

  /**
   * Load evidence from API
   */
  const loadEvidence = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build filters for API call
      const filters: { fileType?: 'image' | 'video' | 'pdf'; search?: string } = {};
      
      if (selectedFilter !== 'all') {
        filters.fileType = selectedFilter === 'document' ? 'pdf' : selectedFilter as 'image' | 'video';
      }
      
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }
      
      const evidence = await getEvidence(filters);
      setEvidenceList(evidence);
    } catch (err) {
      console.error('Failed to load evidence:', err);
      setError(err instanceof Error ? err.message : 'Failed to load evidence');
    } finally {
      setLoading(false);
    }
  };

  // Reload when search or filter changes
  useEffect(() => {
    if (!loading) {
      loadEvidence();
    }
  }, [searchTerm, selectedFilter]);

  /**
   * Handle file selection
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setUploadError(null);
    }
  };

  /**
   * Handle file upload
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }

    if (!uploadedBy.trim()) {
      setUploadError('Please enter your name');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      // Upload file to backend
      const uploadedEvidence = await uploadEvidence(
        selectedFile,
        uploadedBy.trim(),
        undefined, // caseId - can be added later
        description.trim() || undefined,
        tags.trim() || undefined
      );

      // Add to list and close modal
      setEvidenceList(prev => [uploadedEvidence, ...prev]);
      setShowUploadModal(false);
      
      // Reset form
      setSelectedFile(null);
      setDescription('');
      setTags('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle download
   */
  const handleDownload = (evidenceId: string) => {
    const downloadUrl = getDownloadUrl(evidenceId);
    window.open(downloadUrl, '_blank');
  };

  /**
   * Handle view (open in new tab)
   */
  const handleView = (evidence: Evidence) => {
    if (evidence.url) {
      window.open(evidence.url, '_blank');
    } else {
      const viewUrl = getDownloadUrl(evidence.id);
      window.open(viewUrl, '_blank');
    }
  };

  /**
   * Get file icon based on type
   */
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-8 h-8 text-green-600" />;
      case 'video': return <Video className="w-8 h-8 text-purple-600" />;
      default: return <File className="w-8 h-8 text-blue-600" />;
    }
  };

  // Calculate stats from evidence list
  const totalFiles = evidenceList.length;
  const encryptedCount = evidenceList.filter(e => e?.encrypted).length;
  const videoCount = evidenceList.filter(e => e?.type === 'video').length;
  const imageCount = evidenceList.filter(e => e?.type === 'image').length;

  // Client-side filtering (for additional filtering after API search)
  const filteredEvidence = evidenceList.filter(evidence => {
    if (!evidence) return false; // Skip undefined/null items
    const matchesSearch = evidence.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evidence.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || evidence.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalFiles}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{encryptedCount}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{videoCount}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{imageCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Images</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Evidence List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Evidence Files</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Loading evidence...</p>
          </div>
        ) : filteredEvidence.length === 0 ? (
          <div className="p-8 text-center">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No evidence files found</p>
          </div>
        ) : (
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
                      {evidence?.encrypted && (
                        <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                          <Lock className="w-3 h-3" />
                          <span>Encrypted</span>
                        </div>
                      )}
                    </div>
                    {evidence.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{evidence.description}</p>
                    )}
                    {evidence.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {evidence.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
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
                    <button
                      onClick={() => handleView(evidence)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(evidence.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Evidence</h3>
            
            {/* File Selection */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop files here, or click to select
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,.pdf"
                    className="hidden"
                    id="evidence-upload"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="evidence-upload"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Select File
                  </label>
                </>
              )}
            </div>

            {/* Upload Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Uploaded By <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Inspector Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Evidence, Primary, CCTV"
                />
              </div>
            </div>

            {/* Upload Error */}
            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{uploadError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDescription('');
                  setTags('');
                  setUploadError(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={uploading}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceLocker;
