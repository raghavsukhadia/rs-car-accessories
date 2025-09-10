import { useState, useEffect } from 'react';
import { BarChart3, Users, Phone, Calendar, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { dataProvider, CallFollowUp, ServiceJob, Requirement } from '../lib/data';
import AuthDebug from '../components/AuthDebug';

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    leads: 0,
    revenue: 0,
    serviceJobs: 0,
  });
  const [analytics, setAnalytics] = useState({
    highPriorityCalls: [] as CallFollowUp[],
    upcomingServices: [] as ServiceJob[],
    highPriorityRequirements: [] as Requirement[],
    recentActivity: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [customers, leads, invoices, serviceJobs, callFollowUps, requirements] = await Promise.all([
          dataProvider.getCustomers(),
          dataProvider.getLeads(),
          dataProvider.getInvoices(),
          dataProvider.getServiceJobs(),
          dataProvider.getCallFollowUps(),
          dataProvider.getRequirements(),
        ]);

        const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        const completedJobs = serviceJobs.filter(job => job.status === 'Completed').length;

        // Filter high priority calls (High priority and Active/Pending status)
        const highPriorityCalls = callFollowUps.filter(call => 
          call.priority === 'High' && 
          (call.status === 'Active Calls' || call.status === 'Pending')
        );

        // Filter upcoming services (next 7 days)
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcomingServices = serviceJobs.filter(job => {
          const scheduledDate = new Date(job.scheduled_at);
          return scheduledDate >= now && scheduledDate <= nextWeek && job.status !== 'Completed';
        }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

        // Filter high priority requirements
        const highPriorityRequirements = requirements.filter(req => 
          req.priority === 'High' && req.status !== 'Completed'
        );

        // Create recent activity
        const recentActivity = [
          ...highPriorityCalls.map(call => ({
            type: 'call',
            title: `High Priority Call: ${call.caller_name}`,
            description: call.notes,
            timestamp: call.timestamp,
            priority: call.priority,
          })),
          ...upcomingServices.slice(0, 3).map(service => ({
            type: 'service',
            title: `Upcoming Service: ${service.modal_name}`,
            description: service.description,
            timestamp: service.scheduled_at,
            priority: 'Medium',
          })),
          ...highPriorityRequirements.slice(0, 2).map(req => ({
            type: 'requirement',
            title: `High Priority Requirement: ${req.customer_name}`,
            description: req.description,
            timestamp: req.created_at,
            priority: req.priority,
          })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

        setStats({
          customers: customers.length,
          leads: leads.length,
          revenue: totalRevenue,
          serviceJobs: completedJobs,
        });

        setAnalytics({
          highPriorityCalls,
          upcomingServices,
          highPriorityRequirements,
          recentActivity,
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statsData = [
    {
      name: 'Total Customers',
      value: stats.customers.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Services Completed',
      value: stats.serviceJobs.toString(),
      change: '+3%',
      changeType: 'positive',
      icon: BarChart3,
    },
    {
      name: 'High Priority Calls',
      value: analytics.highPriorityCalls.length.toString(),
      change: analytics.highPriorityCalls.length > 0 ? 'Urgent' : 'All Clear',
      changeType: analytics.highPriorityCalls.length > 0 ? 'negative' : 'positive',
      icon: Phone,
    },
    {
      name: 'Upcoming Services',
      value: analytics.upcomingServices.length.toString(),
      change: 'Next 7 days',
      changeType: 'neutral',
      icon: Calendar,
    },
    {
      name: 'High Priority Requirements',
      value: analytics.highPriorityRequirements.length.toString(),
      change: analytics.highPriorityRequirements.length > 0 ? 'Action Needed' : 'All Clear',
      changeType: analytics.highPriorityRequirements.length > 0 ? 'negative' : 'positive',
      icon: AlertTriangle,
    },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to RS Car Accessories Management System
        </p>
      </div>

      {/* Auth Debug Component */}
      <AuthDebug />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          statsData.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-6 w-6 ${
                    stat.changeType === 'negative' ? 'text-red-500' : 
                    stat.changeType === 'positive' ? 'text-green-500' : 
                    'text-blue-500'
                  }`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'negative' ? 'text-red-600' : 
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        'text-blue-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Analytics Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* High Priority Calls */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Phone className="h-5 w-5 text-red-500 mr-2" />
                High Priority Calls
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {analytics.highPriorityCalls.length} urgent
              </span>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ) : analytics.highPriorityCalls.length > 0 ? (
                analytics.highPriorityCalls.slice(0, 3).map((call) => (
                  <div key={call.id} className="border-l-4 border-red-500 bg-red-50 p-3 rounded-r-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{call.caller_name}</p>
                        <p className="text-xs text-gray-600">{call.caller_number}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{call.notes}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {call.priority}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(call.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No high priority calls</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Services */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                Upcoming Services
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Next 7 days
              </span>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ) : analytics.upcomingServices.length > 0 ? (
                analytics.upcomingServices.slice(0, 3).map((service) => (
                  <div key={service.id} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{service.modal_name}</p>
                        <p className="text-xs text-gray-600">{service.customer_name}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {service.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(service.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No upcoming services</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* High Priority Requirements */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                High Priority Requirements
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {analytics.highPriorityRequirements.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ) : analytics.highPriorityRequirements.length > 0 ? (
                analytics.highPriorityRequirements.slice(0, 3).map((requirement) => (
                  <div key={requirement.id} className="border-l-4 border-orange-500 bg-orange-50 p-3 rounded-r-md">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{requirement.customer_name}</p>
                        <p className="text-xs text-gray-600">{requirement.customer_number}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{requirement.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {requirement.priority}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(requirement.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No high priority requirements</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            Recent Activity
          </h3>
          <div className="mt-5">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {analytics.recentActivity.map((activity, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.type === 'call' ? 'bg-red-500' :
                              activity.type === 'service' ? 'bg-blue-500' :
                              'bg-orange-500'
                            }`}>
                              {activity.type === 'call' && <Phone className="h-4 w-4 text-white" />}
                              {activity.type === 'service' && <Calendar className="h-4 w-4 text-white" />}
                              {activity.type === 'requirement' && <AlertTriangle className="h-4 w-4 text-white" />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                              <p className="text-sm text-gray-500">{activity.description}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time>{new Date(activity.timestamp).toLocaleDateString()}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                  {analytics.recentActivity.length === 0 && (
                    <li>
                      <div className="text-center py-4">
                        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No recent activity</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


