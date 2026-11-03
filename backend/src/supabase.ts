import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';
import type { Member, PublicMember, PaymentRecord, AuditLog } from './types';

let supabaseClient: SupabaseClient | null = null;

if (config.supabase.enabled) {
  try {
    supabaseClient = createClient(config.supabase.url, config.supabase.key, {
      auth: { persistSession: false },
    });
    console.log('⚡ Connected to Supabase Database at:', config.supabase.url);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

export const supabase = supabaseClient;

export const isSupabaseReady = (): boolean => !!supabase;

/**
 * Supabase Member Database Service
 */
export const supabaseDb = {
  /** Fetch single member by ID or membership_id */
  async getMember(idOrMembershipId: number | string): Promise<Member | null> {
    if (!supabase) return null;
    const isNum = !isNaN(Number(idOrMembershipId));
    const query = supabase.from('members').select('*');
    const { data, error } = isNum
      ? await query.eq('id', Number(idOrMembershipId)).maybeSingle()
      : await query.eq('membership_id', String(idOrMembershipId)).maybeSingle();

    if (error) {
      console.error('Supabase getMember error:', error.message);
      return null;
    }
    return data as Member | null;
  },

  /** Query members with filters and pagination */
  async listMembers(params: {
    adminView: boolean;
    q?: string;
    category?: string;
    location?: string;
    membership_status?: string;
    payment_method?: string;
    payment_status?: string;
    active?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ total: number; members: Array<Member | PublicMember>; page: number; limit: number; pages: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 12));
    if (!supabase) return { total: 0, members: [], page, limit, pages: 0 };

    let query = supabase.from('members').select('*', { count: 'exact' });

    if (!params.adminView) {
      query = query.neq('membership_status', 'Pending');
    }

    if (params.q) {
      const search = `%${params.q}%`;
      query = params.adminView
        ? query.or(`name.ilike.${search},membership_id.ilike.${search},email.ilike.${search},mobile.ilike.${search},designation.ilike.${search},location.ilike.${search},payment_reference.ilike.${search}`)
        : query.or(`name.ilike.${search},membership_id.ilike.${search},designation.ilike.${search},location.ilike.${search}`);
    }

    if (params.category) query = query.eq('category', params.category);
    if (params.location) query = query.ilike('location', `%${params.location}%`);
    if (params.active !== undefined) query = query.eq('is_active', params.active);
    if (params.membership_status) query = query.eq('membership_status', params.membership_status);
    if (params.payment_method) query = query.eq('payment_method', params.payment_method);
    if (params.payment_status) query = query.eq('payment_status', params.payment_status);

    // Sorting: default to newest first (id DESC) so newly added members show at the top
    if (params.sort === 'name') {
      query = query.order('name', { ascending: true });
    } else if (params.sort === 'validity') {
      query = query.order('validity_end', { ascending: true, nullsFirst: false });
    } else {
      query = query.order('id', { ascending: false });
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error('Supabase listMembers error:', error.message);
      return { total: 0, members: [], page, limit, pages: 0 };
    }

    const total = count ?? (data?.length || 0);
    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      members: (data || []) as Member[],
    };
  },

  /** Insert new member into Supabase */
  async insertMember(row: Record<string, unknown>): Promise<Member | null> {
    if (!supabase) return null;
    const sanitizedRow = { ...row };
    if (typeof sanitizedRow.payment_amount === 'number') {
      if (isNaN(sanitizedRow.payment_amount) || sanitizedRow.payment_amount < 0) {
        sanitizedRow.payment_amount = 0;
      } else if (sanitizedRow.payment_amount > 99999999) {
        sanitizedRow.payment_amount = 99999999;
      }
    }
    const { data, error } = await supabase
      .from('members')
      .insert(sanitizedRow)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase insertMember error:', error.message);
      throw new Error(`Supabase insert failed: ${error.message}`);
    }
    return data as Member;
  },

  /** Update member details */
  async updateMember(idOrCode: number | string, data: Record<string, unknown>): Promise<Member | null> {
    if (!supabase) return null;
    const sanitizedData = { ...data };
    if (typeof sanitizedData.payment_amount === 'number') {
      if (isNaN(sanitizedData.payment_amount) || sanitizedData.payment_amount < 0) {
        sanitizedData.payment_amount = 0;
      } else if (sanitizedData.payment_amount > 99999999) {
        sanitizedData.payment_amount = 99999999;
      }
    }
    const key = String(idOrCode);
    const query = supabase
      .from('members')
      .update({ ...sanitizedData, updated_at: new Date().toISOString() });

    const filterQuery = key.startsWith('MEM-') ? query.eq('membership_id', key) : query.eq('id', Number(idOrCode) || 0);
    const { data: updated, error } = await filterQuery.select('*').single();

    if (error) {
      console.error('Supabase updateMember error:', error.message);
      throw new Error(`Supabase update failed: ${error.message}`);
    }
    return updated as Member;
  },

  /** Delete member from Supabase */
  async deleteMember(idOrCode: number | string): Promise<boolean> {
    if (!supabase) return false;
    const key = String(idOrCode);
    const query = supabase.from('members').delete();
    const filterQuery = key.startsWith('MEM-') ? query.eq('membership_id', key) : query.eq('id', Number(idOrCode) || 0);
    const { error } = await filterQuery;
    if (error) {
      console.error('Supabase deleteMember error:', error.message);
      return false;
    }
    return true;
  },

  /** Get stats overview */
  async getStats(): Promise<{ total: number; active: number; inactive: number; pending: number; expiringIn30Days: number } | null> {
    if (!supabase) return null;
    const nowIso = new Date().toISOString().split('T')[0];
    const in30DaysIso = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const [allRes, activeRes, inactiveRes, pendingRes, expiringRes] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('is_active', 1),
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('is_active', 0),
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('membership_status', 'Pending'),
      supabase.from('members').select('*', { count: 'exact', head: true })
        .eq('membership_status', 'Approved')
        .gte('validity_end', nowIso)
        .lte('validity_end', in30DaysIso),
    ]);

    return {
      total: allRes.count ?? 0,
      active: activeRes.count ?? 0,
      inactive: inactiveRes.count ?? 0,
      pending: pendingRes.count ?? 0,
      expiringIn30Days: expiringRes.count ?? 0,
    };
  },

  /** Record payment ledger row */
  async insertPayment(record: Omit<PaymentRecord, 'id' | 'created_at'>): Promise<PaymentRecord | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('payments')
      .insert(record)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase insertPayment error:', error.message);
      return null;
    }
    return data as PaymentRecord;
  },

  /** Record audit log */
  async recordAudit(entry: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
    if (!supabase) return;
    try {
      await supabase.from('audit_logs').insert(entry);
    } catch (err) {
      console.error('Supabase recordAudit error:', err);
    }
  },

  /** Automatically flag expired members as inactive (is_active = 0) and status = 'Expired' */
  async expireLapsedMembers(): Promise<number> {
    if (!supabase) return 0;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: expiredList, error: queryError } = await supabase
        .from('members')
        .select('id')
        .not('validity_end', 'is', null)
        .lt('validity_end', today)
        .or('is_active.eq.1,membership_status.neq.Expired');

      if (queryError || !expiredList || expiredList.length === 0) {
        return 0;
      }

      const ids = expiredList.map((m) => m.id);
      const { error: updateError } = await supabase
        .from('members')
        .update({
          is_active: 0,
          membership_status: 'Expired',
          updated_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (updateError) {
        console.error('Supabase expireLapsedMembers update error:', updateError.message);
        return 0;
      }

      return ids.length;
    } catch (err) {
      console.error('Supabase expireLapsedMembers exception:', err);
      return 0;
    }
  },
};

