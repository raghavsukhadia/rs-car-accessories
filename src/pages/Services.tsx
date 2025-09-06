import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Calendar, User, Car, Paperclip, FileText, Image, Video, Wrench, MessageSquare, Send } from 'lucide-react';
import { dataProvider, ServiceJob, Product } from '../lib/data';
import Modal from '../components/Modal';

const statusColors = {
  'New Complaint': 'bg-red-100 text-red-800',
  'Under Inspection': 'bg-yellow-100 text-yellow-800',
  'Sent to Service Centre': 'bg-blue-100 text-blue-800',
  'Received': 'bg-purple-100 text-purple-800',
  'Completed': 'bg-green-100 text-green-800',
};

export default function ServiceTracker() {
  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [editingServiceJob, setEditingServiceJob] = useState<ServiceJob | null>(null);
  const [selectedServiceJob, setSelectedServiceJob] = useState<ServiceJob | null>(null);
  const [selectedServiceJobForComments, setSelectedServiceJobForComments] = useState<ServiceJob | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<Array<{
    name: string;
    type: string;
    size: number;
    file?: File; // Store the actual File object
  }>>([]);
  const [formData, setFormData] = useState({
    modal_name: '',
    modal_registration_number: '',
    customer_name: '',
    customer_number: '',
    description: '',
    status: 'New Complaint' as ServiceJob['status'],
    attachments: [] as Array<{
      name: string;
      type: string;
      size: number;
      file?: File; // Store the actual File object
    }>,
    scheduled_at: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [serviceJobsData, productsData] = await Promise.all([
        dataProvider.getServiceJobs(),
        dataProvider.getProducts(),
      ]);
      setServiceJobs(serviceJobsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddServiceJob = () => {
    setEditingServiceJob(null);
    setFormData({
      modal_name: '',
      modal_registration_number: '',
      customer_name: '',
      customer_number: '',
      description: '',
      status: 'New Complaint',
      attachments: [],
      scheduled_at: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleEditServiceJob = (serviceJob: ServiceJob) => {
    setEditingServiceJob(serviceJob);
    setFormData({
      modal_name: serviceJob.modal_name,
      modal_registration_number: serviceJob.modal_registration_number,
      customer_name: serviceJob.customer_name,
      customer_number: serviceJob.customer_number,
      description: serviceJob.description,
      status: serviceJob.status,
      attachments: serviceJob.attachments || [],
      scheduled_at: serviceJob.scheduled_at,
    });
    setIsModalOpen(true);
  };

  const handleDeleteServiceJob = async (serviceJobId: string) => {
    if (window.confirm('Are you sure you want to delete this service job?')) {
      try {
        await dataProvider.deleteServiceJob(serviceJobId);
        await loadData();
      } catch (error) {
        console.error('Failed to delete service job:', error);
        alert('Failed to delete service job. Please try again.');
      }
    }
  };

  const handleStatusChange = async (serviceJobId: string, newStatus: ServiceJob['status']) => {
    try {
      const updates: Partial<ServiceJob> = { status: newStatus };
      if (newStatus === 'Completed') {
        updates.completed_at = new Date().toISOString();
      }
      await dataProvider.updateServiceJob(serviceJobId, updates);
      await loadData();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Filter out fields that shouldn't be sent to the database
      const { attachments, comments, ...dbData } = formData;
      
      let serviceJobId: string;
      
      if (editingServiceJob) {
        await dataProvider.updateServiceJob(editingServiceJob.id, dbData);
        serviceJobId = editingServiceJob.id;
      } else {
        const newServiceJob = await dataProvider.createServiceJob(dbData);
        serviceJobId = newServiceJob.id;
      }
      
      // Upload attachments if any
      if (attachments.length > 0) {
        for (const attachment of attachments) {
          if (attachment.file) {
            await dataProvider.uploadAttachment('service_job', serviceJobId, attachment.file);
          }
        }
      }
      
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to save service job:', error);
      alert('Failed to save service job. Please try again.');
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

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedServiceJobForComments) return;
    
    try {
      // First, add the comment without attachments
      const comment = await dataProvider.addServiceJobComment(selectedServiceJobForComments.id, {
        text: newComment,
        author: 'Admin'
      });
      
      // Then upload any attachments and link them to the comment
      for (const attachment of commentAttachments) {
        if (attachment.file) {
          await dataProvider.uploadAttachment('service_job_comment', comment.id, attachment.file);
        }
      }
      
      setNewComment('');
      setCommentAttachments([]);
      await loadData();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleCommentAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const fileData = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      file: file // Store the actual File object instead of blob URL
    }));
    setCommentAttachments([...commentAttachments, ...fileData]);
  };

  const removeCommentAttachment = (index: number) => {
    const newAttachments = commentAttachments.filter((_, i) => i !== index);
    setCommentAttachments(newAttachments);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const openCommentsModal = (serviceJob: ServiceJob) => {
    setSelectedServiceJobForComments(serviceJob);
    setIsCommentsModalOpen(true);
  };

  const statuses = ['All', 'New Complaint', 'Under Inspection', 'Sent to Service Centre', 'Received', 'Completed'];
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredServiceJobs = serviceJobs.filter((serviceJob) => {
    const matchesSearch = (serviceJob.modal_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (serviceJob.modal_registration_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (serviceJob.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (serviceJob.service_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || serviceJob.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Dashboard stats
  const dashboardStats = {
    'New Complaint': serviceJobs.filter(s => s.status === 'New Complaint').length,
    'Under Inspection': serviceJobs.filter(s => s.status === 'Under Inspection').length,
    'Sent to Service Centre': serviceJobs.filter(s => s.status === 'Sent to Service Centre').length,
    'Received': serviceJobs.filter(s => s.status === 'Received').length,
    'Completed': serviceJobs.filter(s => s.status === 'Completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Tracker</h1>
          <p className="mt-2 text-gray-600">
            Track vehicle service jobs and manage service products
          </p>
        </div>
        <button 
          onClick={handleAddServiceJob}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service Job
        </button>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        {Object.entries(dashboardStats).map(([status, count]) => (
          <div key={status} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {status === 'New Complaint' && <Car className="h-6 w-6 text-red-600" />}
                  {status === 'Under Inspection' && <Search className="h-6 w-6 text-yellow-600" />}
                  {status === 'Sent to Service Centre' && <Wrench className="h-6 w-6 text-blue-600" />}
                  {status === 'Received' && <Calendar className="h-6 w-6 text-purple-600" />}
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
            placeholder="Search service jobs..."
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

      {/* Active Service Jobs Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Active Service Jobs
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
                      VEHICLE DETAILS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CUSTOMER DETAILS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SERVICE DETAILS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SCHEDULED DATE
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
                  {filteredServiceJobs.map((serviceJob) => {
                    const scheduledDate = new Date(serviceJob.scheduled_at);
                    
                    return (
                      <tr key={serviceJob.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{serviceJob.modal_name}</div>
                            <div className="text-sm text-gray-500">{serviceJob.modal_registration_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{serviceJob.customer_name}</div>
                            <div className="text-sm text-gray-500">{serviceJob.customer_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">{serviceJob.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{scheduledDate.toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">{scheduledDate.toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {(serviceJob.attachments || []).length}
                            </span>
                            {(serviceJob.attachments || []).length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedServiceJob(serviceJob);
                                  setIsAttachmentModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View attachments"
                              >
                                <Paperclip className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {(serviceJob.comments || []).length}
                            </span>
                            <button
                              onClick={() => openCommentsModal(serviceJob)}
                              className="text-green-600 hover:text-green-900"
                              title="View comments"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                            {(serviceJob.comments || []).length === 0 && (
                              <span className="text-xs text-gray-400">No comments</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={serviceJob.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as ServiceJob['status'];
                              handleStatusChange(serviceJob.id, newStatus);
                            }}
                            className={`text-sm font-medium border-0 bg-transparent ${statusColors[serviceJob.status]} focus:outline-none rounded-full px-3 py-1`}
                          >
                            <option value="New Complaint">New Complaint</option>
                            <option value="Under Inspection">Under Inspection</option>
                            <option value="Sent to Service Centre">Sent to Service Centre</option>
                            <option value="Received">Received</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditServiceJob(serviceJob)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteServiceJob(serviceJob.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredServiceJobs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <Car className="h-12 w-12 text-gray-400" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">No service jobs found</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {searchTerm || selectedStatus !== 'All' 
                                ? 'Try adjusting your search or filter criteria'
                                : 'Get started by adding your first service job'
                              }
                            </p>
                          </div>
                          {!searchTerm && selectedStatus === 'All' && (
                            <button
                              onClick={handleAddServiceJob}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Service Job
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Service Job Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingServiceJob ? 'Edit Service Job' : 'Add New Service Job'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modal Name
              </label>
              <input
                type="text"
                required
                value={formData.modal_name}
                onChange={(e) => setFormData({ ...formData, modal_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter vehicle modal name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                required
                value={formData.modal_registration_number}
                onChange={(e) => setFormData({ ...formData, modal_registration_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter registration number"
              />
            </div>
          </div>

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
              placeholder="Enter service description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceJob['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="New Complaint">New Complaint</option>
                <option value="Under Inspection">Under Inspection</option>
                <option value="Sent to Service Centre">Sent to Service Centre</option>
                <option value="Received">Received</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date
              </label>
              <input
                type="datetime-local"
                required
                value={formData.scheduled_at ? new Date(formData.scheduled_at).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, scheduled_at: new Date(e.target.value).toISOString() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                      <span className="text-sm text-gray-700">{attachment.name || attachment}</span>
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
              {editingServiceJob ? 'Update Service Job' : 'Add Service Job'}
            </button>
          </div>
        </form>
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
              Vehicle: {selectedServiceJob?.modal_name} ({selectedServiceJob?.modal_registration_number})
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Customer: {selectedServiceJob?.customer_name}
            </p>
          </div>
          
          {(selectedServiceJob?.attachments || []).length > 0 ? (
            <div className="space-y-3">
              {selectedServiceJob.attachments.map((attachment, index) => (
                <div key={attachment.id || index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center">
                    {attachment.file_name?.toLowerCase().includes('.pdf') && <FileText className="h-5 w-5 text-red-500 mr-3" />}
                    {['.jpg', '.jpeg', '.png', '.gif'].some(ext => attachment.file_name?.toLowerCase().includes(ext)) && <Image className="h-5 w-5 text-green-500 mr-3" />}
                    {['.mp4', '.avi', '.mov'].some(ext => attachment.file_name?.toLowerCase().includes(ext)) && <Video className="h-5 w-5 text-blue-500 mr-3" />}
                    <div>
                      <span className="text-sm font-medium text-gray-900">{attachment.file_name}</span>
                      <p className="text-xs text-gray-500">
                        {(attachment.file_size / 1024).toFixed(1)} KB • {attachment.file_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {attachment.signed_url ? (
                      <a
                        href={attachment.signed_url}
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
                    {attachment.signed_url && (
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = attachment.signed_url;
                          link.download = attachment.file_name;
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

      {/* Comments Modal */}
      <Modal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        title="Comments & Attachments"
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Vehicle: {selectedServiceJobForComments?.modal_name} ({selectedServiceJobForComments?.modal_registration_number})
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Customer: {selectedServiceJobForComments?.customer_name}
            </p>
          </div>
          
          {/* Existing Comments */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {(selectedServiceJobForComments?.comments || []).map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{comment.text}</p>
                
                {/* Comment Attachments */}
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600">Attachments:</p>
                    <div className="space-y-1">
                      {comment.attachments.map((attachment, index) => (
                        <div key={attachment.id || index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex items-center">
                            {attachment.file_name?.toLowerCase().includes('.pdf') && <FileText className="h-4 w-4 text-red-500 mr-2" />}
                            {['.jpg', '.jpeg', '.png', '.gif'].some(ext => attachment.file_name?.toLowerCase().includes(ext)) && <Image className="h-4 w-4 text-green-500 mr-2" />}
                            {['.mp4', '.avi', '.mov'].some(ext => attachment.file_name?.toLowerCase().includes(ext)) && <Video className="h-4 w-4 text-blue-500 mr-2" />}
                            <span className="text-xs text-gray-700">{attachment.file_name}</span>
                            <span className="text-xs text-gray-500 ml-2">({Math.round(attachment.file_size / 1024)}KB)</span>
                          </div>
                          <div className="flex space-x-2">
                            {attachment.signed_url && (
                              <button
                                onClick={() => window.open(attachment.signed_url, '_blank')}
                                className="text-blue-600 hover:text-blue-900 text-xs"
                              >
                                View
                              </button>
                            )}
                            {attachment.signed_url && (
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = attachment.signed_url;
                                  link.download = attachment.file_name;
                                  link.click();
                                }}
                                className="text-green-600 hover:text-green-900 text-xs"
                              >
                                Download
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {(selectedServiceJobForComments?.comments || []).length === 0 && (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            )}
          </div>
          
          {/* Add New Comment */}
          <div className="border-t pt-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Comment
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your comment..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Files (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,video/*"
                  onChange={handleCommentAttachmentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {commentAttachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {commentAttachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <div className="flex items-center">
                          {attachment.name?.toLowerCase().includes('.pdf') && <FileText className="h-4 w-4 text-red-500 mr-2" />}
                          {['.jpg', '.jpeg', '.png', '.gif'].some(ext => attachment.name?.toLowerCase().includes(ext)) && <Image className="h-4 w-4 text-green-500 mr-2" />}
                          {['.mp4', '.avi', '.mov'].some(ext => attachment.name?.toLowerCase().includes(ext)) && <Video className="h-4 w-4 text-blue-500 mr-2" />}
                          <span className="text-sm text-gray-700">{attachment.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCommentAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCommentsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}