import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Clock, AlertCircle, CheckCircle, XCircle, Play } from 'lucide-react';
import { dataProvider, CallFollowUp } from '../lib/data';
import Modal from '../components/Modal';

const statusColors = {
  'Active Calls': 'bg-red-100 text-red-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Followed up': 'bg-blue-100 text-blue-800',
  'Not Received': 'bg-gray-100 text-gray-800',
  'Completed': 'bg-green-100 text-green-800',
};

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-red-100 text-red-800',
};

export default function CallFollowUpPage() {
  const [calls, setCalls] = useState<CallFollowUp[]>([]);
  // const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<CallFollowUp | null>(null);
  const [formData, setFormData] = useState({
    caller_name: '',
    caller_number: '',
    person_to_contact: '',
    operator: '',
    priority: 'Medium' as CallFollowUp['priority'],
    notes: '',
    status: 'Active Calls' as CallFollowUp['status'],
    assigned_to: '',
    timestamp: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [callsData] = await Promise.all([
        dataProvider.getCallFollowUps(),
        // dataProvider.getCustomers(),
      ]);
      setCalls(callsData);
      // setCustomers(customersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // const getCustomerDetails = (personToContact: string) => {
  //   return customers.find(customer => 
  //     customer.name.toLowerCase().includes(personToContact.toLowerCase()) ||
  //     personToContact.toLowerCase().includes(customer.name.toLowerCase())
  //   );
  // };

  const calculateResponseTime = (timestamp: string, statusChangeTime?: string) => {
    const startTime = new Date(timestamp);
    const endTime = statusChangeTime ? new Date(statusChangeTime) : new Date();
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  const handleStatusChange = async (callId: string, newStatus: CallFollowUp['status']) => {
    try {
      const statusChangeTime = new Date().toISOString();
      const responseTime = calculateResponseTime(
        calls.find(c => c.id === callId)?.timestamp || '',
        statusChangeTime
      );
      
      await dataProvider.updateCallFollowUp(callId, { 
        status: newStatus,
        response_time: responseTime,
        updated_at: statusChangeTime
      });
      await loadData();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleAddCall = () => {
    setEditingCall(null);
    setFormData({
      caller_name: '',
      caller_number: '',
      person_to_contact: '',
      operator: '',
      priority: 'Medium',
      notes: '',
      status: 'Active Calls',
      assigned_to: '',
      timestamp: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleEditCall = (call: CallFollowUp) => {
    setEditingCall(call);
    setFormData({
      caller_name: call.caller_name,
      caller_number: call.caller_number,
      person_to_contact: call.person_to_contact,
      operator: call.operator,
      priority: call.priority,
      notes: call.notes,
      status: call.status,
      assigned_to: call.assigned_to,
      timestamp: call.timestamp,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCall = async (callId: string) => {
    if (window.confirm('Are you sure you want to delete this call follow-up?')) {
      try {
        await dataProvider.deleteCallFollowUp(callId);
        await loadData();
      } catch (error) {
        console.error('Failed to delete call follow-up:', error);
        alert('Failed to delete call follow-up. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCall) {
        await dataProvider.updateCallFollowUp(editingCall.id, formData);
      } else {
        await dataProvider.createCallFollowUp(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to save call follow-up:', error);
      alert('Failed to save call follow-up. Please try again.');
    }
  };

  const statuses = ['All', 'Active Calls', 'Pending', 'Followed up', 'Not Received', 'Completed'];

  const filteredCalls = calls.filter((call) => {
    const matchesSearch = call.caller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.caller_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.person_to_contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || call.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Dashboard stats
  const dashboardStats = {
    'Active Calls': calls.filter(c => c.status === 'Active Calls').length,
    'Pending': calls.filter(c => c.status === 'Pending').length,
    'Followed up': calls.filter(c => c.status === 'Followed up').length,
    'Not Received': calls.filter(c => c.status === 'Not Received').length,
    'Completed': calls.filter(c => c.status === 'Completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Call Follow Up</h1>
          <p className="mt-2 text-gray-600">
            Track and manage customer follow-up calls
          </p>
        </div>
        <button 
          onClick={handleAddCall}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Call Follow Up
        </button>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        {Object.entries(dashboardStats).map(([status, count]) => (
          <div key={status} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {status === 'Active Calls' && <AlertCircle className="h-6 w-6 text-red-600" />}
                  {status === 'Pending' && <Clock className="h-6 w-6 text-yellow-600" />}
                  {status === 'Followed up' && <Play className="h-6 w-6 text-blue-600" />}
                  {status === 'Not Received' && <XCircle className="h-6 w-6 text-gray-600" />}
                  {status === 'Completed' && <CheckCircle className="h-6 w-6 text-green-600" />}
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
            placeholder="Search calls..."
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

      {/* Call Outcome Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Call Outcome
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
                      CALLER DETAILS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ASSIGNED TO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRIORITY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TIMESTAMP CALL ADDED
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RESPONSE TIME TIME TO RESPOND
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NOTE
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
                  {filteredCalls.map((call) => {
                    const callDate = new Date(call.timestamp);
                    const responseTimeDisplay = call.response_time || calculateResponseTime(call.timestamp);
                    
                    return (
                      <tr key={call.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{call.caller_name}</div>
                            <div className="text-sm text-gray-500">{call.caller_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{call.assigned_to}</div>
                            <div className="text-sm text-gray-500">via {call.operator}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[call.priority]}`}>
                            {call.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{callDate.toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">{callDate.toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm ${call.response_time ? 'text-green-600' : 'text-gray-500'}`}>
                            {responseTimeDisplay}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {call.notes}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={call.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as CallFollowUp['status'];
                              handleStatusChange(call.id, newStatus);
                            }}
                            className={`text-sm font-medium border-0 bg-transparent ${statusColors[call.status]} focus:outline-none`}
                          >
                            <option value="Active Calls">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Followed up">Followed up</option>
                            <option value="Not Received">Not Received</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditCall(call)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCall(call.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCalls.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No call follow-ups found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Call Follow Up Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCall ? 'Edit Call Follow Up' : 'Add New Call Follow Up'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caller Name
              </label>
              <input
                type="text"
                required
                value={formData.caller_name}
                onChange={(e) => setFormData({ ...formData, caller_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter caller name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caller Number
              </label>
              <input
                type="tel"
                required
                value={formData.caller_number}
                onChange={(e) => setFormData({ ...formData, caller_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Person to Contact
            </label>
            <input
              type="text"
              required
              value={formData.person_to_contact}
              onChange={(e) => setFormData({ ...formData, person_to_contact: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter person to contact"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator
              </label>
              <input
                type="text"
                required
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter operator name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as CallFollowUp['priority'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <input
              type="text"
              required
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter assigned person"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CallFollowUp['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Active Calls">Active Calls</option>
              <option value="Pending">Pending</option>
              <option value="Followed up">Followed up</option>
              <option value="Not Received">Not Received</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              required
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter notes"
            />
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
              {editingCall ? 'Update Call Follow Up' : 'Add Call Follow Up'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}