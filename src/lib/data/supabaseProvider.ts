// src/lib/data/supabaseProvider.ts
import { supabase } from '../supabase'
import type { DataProvider, CallFollowUp, ServiceJob, Requirement, Customer, Lead, LeadCall, Product } from './provider'

type Id = string

export default class SupabaseProvider implements DataProvider {
  // Debug authentication status
  private async debugAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('🔐 Current session:', session?.user?.email || 'No session');
    
    if (session) {
      const { data, error } = await supabase.rpc('is_admin');
      console.log('👑 Is admin:', data, error ? `Error: ${error.message}` : '');
    }
  }

  // ---------- Call Follow-ups ----------
  async getCallFollowUps() {
    await this.debugAuth();
    console.log('🔍 Getting call follow-ups...');
    const { data, error } = await supabase
      .from('call_followups')
      .select('*')
      .order('timestamp', { ascending: false })
    if (error) {
      console.error('❌ Error getting call follow-ups:', error);
      throw error;
    }
    console.log('✅ Call follow-ups retrieved:', data);
    return (data || []).map(item => ({
      ...item,
      response_time: item.response_time || undefined,
      call_outcome: item.call_outcome || undefined,
      time_to_respond: item.time_to_respond || undefined,
    })) as CallFollowUp[];
  }

  async createCallFollowUp(payload: any) {
    await this.debugAuth();
    console.log('📝 Creating call follow-up with payload:', payload);
    const { data, error } = await supabase
      .from('call_followups')
      .insert(payload)
      .select()
      .single()
    if (error) {
      console.error('❌ Error creating call follow-up:', error);
      throw error;
    }
    console.log('✅ Call follow-up created:', data);
    return {
      ...data,
      response_time: data.response_time || undefined,
      call_outcome: data.call_outcome || undefined,
      time_to_respond: data.time_to_respond || undefined,
    } as CallFollowUp;
  }

  async updateCallFollowUp(id: Id, patch: any) {
    await this.debugAuth();
    console.log('📝 Updating call follow-up:', id, patch);
    const { data, error } = await supabase
      .from('call_followups')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('❌ Error updating call follow-up:', error);
      throw error;
    }
    console.log('✅ Call follow-up updated:', data);
    return {
      ...data,
      response_time: data.response_time || undefined,
      call_outcome: data.call_outcome || undefined,
      time_to_respond: data.time_to_respond || undefined,
    } as CallFollowUp;
  }

  async deleteCallFollowUp(id: Id) {
    await this.debugAuth();
    console.log('🗑️ Deleting call follow-up:', id);
    const { error } = await supabase
      .from('call_followups')
      .delete()
      .eq('id', id)
    if (error) {
      console.error('❌ Error deleting call follow-up:', error);
      throw error;
    }
    console.log('✅ Call follow-up deleted');
  }

  // ---------- Service Jobs ----------
  async getServiceJobs() {
    await this.debugAuth();
    console.log('🔍 Getting service jobs...');
    const { data, error } = await supabase
      .from('service_jobs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('❌ Error getting service jobs:', error);
      throw error;
    }
    console.log('✅ Service jobs retrieved:', data);
    
    // Fetch attachments and comments for each service job
    const serviceJobsWithAttachments = await Promise.all(
      (data || []).map(async (item) => {
        const attachments = await this.listAttachments('service_job', item.id);
        const comments = await this.listServiceJobComments(item.id);
        
        return {
          ...item,
          attachments: attachments.map(att => ({
            name: att.file_name,
            type: att.file_type,
            size: att.file_size,
            data: att.signed_url
          })),
          comments: comments.map(comment => ({
            id: comment.id,
            text: comment.text,
            author: comment.author,
            timestamp: comment.timestamp,
            attachments: comment.attachments || []
          }))
        };
      })
    );
    
    console.log('✅ Service jobs with attachments and comments:', serviceJobsWithAttachments);
    return serviceJobsWithAttachments as ServiceJob[];
  }

  async createServiceJob(payload: any) {
    await this.debugAuth();
    console.log('📝 Creating service job with payload:', payload);
    const { data, error } = await supabase
      .from('service_jobs')
      .insert(payload)
      .select()
      .single()
    if (error) {
      console.error('❌ Error creating service job:', error);
      throw error;
    }
    console.log('✅ Service job created:', data);
    return {
      ...data,
      attachments: [],
      comments: [],
    } as ServiceJob;
  }

  async updateServiceJob(id: Id, patch: any) {
    await this.debugAuth();
    console.log('📝 Updating service job:', id, patch);
    const { data, error } = await supabase
      .from('service_jobs')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('❌ Error updating service job:', error);
      throw error;
    }
    console.log('✅ Service job updated:', data);
    return {
      ...data,
      attachments: [],
      comments: [],
    } as ServiceJob;
  }

  async deleteServiceJob(id: Id) {
    await this.debugAuth();
    console.log('🗑️ Deleting service job:', id);
    const { error } = await supabase
      .from('service_jobs')
      .delete()
      .eq('id', id)
    if (error) {
      console.error('❌ Error deleting service job:', error);
      throw error;
    }
    console.log('✅ Service job deleted');
  }

  async listServiceJobComments(serviceJobId: Id) {
    await this.debugAuth();
    console.log('💬 Listing service job comments:', serviceJobId);
    const { data, error } = await supabase
      .from('service_job_comments')
      .select('*')
      .eq('service_job_id', serviceJobId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('❌ Error listing service job comments:', error);
      throw error;
    }
    
    // Fetch attachments for each comment
    const commentsWithAttachments = await Promise.all(
      (data || []).map(async (comment) => {
        const attachments = await this.listAttachments('service_job_comment', comment.id);
        return {
          ...comment,
          attachments: attachments.map(att => ({
            name: att.file_name,
            type: att.file_type,
            size: att.file_size,
            data: att.signed_url
          }))
        };
      })
    );
    
    console.log('✅ Service job comments with attachments:', commentsWithAttachments);
    return commentsWithAttachments;
  }

  // ---------- Service Job Comments ----------
  async addServiceJobComment(serviceJobId: Id, comment: any) {
    await this.debugAuth();
    console.log('📝 Adding service job comment:', serviceJobId, comment);
    const { data, error } = await supabase
      .from('service_job_comments')
      .insert({
        service_job_id: serviceJobId,
        text: comment.text,
        author: comment.author,
      })
      .select()
      .single()
    if (error) {
      console.error('❌ Error adding service job comment:', error);
      throw error;
    }
    console.log('✅ Service job comment added:', data);
    return {
      ...data,
      attachments: [],
    } as unknown as ServiceJob;
  }

  async updateServiceJobComment(_serviceJobId: Id, commentId: Id, updates: any) {
    await this.debugAuth();
    console.log('📝 Updating service job comment:', commentId, updates);
    const { data, error } = await supabase
      .from('service_job_comments')
      .update(updates)
      .eq('id', commentId)
      .select()
      .single()
    if (error) {
      console.error('❌ Error updating service job comment:', error);
      throw error;
    }
    console.log('✅ Service job comment updated:', data);
    return {
      ...data,
      attachments: [],
    } as unknown as ServiceJob;
  }

  async deleteServiceJobComment(serviceJobId: Id, commentId: Id) {
    await this.debugAuth();
    console.log('🗑️ Deleting service job comment:', commentId);
    const { error } = await supabase
      .from('service_job_comments')
      .delete()
      .eq('id', commentId)
    if (error) {
      console.error('❌ Error deleting service job comment:', error);
      throw error;
    }
    console.log('✅ Service job comment deleted');
    return {
      id: serviceJobId,
      modal_name: '',
      modal_registration_number: '',
      customer_name: '',
      customer_number: '',
      description: '',
      status: 'Received' as const,
      attachments: [],
      comments: [],
      scheduled_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ServiceJob;
  }

  // ---------- Requirements ----------
  async getRequirements() {
    await this.debugAuth();
    console.log('🔍 Getting requirements...');
    const { data, error } = await supabase
      .from('requirements')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('❌ Error getting requirements:', error);
      throw error;
    }
    console.log('✅ Requirements retrieved:', data);
    
    // Fetch attachments and comments for each requirement
    const requirementsWithAttachments = await Promise.all(
      (data || []).map(async (item) => {
        const attachments = await this.listAttachments('requirement', item.id);
        const comments = await this.listRequirementComments(item.id);
        
        return {
          ...item,
          attachments: attachments.map(att => ({
            name: att.file_name,
            type: att.file_type,
            size: att.file_size,
            data: att.signed_url
          })),
          comments: comments.map(comment => ({
            id: comment.id,
            text: comment.text,
            author: comment.author,
            timestamp: comment.timestamp
          }))
        };
      })
    );
    
    console.log('✅ Requirements with attachments and comments:', requirementsWithAttachments);
    return requirementsWithAttachments as Requirement[];
  }

  async createRequirement(payload: any) {
    await this.debugAuth();
    console.log('📝 Creating requirement with payload:', payload);
    const { data, error } = await supabase
      .from('requirements')
      .insert(payload)
      .select()
      .single()
    if (error) {
      console.error('❌ Error creating requirement:', error);
      throw error;
    }
    console.log('✅ Requirement created:', data);
    return {
      ...data,
      attachments: [],
      comments: [],
    } as unknown as Requirement;
  }

  async updateRequirement(id: Id, patch: any) {
    await this.debugAuth();
    console.log('📝 Updating requirement:', id, patch);
    const { data, error } = await supabase
      .from('requirements')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('❌ Error updating requirement:', error);
      throw error;
    }
    console.log('✅ Requirement updated:', data);
    return {
      ...data,
      attachments: [],
      comments: [],
    } as unknown as Requirement;
  }

  async deleteRequirement(id: Id) {
    await this.debugAuth();
    console.log('🗑️ Deleting requirement:', id);
    const { error } = await supabase
      .from('requirements')
      .delete()
      .eq('id', id)
    if (error) {
      console.error('❌ Error deleting requirement:', error);
      throw error;
    }
    console.log('✅ Requirement deleted');
  }

  async listRequirementComments(requirementId: Id) {
    await this.debugAuth();
    console.log('💬 Listing requirement comments:', requirementId);
    const { data, error } = await supabase
      .from('requirement_comments')
      .select('*')
      .eq('requirement_id', requirementId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('❌ Error listing requirement comments:', error);
      throw error;
    }
    
    console.log('✅ Requirement comments:', data);
    return data || [];
  }

  // ---------- Requirement Comments ----------
  async addRequirementComment(requirementId: Id, comment: any) {
    await this.debugAuth();
    console.log('📝 Adding requirement comment:', requirementId, comment);
    const { data, error } = await supabase
      .from('requirement_comments')
      .insert({
        requirement_id: requirementId,
        text: comment.text,
        author: comment.author,
      })
      .select()
      .single()
    if (error) {
      console.error('❌ Error adding requirement comment:', error);
      throw error;
    }
    console.log('✅ Requirement comment added:', data);
    return {
      ...data,
      attachments: [],
      comments: [],
    } as unknown as Requirement;
  }

  // ---------- Attachments ----------
  async uploadAttachment(entityType: string, entityId: Id, file: File) {
    await this.debugAuth();
    console.log('📎 Uploading attachment:', entityType, entityId, file.name);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${entityType}_${entityId}_${Date.now()}.${fileExt}`;
    const filePath = `${entityType}/${entityId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error('❌ Error uploading file:', uploadError);
      throw uploadError;
    }

    // Get signed URL
    const { data: urlData } = await supabase.storage
      .from('attachments')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

    // Save attachment metadata
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving attachment metadata:', error);
      throw error;
    }

    console.log('✅ Attachment uploaded:', data);
    return {
      ...data,
      signed_url: urlData?.signedUrl || null,
    };
  }

  async listAttachments(entityType: string, entityId: Id) {
    await this.debugAuth();
    console.log('📎 Listing attachments:', entityType, entityId);
    
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    if (error) {
      console.error('❌ Error listing attachments:', error);
      throw error;
    }

    // Get signed URLs for each attachment
    const attachmentsWithUrls = await Promise.all(
      (data || []).map(async (attachment) => {
        const { data: urlData } = await supabase.storage
          .from('attachments')
          .createSignedUrl(attachment.storage_path, 60 * 60 * 24 * 365);
        
        return {
          ...attachment,
          signed_url: urlData?.signedUrl || null,
        };
      })
    );

    console.log('✅ Attachments listed:', attachmentsWithUrls);
    return attachmentsWithUrls;
  }

  async deleteAttachment(id: Id) {
    await this.debugAuth();
    console.log('🗑️ Deleting attachment:', id);
    
    // Get attachment info first
    const { data: attachment, error: fetchError } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching attachment:', fetchError);
      throw fetchError;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([attachment.storage_path]);

    if (storageError) {
      console.error('❌ Error deleting from storage:', storageError);
    }

    // Delete from database
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting attachment:', error);
      throw error;
    }

    console.log('✅ Attachment deleted');
  }

  // ---------- Mock implementations for missing methods ----------
  async getCustomers() { return []; }
  async getCustomer(_id: string) { return null; }
  async createCustomer(customer: Omit<Customer, "id" | "created_at" | "updated_at">) { return customer as Customer; }
  async updateCustomer(_id: string, updates: Partial<Customer>) { return updates as Customer; }
  async deleteCustomer(_id: string) { }
  async getLeads() { return []; }
  async getLead(_id: string) { return null; }
  async createLead(lead: Omit<Lead, "id" | "created_at" | "updated_at">) { return lead as Lead; }
  async updateLead(_id: string, updates: Partial<Lead>) { return updates as Lead; }
  async deleteLead(_id: string) { }
  async getCallFollowUp(_id: string) { return null; }
  async getLeadCalls(_leadId: string) { return []; }
  async createLeadCall(call: Omit<LeadCall, "id" | "created_at">) { return call as LeadCall; }
  async getServiceJob(_id: string) { return null; }
  async getRequirement(_id: string) { return null; }
  async getQuotes() { return []; }
  async getQuote(_id: string) { return null; }
  async createQuote(_quote: any) { return {} as any; }
  async updateQuote(_id: string, _updates: any) { return {} as any; }
  async deleteQuote(_id: string) { }
  async getQuoteItems(_quoteId: string) { return []; }
  async createQuoteItem(_item: any) { return {} as any; }
  async updateQuoteItem(_id: string, _updates: any) { return {} as any; }
  async deleteQuoteItem(_id: string) { }
  async getProducts() { return []; }
  async getProduct(_id: string) { return null; }
  async createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) { return product as Product; }
  async updateProduct(_id: string, updates: Partial<Product>) { return updates as Product; }
  async deleteProduct(_id: string) { }
  async getInstallers() { return []; }
  async getInstaller(_id: string) { return null; }
  async createInstaller(_installer: any) { return {} as any; }
  async updateInstaller(_id: string, _updates: any) { return {} as any; }
  async deleteInstaller(_id: string) { }
  async getInvoices() { return []; }
  async getInvoice(_id: string) { return null; }
  async createInvoice(_invoice: any) { return {} as any; }
  async updateInvoice(_id: string, _updates: any) { return {} as any; }
  async deleteInvoice(_id: string) { }
  async getPayments() { return []; }
  async createPayment(_payment: any) { return {} as any; }
}