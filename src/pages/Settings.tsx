import { useState } from 'react';
import { User, Clock } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Business Information
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Business Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Business Information
            </h3>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  RS Car Accessories
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Business Hours
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>11 am–7 pm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="text-red-600">Closed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monday</span>
                      <span>11 am–7 pm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tuesday</span>
                      <span>11 am–7 pm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wednesday</span>
                      <span>11 am–7 pm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thursday</span>
                      <span>11 am–7 pm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Friday</span>
                      <span>11 am–7 pm</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  081491 11110
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  510, Western Palace, opposite Park, Congress Nagar, Nagpur, Maharashtra 440012
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


