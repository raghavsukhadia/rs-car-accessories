import { dataProvider } from './index';

export async function seed() {
  // Check if data already exists
  const existingCustomers = await dataProvider.getCustomers();
  if (existingCustomers.length > 0) {
    console.log('Data already exists, skipping seed');
    return;
  }

  console.log('Seeding initial data...');

  // Create customers
  const customer1 = await dataProvider.createCustomer({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
  });

  const customer2 = await dataProvider.createCustomer({
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 987-6543',
    address: '456 Oak Ave, City, State 12345',
  });

  // Create a lead with follow-up today
  const today = new Date().toISOString();
  await dataProvider.createLead({
    name: 'Alice Brown',
    email: 'alice@example.com',
    phone: '+1 (555) 111-2222',
    source: 'Website',
    status: 'New',
    notes: 'Interested in car detailing service',
    next_follow_up_at: today,
  });

  // Create call follow-ups
  await dataProvider.createCallFollowUp({
    caller_name: 'Sarah Wilson',
    caller_number: '+1 (555) 111-2222',
    person_to_contact: 'John Doe',
    operator: 'Alice Johnson',
    priority: 'High',
    notes: 'Customer called about urgent brake repair',
    status: 'Active Calls',
    assigned_to: 'Mike Smith',
    timestamp: new Date().toISOString(),
    response_time: '5 minutes',
    call_outcome: 'Customer needs immediate service',
    time_to_respond: '2 hours',
  });

  await dataProvider.createCallFollowUp({
    caller_name: 'Robert Brown',
    caller_number: '+1 (555) 333-4444',
    person_to_contact: 'Jane Smith',
    operator: 'Bob Wilson',
    priority: 'Medium',
    notes: 'Inquiry about car maintenance package',
    status: 'Pending',
    assigned_to: 'Sarah Davis',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  });

  await dataProvider.createCallFollowUp({
    caller_name: 'Lisa Garcia',
    caller_number: '+1 (555) 555-6666',
    person_to_contact: 'Mike Johnson',
    operator: 'Alice Johnson',
    priority: 'Low',
    notes: 'Follow-up call for service satisfaction',
    status: 'Followed up',
    assigned_to: 'Tom Wilson',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    response_time: '10 minutes',
    call_outcome: 'Customer satisfied with service',
    time_to_respond: '1 hour',
  });

  // Create a service job scheduled today
  const serviceJob1 = await dataProvider.createServiceJob({
    modal_name: 'Honda Civic',
    modal_registration_number: 'ABC-1234',
    customer_name: 'John Doe',
    customer_number: '+1 (555) 123-4567',
    description: 'Customer reported squeaking noise from front brakes',
    status: 'New Complaint',
    attachments: [
      { name: 'brake_noise_video.mp4', type: 'video/mp4', size: 2048000 },
      { name: 'brake_pads.jpg', type: 'image/jpeg', size: 1024000 }
    ],
    comments: [],
    scheduled_at: today,
  });

  // Add comments to the service job
  await dataProvider.addServiceJobComment(serviceJob1.id, {
    text: 'Customer reported squeaking noise when braking',
    author: 'Service Advisor',
    attachments: [
      { name: 'brake_noise_video.mp4', type: 'video/mp4', size: 2048000 }
    ]
  });

  await dataProvider.addServiceJobComment(serviceJob1.id, {
    text: 'Initial inspection completed - brake pads need replacement',
    author: 'Technician',
    attachments: [
      { name: 'brake_pads.jpg', type: 'image/jpeg', size: 1024000 }
    ]
  });

  const serviceJob2 = await dataProvider.createServiceJob({
    modal_name: 'Toyota Camry',
    modal_registration_number: 'XYZ-5678',
    customer_name: 'Jane Smith',
    customer_number: '+1 (555) 987-6543',
    description: 'Regular maintenance oil change service',
    status: 'Under Inspection',
    attachments: [
      { name: 'engine_check.pdf', type: 'application/pdf', size: 512000 }
    ],
    comments: [],
    scheduled_at: today,
  });

  // Add comments to the service job
  await dataProvider.addServiceJobComment(serviceJob2.id, {
    text: 'Regular customer - prefers synthetic oil',
    author: 'Service Advisor'
  });

  const serviceJob3 = await dataProvider.createServiceJob({
    modal_name: 'Ford Focus',
    modal_registration_number: 'DEF-9012',
    customer_name: 'Mike Johnson',
    customer_number: '+1 (555) 456-7890',
    description: 'Transmission slipping and rough shifting',
    status: 'Completed',
    attachments: [
      { name: 'transmission_diagnosis.pdf', type: 'application/pdf', size: 768000 },
      { name: 'before_repair.jpg', type: 'image/jpeg', size: 1536000 },
      { name: 'after_repair.jpg', type: 'image/jpeg', size: 1280000 }
    ],
    comments: [],
    scheduled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Add comments to the completed service job
  await dataProvider.addServiceJobComment(serviceJob3.id, {
    text: 'Transmission fluid analysis completed - needs replacement',
    author: 'Technician',
    attachments: [
      { name: 'transmission_diagnosis.pdf', type: 'application/pdf', size: 768000 }
    ]
  });

  await dataProvider.addServiceJobComment(serviceJob3.id, {
    text: 'Repair completed successfully - customer satisfied',
    author: 'Service Manager',
    attachments: [
      { name: 'before_repair.jpg', type: 'image/jpeg', size: 1536000 },
      { name: 'after_repair.jpg', type: 'image/jpeg', size: 1280000 }
    ]
  });

  // Create products
  const product1 = await dataProvider.createProduct({
    name: 'Premium Oil Filter',
    description: 'High-quality oil filter for better engine protection',
    price: 15,
    category: 'Maintenance',
  });

  const product2 = await dataProvider.createProduct({
    name: 'Synthetic Oil 5W-30',
    description: 'Premium synthetic motor oil',
    price: 30,
    category: 'Maintenance',
  });

  // Create a quote with items
  const quote = await dataProvider.createQuote({
    customer_id: customer2.id,
    total_amount: 60,
    status: 'Sent',
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  });

  await dataProvider.createQuoteItem({
    quote_id: quote.id,
    product_id: product1.id,
    quantity: 1,
    unit_price: 15,
    total_price: 15,
  });

  await dataProvider.createQuoteItem({
    quote_id: quote.id,
    product_id: product2.id,
    quantity: 1,
    unit_price: 30,
    total_price: 30,
  });

  // Create an unpaid invoice
  await dataProvider.createInvoice({
    customer_id: customer1.id,
    service_job_id: null,
    amount: 150,
    status: 'Sent',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  });

  // Create an installer
  await dataProvider.createInstaller({
    name: 'Mike Johnson',
    email: 'mike@rscaraccessories.com',
    phone: '+1 (555) 333-4444',
    specialties: ['Oil Changes', 'Brake Service', 'General Maintenance'],
  });

  // Create requirements
  await dataProvider.createRequirement({
    customer_name: 'John Doe',
    customer_number: '+1 (555) 123-4567',
    description: 'Need brake pad replacement for Honda Civic',
    priority: 'High',
    status: 'Pending',
    attachments: [
      { name: 'brake_pads.jpg', type: 'image/jpeg', size: 1024000 },
      { name: 'invoice.pdf', type: 'application/pdf', size: 512000 }
    ],
    comments: [
      { id: '1', text: 'Customer mentioned squeaking noise', author: 'Admin', timestamp: new Date().toISOString() },
      { id: '2', text: 'Needs urgent attention', author: 'Admin', timestamp: new Date().toISOString() }
    ],
  });

  await dataProvider.createRequirement({
    customer_name: 'Jane Smith',
    customer_number: '+1 (555) 987-6543',
    description: 'Oil change service required',
    priority: 'Medium',
    status: 'In Progress',
    attachments: [
      { name: 'oil_change_video.mp4', type: 'video/mp4', size: 2048000 }
    ],
    comments: [
      { id: '3', text: 'Regular customer', author: 'Admin', timestamp: new Date().toISOString() },
      { id: '4', text: 'Prefers synthetic oil', author: 'Admin', timestamp: new Date().toISOString() }
    ],
  });

  await dataProvider.createRequirement({
    customer_name: 'Mike Johnson',
    customer_number: '+1 (555) 456-7890',
    description: 'Car detailing and interior cleaning',
    priority: 'Low',
    status: 'Completed',
    attachments: [
      { name: 'before_photos.jpg', type: 'image/jpeg', size: 1536000 },
      { name: 'after_photos.jpg', type: 'image/jpeg', size: 1280000 }
    ],
    comments: [
      { id: '5', text: 'Excellent service', author: 'Admin', timestamp: new Date().toISOString() },
      { id: '6', text: 'Will recommend to friends', author: 'Admin', timestamp: new Date().toISOString() }
    ],
  });

  console.log('Seed data created successfully');
}
