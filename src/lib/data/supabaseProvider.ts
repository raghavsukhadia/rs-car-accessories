// src/lib/data/supabaseProvider.ts
import { supabase } from '../supabase'
import type { DataProvider } from './provider'

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
    console.log('✅ Call follow-ups loaded:', data?.length || 0);
    return data
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
    return data
  }
  async updateCallFollowUp(id: Id, patch: any) {
    const { data, error } = await supabase
      .from('call_followups')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  async deleteCallFollowUp(id: Id) {
    const { error } = await supabase.from('call_followups').delete().eq('id', id)
    if (error) throw error
    return { id }
  }

  // ---------- Service Jobs ----------
  async getServiceJobs() {
    await this.debugAuth();
    console.log('🔍 Getting service jobs...');
    const { data, error } = await supabase
      .from('service_jobs')
      .select('*')
      .order('scheduled_at', { ascending: true })
    if (error) {
      console.error('❌ Error getting service jobs:', error);
      throw error;
    }
    console.log('✅ Service jobs loaded:', data?.length || 0);
    
    // Load attachments and comments for each service job
    const serviceJobsWithAttachmentsAndComments = await Promise.all(
      (data || []).map(async (job) => {
        const [attachments, comments] = await Promise.all([
          this.listAttachments('service_job', job.id),
          this.listServiceJobComments(job.id)
        ]);
        return { ...job, attachments, comments };
      })
    );
    
    return serviceJobsWithAttachmentsAndComments;
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
    return data
  }
  async updateServiceJob(id: Id, patch: any) {
    const { data, error } = await supabase
      .from('service_jobs')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  async deleteServiceJob(id: Id) {
    const { error } = await supabase.from('service_jobs').delete().eq('id', id)
    if (error) throw error
    return { id }
  }

  // ---------- Service Job Comments ----------
  async listServiceJobComments(service_job_id: Id) {
    const { data, error } = await supabase
      .from('service_job_comments')
      .select('*')
      .eq('service_job_id', service_job_id)
      .order('timestamp', { ascending: false })
    if (error) throw error
    
    console.log('🔍 Loading comments for service job:', service_job_id, 'Found:', data?.length || 0);
    
    // Load attachments for each comment
    const commentsWithAttachments = await Promise.all(
      (data || []).map(async (comment) => {
        const attachments = await this.listAttachments('service_job_comment', comment.id);
        console.log('📎 Comment', comment.id, 'has', attachments.length, 'attachments');
        return { ...comment, attachments };
      })
    );
    
    return commentsWithAttachments
  }
  async addServiceJobComment(service_job_id: Id, comment: any) {
    const { data, error } = await supabase
      .from('service_job_comments')
      .insert({ ...comment, service_job_id })
      .select()
      .single()
    if (error) throw error
    return data
  }
  async updateServiceJobComment(id: Id, patch: any) {
    const { data, error } = await supabase
      .from('service_job_comments')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  async deleteServiceJobComment(id: Id) {
    const { error } = await supabase
      .from('service_job_comments')
      .delete()
      .eq('id', id)
    if (error) throw error
    return { id }
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
    console.log('✅ Requirements loaded:', data?.length || 0);
    
    // Load attachments and comments for each requirement
    const requirementsWithAttachmentsAndComments = await Promise.all(
      (data || []).map(async (requirement) => {
        const [attachments, comments] = await Promise.all([
          this.listAttachments('requirement', requirement.id),
          this.listRequirementComments(requirement.id)
        ]);
        return { ...requirement, attachments, comments };
      })
    );
    
    return requirementsWithAttachmentsAndComments;
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
    return data
  }
  async updateRequirement(id: Id, patch: any) {
    const { data, error } = await supabase
      .from('requirements')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  async deleteRequirement(id: Id) {
    const { error } = await supabase.from('requirements').delete().eq('id', id)
    if (error) throw error
    return { id }
  }

  // Requirement comments
  async listRequirementComments(requirement_id: Id) {
    const { data, error } = await supabase
      .from('requirement_comments')
      .select('*')
      .eq('requirement_id', requirement_id)
      .order('timestamp', { ascending: false })
    if (error) throw error
    return data
  }
  async addRequirementComment(requirement_id: Id, comment: any) {
    const { data, error } = await supabase
      .from('requirement_comments')
      .insert({ ...comment, requirement_id })
      .select()
      .single()
    if (error) throw error
    return data
  }
  async deleteRequirementComment(id: Id) {
    const { error } = await supabase
      .from('requirement_comments')
      .delete()
      .eq('id', id)
    if (error) throw error
    return { id }
  }

  // ---------- Attachments (Storage + table) ----------
  private BUCKET = 'attachments'
  async uploadAttachment(entity_type: string, entity_id: Id, file: File) {
    await this.debugAuth();
    console.log('📎 Uploading attachment:', { entity_type, entity_id, fileName: file.name, fileSize: file.size });
    
    const ext = file.name.split('.').pop() || 'bin'
    const key = `${entity_type}/${entity_id}/${crypto.randomUUID()}.${ext}`

    const up = await supabase.storage.from(this.BUCKET).upload(key, file, { upsert: false })
    if (up.error) {
      console.error('❌ Error uploading file to storage:', up.error);
      throw up.error;
    }
    console.log('✅ File uploaded to storage:', key);

    const { data, error } = await supabase
      .from('attachments')
      .insert({
        entity_type,
        entity_id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: key
      })
      .select()
      .single()
    if (error) {
      console.error('❌ Error saving attachment metadata:', error);
      throw error;
    }
    console.log('✅ Attachment metadata saved:', data);
    return data
  }

  async listAttachments(entity_type: string, entity_id: Id) {
    console.log('🔍 Listing attachments for:', { entity_type, entity_id });
    
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('❌ Error listing attachments:', error);
      throw error;
    }
    
    console.log('📎 Found attachments:', data?.length || 0, data);

    const withUrls = await Promise.all(
      (data ?? []).map(async (row) => {
        const u = await supabase.storage.from(this.BUCKET).createSignedUrl(row.storage_path, 60 * 60)
        console.log('🔗 Generated signed URL for:', row.file_name, u.data?.signedUrl ? 'SUCCESS' : 'FAILED');
        return { ...row, signed_url: u.data?.signedUrl ?? null }
      })
    )
    return withUrls
  }

  async deleteAttachment(id: Id, storage_path: string) {
    const s = await supabase.storage.from(this.BUCKET).remove([storage_path])
    if (s.error) throw s.error
    const { error } = await supabase.from('attachments').delete().eq('id', id)
    if (error) throw error
    return { id }
  }

  // ---------- Optional stubs so Dashboard doesn't break ----------
  async getCustomers() { return [] }
  async getLeads() { return [] }
  async getInvoices() { return [] }
  async getProducts() { return [] }
}
