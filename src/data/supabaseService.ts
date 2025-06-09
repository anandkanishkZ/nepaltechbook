import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

// Files
export const getFiles = async () => {
  const { data, error } = await supabase
    .from('files')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getFileById = async (id: string) => {
  const { data, error } = await supabase
    .from('files')
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('id', id)
    .single();
  return { data, error };
};

export const getFilesByCategory = async (categorySlug: string) => {
  const { data, error } = await supabase
    .from('files')
    .select(`
      *,
      categories!inner (
        id,
        name,
        slug
      )
    `)
    .eq('categories.slug', categorySlug)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createFile = async (fileData: Database['public']['Tables']['files']['Insert']) => {
  const { data, error } = await supabase
    .from('files')
    .insert([fileData])
    .select()
    .single();
  return { data, error };
};

export const updateFile = async (
  id: string, 
  updates: Database['public']['Tables']['files']['Update']
) => {
  const { data, error } = await supabase
    .from('files')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteFile = async (id: string) => {
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', id);
  return { error };
};

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  return { data, error };
};

export const createCategory = async (categoryData: Database['public']['Tables']['categories']['Insert']) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select()
    .single();
  return { data, error };
};

export const updateCategory = async (
  id: string,
  updates: Database['public']['Tables']['categories']['Update']
) => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  return { error };
};

// Purchases
export const getPurchases = async (userId?: string) => {
  let query = supabase
    .from('purchases')
    .select(`
      *,
      files (
        id,
        title,
        preview_url,
        price
      ),
      profiles (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createPurchase = async (purchaseData: Database['public']['Tables']['purchases']['Insert']) => {
  const { data, error } = await supabase
    .from('purchases')
    .insert([purchaseData])
    .select()
    .single();
  return { data, error };
};

export const updatePurchaseStatus = async (
  id: string, 
  status: 'pending' | 'approved' | 'declined'
) => {
  const { data, error } = await supabase
    .from('purchases')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// Profiles
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const getProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateProfile = async (
  userId: string, 
  updates: Database['public']['Tables']['profiles']['Update']
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const createProfile = async (profileData: Database['public']['Tables']['profiles']['Insert']) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
    .select()
    .single();
  return { data, error };
};

// Invoices
export const getInvoices = async (userId?: string) => {
  let query = supabase
    .from('invoices')
    .select(`
      *,
      purchases (
        id,
        payment_method,
        files (
          id,
          title
        )
      ),
      profiles (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createInvoice = async (purchaseId: string) => {
  const { data, error } = await supabase
    .rpc('create_invoice_from_purchase', { purchase_uuid: purchaseId });
  return { data, error };
};

export const updateInvoiceStatus = async (
  id: string,
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
) => {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// System Settings
export const getSystemSettings = async () => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .order('category', { ascending: true });
  return { data, error };
};

export const updateSystemSetting = async (key: string, value: any) => {
  const { data, error } = await supabase
    .from('system_settings')
    .update({ value })
    .eq('key', key)
    .select()
    .single();
  return { data, error };
};

// Activity Logs
export const getActivityLogs = async (limit: number = 50) => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      profiles (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const logActivity = async (
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { error } = await supabase
      .rpc('log_activity', {
        p_user_id: user.id,
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_details: details
      });
    return { error };
  }
  
  return { error: new Error('User not authenticated') };
};

// Dashboard Analytics
export const getDashboardAnalytics = async () => {
  const { data, error } = await supabase
    .from('dashboard_analytics')
    .select('*')
    .single();
  return { data, error };
};

// File Downloads
export const getFileDownloads = async (fileId?: string, userId?: string) => {
  let query = supabase
    .from('file_downloads')
    .select(`
      *,
      files (
        id,
        title,
        preview_url
      ),
      profiles (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (fileId) {
    query = query.eq('file_id', fileId);
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const recordFileDownload = async (fileId: string, purchaseId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: new Error('User not authenticated') };
  }

  // Check if download record exists
  const { data: existingDownload } = await supabase
    .from('file_downloads')
    .select('*')
    .eq('file_id', fileId)
    .eq('user_id', user.id)
    .single();

  if (existingDownload) {
    // Update existing record
    const { data, error } = await supabase
      .from('file_downloads')
      .update({
        download_count: existingDownload.download_count + 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('id', existingDownload.id)
      .select()
      .single();
    return { data, error };
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('file_downloads')
      .insert([{
        file_id: fileId,
        user_id: user.id,
        purchase_id: purchaseId,
        download_count: 1
      }])
      .select()
      .single();
    return { data, error };
  }
};

// Email Templates
export const getEmailTemplates = async () => {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('name');
  return { data, error };
};

export const updateEmailTemplate = async (
  id: string,
  updates: Database['public']['Tables']['email_templates']['Update']
) => {
  const { data, error } = await supabase
    .from('email_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};