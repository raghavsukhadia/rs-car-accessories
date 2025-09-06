// Data types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  notes: string;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallFollowUp {
  id: string;
  caller_name: string;
  caller_number: string;
  person_to_contact: string;
  operator: string;
  priority: 'Low' | 'Medium' | 'High';
  notes: string;
  status: 'Active Calls' | 'Pending' | 'Followed up' | 'Not Received' | 'Completed';
  assigned_to: string;
  timestamp: string;
  response_time?: string;
  call_outcome?: string;
  time_to_respond?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadCall {
  id: string;
  lead_id: string;
  notes: string;
  outcome: string;
  created_at: string;
}

export interface ServiceJob {
  id: string;
  modal_name: string;
  modal_registration_number: string;
  customer_name: string;
  customer_number: string;
  description: string;
  status: 'New Complaint' | 'Under Inspection' | 'Sent to Service Centre' | 'Received' | 'Completed';
  attachments: Array<{
    name: string;
    type: string;
    size: number;
    data?: string; // blob URL for viewing
  }>;
  comments: Array<{
    id: string;
    text: string;
    author: string;
    timestamp: string;
    attachments?: Array<{
      name: string;
      type: string;
      size: number;
      data?: string;
    }>;
  }>;
  scheduled_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Requirement {
  id: string;
  customer_name: string;
  customer_number: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Ordered' | 'Procedure' | 'Contacted Customer' | 'Completed';
  attachments: Array<{
    name: string;
    type: string;
    size: number;
    data?: string; // blob URL for viewing
  }>;
  comments: string[];
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  customer_id: string;
  total_amount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  valid_until: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Installer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  service_job_id: string | null;
  amount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: 'Cash' | 'Card' | 'Check' | 'Bank Transfer';
  reference: string;
  created_at: string;
}

// DataProvider interface
export interface DataProvider {
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | null>;
  createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead>;
  deleteLead(id: string): Promise<void>;

  // Call Follow Ups
  getCallFollowUps(): Promise<CallFollowUp[]>;
  getCallFollowUp(id: string): Promise<CallFollowUp | null>;
  createCallFollowUp(call: Omit<CallFollowUp, 'id' | 'created_at' | 'updated_at'>): Promise<CallFollowUp>;
  updateCallFollowUp(id: string, updates: Partial<CallFollowUp>): Promise<CallFollowUp>;
  deleteCallFollowUp(id: string): Promise<void>;

  // Lead Calls
  getLeadCalls(leadId: string): Promise<LeadCall[]>;
  createLeadCall(call: Omit<LeadCall, 'id' | 'created_at'>): Promise<LeadCall>;

  // Service Jobs
  getServiceJobs(): Promise<ServiceJob[]>;
  getServiceJob(id: string): Promise<ServiceJob | null>;
  createServiceJob(job: Omit<ServiceJob, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceJob>;
  updateServiceJob(id: string, updates: Partial<ServiceJob>): Promise<ServiceJob>;
  deleteServiceJob(id: string): Promise<void>;
  
  // Service Job Comments
  addServiceJobComment(serviceJobId: string, comment: Omit<ServiceJob['comments'][0], 'id' | 'timestamp'>): Promise<ServiceJob>;
  updateServiceJobComment(serviceJobId: string, commentId: string, updates: Partial<ServiceJob['comments'][0]>): Promise<ServiceJob>;
  deleteServiceJobComment(serviceJobId: string, commentId: string): Promise<ServiceJob>;

  // Requirements
  getRequirements(): Promise<Requirement[]>;
  getRequirement(id: string): Promise<Requirement | null>;
  createRequirement(requirement: Omit<Requirement, 'id' | 'created_at' | 'updated_at'>): Promise<Requirement>;
  updateRequirement(id: string, updates: Partial<Requirement>): Promise<Requirement>;
  deleteRequirement(id: string): Promise<void>;

  // Quotes
  getQuotes(): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | null>;
  createQuote(quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>): Promise<Quote>;
  updateQuote(id: string, updates: Partial<Quote>): Promise<Quote>;
  deleteQuote(id: string): Promise<void>;

  // Quote Items
  getQuoteItems(quoteId: string): Promise<QuoteItem[]>;
  createQuoteItem(item: Omit<QuoteItem, 'id'>): Promise<QuoteItem>;
  updateQuoteItem(id: string, updates: Partial<QuoteItem>): Promise<QuoteItem>;
  deleteQuoteItem(id: string): Promise<void>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  // Installers
  getInstallers(): Promise<Installer[]>;
  getInstaller(id: string): Promise<Installer | null>;
  createInstaller(installer: Omit<Installer, 'id' | 'created_at' | 'updated_at'>): Promise<Installer>;
  updateInstaller(id: string, updates: Partial<Installer>): Promise<Installer>;
  deleteInstaller(id: string): Promise<void>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | null>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice>;
  updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;

  // Payments
  getPayments(invoiceId: string): Promise<Payment[]>;
  createPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment>;
}
