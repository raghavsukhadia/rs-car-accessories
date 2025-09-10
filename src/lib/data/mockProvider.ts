import {
  DataProvider,
  Customer,
  Lead,
  CallFollowUp,
  LeadCall,
  ServiceJob,
  Requirement,
  Quote,
  QuoteItem,
  Product,
  Installer,
  Invoice,
  Payment,
} from './provider';

class MockProvider implements DataProvider {
  private getStorageKey(entity: string): string {
    return `rs-car-accessories-${entity}`;
  }

  private async getFromStorage<T>(entity: string): Promise<T[]> {
    const key = this.getStorageKey(entity);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private async saveToStorage<T>(entity: string, data: T[]): Promise<void> {
    const key = this.getStorageKey(entity);
    localStorage.setItem(key, JSON.stringify(data));
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.getFromStorage<Customer>('customers');
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const customers = await this.getCustomers();
    return customers.find(c => c.id === id) || null;
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const customers = await this.getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    customers.push(newCustomer);
    await this.saveToStorage('customers', customers);
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const customers = await this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    
    customers[index] = {
      ...customers[index],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    await this.saveToStorage('customers', customers);
    return customers[index];
  }

  async deleteCustomer(id: string): Promise<void> {
    const customers = await this.getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    await this.saveToStorage('customers', filtered);
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return this.getFromStorage<Lead>('leads');
  }

  async getLead(id: string): Promise<Lead | null> {
    const leads = await this.getLeads();
    return leads.find(l => l.id === id) || null;
  }

  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const leads = await this.getLeads();
    const newLead: Lead = {
      ...lead,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    leads.push(newLead);
    await this.saveToStorage('leads', leads);
    return newLead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const leads = await this.getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');
    
    leads[index] = {
      ...leads[index],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    await this.saveToStorage('leads', leads);
    return leads[index];
  }

  async deleteLead(id: string): Promise<void> {
    const leads = await this.getLeads();
    const filtered = leads.filter(l => l.id !== id);
    await this.saveToStorage('leads', filtered);
  }

  // Call Follow Ups
  async getCallFollowUps(): Promise<CallFollowUp[]> {
    return this.getFromStorage<CallFollowUp>('callFollowUps');
  }

  async getCallFollowUp(id: string): Promise<CallFollowUp | null> {
    const calls = await this.getCallFollowUps();
    return calls.find(c => c.id === id) || null;
  }

  async createCallFollowUp(call: Omit<CallFollowUp, 'id' | 'created_at' | 'updated_at'>): Promise<CallFollowUp> {
    const calls = await this.getCallFollowUps();
    const newCall: CallFollowUp = {
      ...call,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    calls.push(newCall);
    await this.saveToStorage('callFollowUps', calls);
    return newCall;
  }

  async updateCallFollowUp(id: string, updates: Partial<CallFollowUp>): Promise<CallFollowUp> {
    const calls = await this.getCallFollowUps();
    const index = calls.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Call follow up not found');
    }
    calls[index] = {
      ...calls[index],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    await this.saveToStorage('callFollowUps', calls);
    return calls[index];
  }

  async deleteCallFollowUp(id: string): Promise<void> {
    const calls = await this.getCallFollowUps();
    const filtered = calls.filter(c => c.id !== id);
    await this.saveToStorage('callFollowUps', filtered);
  }

  // Lead Calls
  async getLeadCalls(leadId: string): Promise<LeadCall[]> {
    const calls = await this.getFromStorage<LeadCall>('leadCalls');
    return calls.filter(c => c.lead_id === leadId);
  }

  async createLeadCall(call: Omit<LeadCall, 'id' | 'created_at'>): Promise<LeadCall> {
    const calls = await this.getFromStorage<LeadCall>('leadCalls');
    const newCall: LeadCall = {
      ...call,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
    };
    calls.push(newCall);
    await this.saveToStorage('leadCalls', calls);
    return newCall;
  }

  // Service Jobs
  async getServiceJobs(): Promise<ServiceJob[]> {
    return this.getFromStorage<ServiceJob>('serviceJobs');
  }

  async getServiceJob(id: string): Promise<ServiceJob | null> {
    const jobs = await this.getServiceJobs();
    return jobs.find(j => j.id === id) || null;
  }

  async createServiceJob(job: Omit<ServiceJob, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceJob> {
    const jobs = await this.getServiceJobs();
    const newJob: ServiceJob = {
      ...job,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    jobs.push(newJob);
    await this.saveToStorage('serviceJobs', jobs);
    return newJob;
  }

  async updateServiceJob(id: string, updates: Partial<ServiceJob>): Promise<ServiceJob> {
    const jobs = await this.getServiceJobs();
    const index = jobs.findIndex(j => j.id === id);
    if (index === -1) throw new Error('Service job not found');
    
    jobs[index] = {
      ...jobs[index],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    await this.saveToStorage('serviceJobs', jobs);
    return jobs[index];
  }

  async deleteServiceJob(id: string): Promise<void> {
    const jobs = await this.getServiceJobs();
    const filtered = jobs.filter(j => j.id !== id);
    await this.saveToStorage('serviceJobs', filtered);
  }

  // Service Job Comments
  async addServiceJobComment(serviceJobId: string, comment: Omit<ServiceJob['comments'][0], 'id' | 'timestamp'>): Promise<ServiceJob> {
    const jobs = await this.getServiceJobs();
    const index = jobs.findIndex(j => j.id === serviceJobId);
    if (index === -1) throw new Error('Service job not found');
    
    const newComment: ServiceJob['comments'][0] = {
      ...comment,
      id: this.generateId(),
      timestamp: this.getCurrentTimestamp(),
    };
    
    jobs[index].comments = [...(jobs[index].comments || []), newComment];
    jobs[index].updated_at = this.getCurrentTimestamp();
    
    await this.saveToStorage('serviceJobs', jobs);
    return jobs[index];
  }

  async updateServiceJobComment(serviceJobId: string, commentId: string, updates: Partial<ServiceJob['comments'][0]>): Promise<ServiceJob> {
    const jobs = await this.getServiceJobs();
    const jobIndex = jobs.findIndex(j => j.id === serviceJobId);
    if (jobIndex === -1) throw new Error('Service job not found');
    
    const commentIndex = jobs[jobIndex].comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) throw new Error('Comment not found');
    
    jobs[jobIndex].comments[commentIndex] = {
      ...jobs[jobIndex].comments[commentIndex],
      ...updates,
    };
    jobs[jobIndex].updated_at = this.getCurrentTimestamp();
    
    await this.saveToStorage('serviceJobs', jobs);
    return jobs[jobIndex];
  }

  async deleteServiceJobComment(serviceJobId: string, commentId: string): Promise<ServiceJob> {
    const jobs = await this.getServiceJobs();
    const jobIndex = jobs.findIndex(j => j.id === serviceJobId);
    if (jobIndex === -1) throw new Error('Service job not found');
    
    jobs[jobIndex].comments = jobs[jobIndex].comments.filter(c => c.id !== commentId);
    jobs[jobIndex].updated_at = this.getCurrentTimestamp();
    
    await this.saveToStorage('serviceJobs', jobs);
    return jobs[jobIndex];
  }

  // Requirements
  async getRequirements(): Promise<Requirement[]> {
    return this.getFromStorage<Requirement>('requirements');
  }

  async getRequirement(id: string): Promise<Requirement | null> {
    const requirements = await this.getRequirements();
    return requirements.find(r => r.id === id) || null;
  }

  async createRequirement(requirement: Omit<Requirement, 'id' | 'created_at' | 'updated_at'>): Promise<Requirement> {
    const requirements = await this.getRequirements();
    const newRequirement: Requirement = {
      ...requirement,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    requirements.push(newRequirement);
    await this.saveToStorage('requirements', requirements);
    return newRequirement;
  }

  async updateRequirement(id: string, updates: Partial<Requirement>): Promise<Requirement> {
    const requirements = await this.getRequirements();
    const index = requirements.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Requirement not found');
    
    requirements[index] = {
      ...requirements[index],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    await this.saveToStorage('requirements', requirements);
    return requirements[index];
  }

  async deleteRequirement(id: string): Promise<void> {
    const requirements = await this.getRequirements();
    const filtered = requirements.filter(r => r.id !== id);
    await this.saveToStorage('requirements', filtered);
  }

  async addRequirementComment(requirementId: string, comment: any) {
    console.log('MockProvider: addRequirementComment called', requirementId, comment);
    const requirements = await this.getRequirements();
    const requirement = requirements.find(r => r.id === requirementId);
    if (requirement) {
      requirement.comments.push(comment.text);
      await this.saveToStorage('requirements', requirements);
    }
    return requirement as Requirement;
  }

  // Quotes
  async getQuotes(): Promise<Quote[]> {
    return this.getFromStorage<Quote>('quotes');
  }

  async getQuote(id: string): Promise<Quote | null> {
    const quotes = await this.getQuotes();
    return quotes.find(q => q.id === id) || null;
  }

  async createQuote(quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>): Promise<Quote> {
    const quotes = await this.getQuotes();
    const newQuote: Quote = {
      ...quote,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    quotes.push(newQuote);
    await this.saveToStorage('quotes', quotes);
    return newQuote;
  }

  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
    const quotes = await this.getQuotes();
    const index = quotes.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Quote not found');
    
    quotes[index] = {
      ...quotes[index],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    await this.saveToStorage('quotes', quotes);
    return quotes[index];
  }

  async deleteQuote(id: string): Promise<void> {
    const quotes = await this.getQuotes();
    const filtered = quotes.filter(q => q.id !== id);
    await this.saveToStorage('quotes', filtered);
  }

  // Quote Items
  async getQuoteItems(quoteId: string): Promise<QuoteItem[]> {
    const items = await this.getFromStorage<QuoteItem>('quoteItems');
    return items.filter(i => i.quote_id === quoteId);
  }

  async createQuoteItem(item: Omit<QuoteItem, 'id'>): Promise<QuoteItem> {
    const items = await this.getFromStorage<QuoteItem>('quoteItems');
    const newItem: QuoteItem = {
      ...item,
      id: this.generateId(),
    };
    items.push(newItem);
    await this.saveToStorage('quoteItems', items);
    return newItem;
  }

  async updateQuoteItem(id: string, updates: Partial<QuoteItem>): Promise<QuoteItem> {
    const items = await this.getFromStorage<QuoteItem>('quoteItems');
    const index = items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Quote item not found');
    
    items[index] = { ...items[index], ...updates };
    await this.saveToStorage('quoteItems', items);
    return items[index];
  }

  async deleteQuoteItem(id: string): Promise<void> {
    const items = await this.getFromStorage<QuoteItem>('quoteItems');
    const filtered = items.filter(i => i.id !== id);
    await this.saveToStorage('quoteItems', filtered);
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.getFromStorage<Product>('products');
  }

  async getProduct(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const products = await this.getProducts();
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    products.push(newProduct);
    await this.saveToStorage('products', products);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    products[index] = {
      ...products[index],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    await this.saveToStorage('products', products);
    return products[index];
  }

  async deleteProduct(id: string): Promise<void> {
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    await this.saveToStorage('products', filtered);
  }

  // Installers
  async getInstallers(): Promise<Installer[]> {
    return this.getFromStorage<Installer>('installers');
  }

  async getInstaller(id: string): Promise<Installer | null> {
    const installers = await this.getInstallers();
    return installers.find(i => i.id === id) || null;
  }

  async createInstaller(installer: Omit<Installer, 'id' | 'created_at' | 'updated_at'>): Promise<Installer> {
    const installers = await this.getInstallers();
    const newInstaller: Installer = {
      ...installer,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    installers.push(newInstaller);
    await this.saveToStorage('installers', installers);
    return newInstaller;
  }

  async updateInstaller(id: string, updates: Partial<Installer>): Promise<Installer> {
    const installers = await this.getInstallers();
    const index = installers.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Installer not found');
    
    installers[index] = {
      ...installers[index],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    await this.saveToStorage('installers', installers);
    return installers[index];
  }

  async deleteInstaller(id: string): Promise<void> {
    const installers = await this.getInstallers();
    const filtered = installers.filter(i => i.id !== id);
    await this.saveToStorage('installers', filtered);
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return this.getFromStorage<Invoice>('invoices');
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    const invoices = await this.getInvoices();
    return invoices.find(i => i.id === id) || null;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
    const invoices = await this.getInvoices();
    const newInvoice: Invoice = {
      ...invoice,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    invoices.push(newInvoice);
    await this.saveToStorage('invoices', invoices);
    return newInvoice;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const invoices = await this.getInvoices();
    const index = invoices.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Invoice not found');
    
    invoices[index] = {
      ...invoices[index],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    await this.saveToStorage('invoices', invoices);
    return invoices[index];
  }

  async deleteInvoice(id: string): Promise<void> {
    const invoices = await this.getInvoices();
    const filtered = invoices.filter(i => i.id !== id);
    await this.saveToStorage('invoices', filtered);
  }

  // Attachments
  async uploadAttachment(entityType: string, entityId: string, file: File) {
    console.log('MockProvider: uploadAttachment called', entityType, entityId, file.name);
    return { id: 'mock-attachment-id', file_name: file.name };
  }

  async listAttachments(entityType: string, entityId: string) {
    console.log('MockProvider: listAttachments called', entityType, entityId);
    return [];
  }

  async deleteAttachment(id: string) {
    console.log('MockProvider: deleteAttachment called', id);
  }

  // Payments
  async getPayments(invoiceId: string): Promise<Payment[]> {
    const payments = await this.getFromStorage<Payment>('payments');
    return payments.filter(p => p.invoice_id === invoiceId);
  }

  async createPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const payments = await this.getFromStorage<Payment>('payments');
    const newPayment: Payment = {
      ...payment,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
    };
    payments.push(newPayment);
    await this.saveToStorage('payments', payments);
    return newPayment;
  }
}

export default MockProvider;
