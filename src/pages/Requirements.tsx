import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Calendar, User, Car, Paperclip, FileText, Image, Video, MessageSquare } from 'lucide-react';
import { dataProvider, Requirement } from '../lib/data';
import Modal from '../components/Modal';

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Ordered': 'bg-purple-100 text-purple-800',
  'Procedure': 'bg-orange-100 text-orange-800',
  'Contacted Customer': 'bg-cyan-100 text-cyan-800',
  'Completed': 'bg-green-100 text-green-800',
};

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-red-100 text-red-800',
};

export default function CustomerRequirement() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_number: '',
    description: '',
    priority: 'Medium' as Requirement['priority'],
    status: 'Pending' as Requirement['status'],
    attachments: [] as Array<{
      name: string;
      type: string;
      size: number;
      file?: File; // Store the actual File object
    }>,
    comments: [] as string[],
  });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    try {
      const data = await dataProvider.getRequirements();
      setRequirements(data);
    } catch (error) {
      console.error('Failed to load requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequirement = () => {
    setEditingRequirement(null);
    setFormData({
      customer_name: '',
      customer_number: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      attachments: [],
      comments: [],
    });
    setIsModalOpen(true);
  };

  const handleEditRequirement = (requirement: Requirement) => {
    setEditingRequirement(requirement);
    
    // Convert database attachments to form attachment structure
    const formAttachments = (requirement.attachments || []).map(attachment => ({
      name: attachment.name || 'Unknown file',
      type: attachment.type || 'application/octet-stream',
      size: attachment.size || 0,
      file: undefined // No file object for existing attachments
    }));
    
    setFormData({
      customer_name: requirement.customer_name,
      customer_number: requirement.customer_number,
      description: requirement.description,
      priority: requirement.priority,
      status: requirement.status,
      attachments: formAttachments,
      comments: requirement.comments || [],
    });
    setIsModalOpen(true);
  };

  const handleDeleteRequirement = async (requirementId: string) => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      try {
        await dataProvider.deleteRequirement(requirementId);
        await loadRequirements();
      } catch (error) {
        console.error('Failed to delete requirement:', error);
        alert('Failed to delete requirement. Please try again.');
      }
    }
  };

  const handleStatusChange = async (requirementId: string, newStatus: Requirement['status']) => {
    try {
      await dataProvider.updateRequirement(requirementId, { status: newStatus });
      await loadRequirements();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedRequirement) return;
    
    try {
      // Use the proper comment method from the data provider
      await dataProvider.addRequirementComment(selectedRequirement.id, {
        text: newComment,
        author: 'Admin' // You can get this from the auth context if needed
      });
      setNewComment('');
      setIsCommentModalOpen(false);
      await loadRequirements();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Filter out fields that shouldn't be sent to the database
      const { attachments, comments, ...dbData } = formData;
      
      let requirementId: string;
      
      if (editingRequirement) {
        await dataProvider.updateRequirement(editingRequirement.id, dbData);
        requirementId = editingRequirement.id;
      } else {
        const newRequirement = await dataProvider.createRequirement({
          ...dbData,
          attachments: [],
          comments: [],
        });
        requirementId = newRequirement.id;
      }
      
      // Upload attachments if any
      if (attachments.length > 0) {
        for (const attachment of attachments) {
          if (attachment.file) {
            await dataProvider.uploadAttachment('requirement', requirementId, attachment.file);
          }
        }
      }
      
      setIsModalOpen(false);
      await loadRequirements();
    } catch (error) {
      console.error('Failed to save requirement:', error);
      alert('Failed to save requirement. Please try again.');
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const fileData = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      file: file // Store the actual File object instead of blob URL
    }));
    setFormData({ ...formData, attachments: [...formData.attachments, ...fileData] });
  };

  const removeAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const statuses = ['All', 'Pending', 'In Progress', 'Ordered', 'Procedure', 'Contacted Customer', 'Completed'];

  const filteredRequirements = requirements.filter((requirement) => {
    const matchesSearch = (requirement.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (requirement.customer_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (requirement.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || requirement.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Dashboard stats
  const dashboardStats = {
    'Pending': requirements.filter(r => r.status === 'Pending').length,
    'In Progress': requirements.filter(r => r.status === 'In Progress').length,
    'Ordered': requirements.filter(r => r.status === 'Ordered').length,
    'Procedure': requirements.filter(r => r.status === 'Procedure').length,
    'Contacted Customer': requirements.filter(r => r.status === 'Contacted Customer').length,
    'Completed': requirements.filter(r => r.status === 'Completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Requirement</h1>
          <p className="mt-2 text-gray-600">
            Track customer service requirements and requests
          </p>
        </div>
        <button 
          onClick={handleAddRequirement}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </button>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        {Object.entries(dashboardStats).map(([status, count]) => (
          <div key={status} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {status === 'Pending' && <Calendar className="h-6 w-6 text-yellow-600" />}
                  {status === 'In Progress' && <Car className="h-6 w-6 text-blue-600" />}
                  {status === 'Ordered' && <FileText className="h-6 w-6 text-purple-600" />}
                  {status === 'Procedure' && <User className="h-6 w-6 text-orange-600" />}
                  {status === 'Contacted Customer' && <User className="h-6 w-6 text-cyan-600" />}
                  {status === 'Completed' && <Car className="h-6 w-6 text-green-600" />}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{status}</dt>
                    <dd className="text-lg font-medium text-gray-900">{count}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Active Customer Requirements Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Active Customer Requirements
          </h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CUSTOMER DETAILS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DESCRIPTION
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRIORITY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TIMESTAMP CREATED
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ATTACHMENTS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COMMENTS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequirements.map((requirement) => {
                    const createdDate = new Date(requirement.created_at);
                    
                    return (
                      <tr key={requirement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{requirement.customer_name}</div>
                            <div className="text-sm text-gray-500">{requirement.customer_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {requirement.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[requirement.priority]}`}>
                            {requirement.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{createdDate.toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">{createdDate.toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500">
                              {(requirement.attachments || []).length}
                            </span>
                            {(requirement.attachments || []).length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedRequirement(requirement);
                                  setIsAttachmentModalOpen(true);
                                }}
                                className="ml-2 text-blue-600 hover:text-blue-900"
                              >
                                <Paperclip className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500">
                              {(requirement.comments || []).length}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedRequirement(requirement);
                                setIsCommentModalOpen(true);
                              }}
                              className="ml-2 text-green-600 hover:text-green-900"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={requirement.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as Requirement['status'];
                              handleStatusChange(requirement.id, newStatus);
                            }}
                            className={`text-sm font-medium border-0 bg-transparent ${statusColors[requirement.status]} focus:outline-none`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Ordered">Ordered</option>
                            <option value="Procedure">Procedure</option>
                            <option value="Contacted Customer">Contacted Customer</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditRequirement(requirement)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteRequirement(requirement.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRequirements.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No requirements found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Requirement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRequirement ? 'Edit Requirement' : 'Add New Requirement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Number
              </label>
              <input
                type="tel"
                required
                value={formData.customer_number}
                onChange={(e) => setFormData({ ...formData, customer_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter requirement description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Requirement['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Requirement['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Ordered">Ordered</option>
                <option value="Procedure">Procedure</option>
                <option value="Contacted Customer">Contacted Customer</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments (Photo, PDF, Video)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,video/*"
              onChange={handleAttachmentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {formData.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <div className="flex items-center">
                      {attachment.name?.toLowerCase().includes('.pdf') && <FileText className="h-4 w-4 text-red-500 mr-2" />}
                      {['.jpg', '.jpeg', '.png', '.gif'].some(ext => attachment.name?.toLowerCase().includes(ext)) && <Image className="h-4 w-4 text-green-500 mr-2" />}
                      {['.mp4', '.avi', '.mov'].some(ext => attachment.name?.toLowerCase().includes(ext)) && <Video className="h-4 w-4 text-blue-500 mr-2" />}
                      <span className="text-sm text-gray-700">{attachment.name || 'Unknown file'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editingRequirement ? 'Update Requirement' : 'Add Requirement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Comments Modal */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        title="Comments & Additional Details"
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Customer: {selectedRequirement?.customer_name}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {selectedRequirement?.description}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Comment
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter additional details or comments..."
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCommentModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Comment
            </button>
          </div>
          
          {(selectedRequirement?.comments || []).length > 0 && (
            <div className="mt-6">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Previous Comments:</h5>
              <div className="space-y-2">
                {(selectedRequirement?.comments || []).map((comment, index) => (
                  <div key={comment.id || index} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium text-gray-600">{comment.author}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Attachments Modal */}
      <Modal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        title="Attachments"
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Customer: {selectedRequirement?.customer_name}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {selectedRequirement?.description}
            </p>
          </div>
          
          {(selectedRequirement?.attachments || []).length > 0 ? (
            <div className="space-y-3">
              {(selectedRequirement?.attachments || []).map((attachment, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center">
                    {attachment.name?.toLowerCase().includes('.pdf') && <FileText className="h-5 w-5 text-red-500 mr-3" />}
                    {['.jpg', '.jpeg', '.png', '.gif'].some(ext => attachment.name?.toLowerCase().includes(ext)) && <Image className="h-5 w-5 text-green-500 mr-3" />}
                    {['.mp4', '.avi', '.mov'].some(ext => attachment.name?.toLowerCase().includes(ext)) && <Video className="h-5 w-5 text-blue-500 mr-3" />}
                    <div>
                      <span className="text-sm font-medium text-gray-900">{attachment.name}</span>
                      <p className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(1)} KB • {attachment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {attachment.data ? (
                      <a
                        href={attachment.data}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        View
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          alert('File preview not available for this attachment');
                        }}
                        className="text-gray-400 text-sm cursor-not-allowed"
                      >
                        View
                      </button>
                    )}
                    {attachment.data && (
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = attachment.data || '#';
                          link.download = attachment.name;
                          link.click();
                        }}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No attachments uploaded</p>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={() => setIsAttachmentModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}