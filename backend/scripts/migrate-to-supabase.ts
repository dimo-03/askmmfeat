import { config } from '../src/config';
import { db } from '../src/db';
import { supabase, isSupabaseReady } from '../src/supabase';
import type { Member, PaymentRecord, AuditLog } from '../src/types';

async function migrate() {
  console.log('\n=============================================================');
  console.log('🚀 SUPABASE DATABASE MIGRATION UTILITY');
  console.log('=============================================================\n');

  if (!isSupabaseReady() || !supabase) {
    console.error('❌ Supabase is not configured in your .env file!');
    console.error('\nPlease add the following variables to backend/.env:');
    console.error('  SUPABASE_URL=https://<your-project-id>.supabase.co');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>');
    console.error('\nMake sure you have also run backend/supabase-schema.sql in your Supabase SQL Editor.');
    process.exit(1);
  }

  console.log(`Connected to Supabase project at: ${config.supabase.url}\n`);

  try {
    // 1. Migrate Members
    console.log('📦 1. Migrating Members from SQLite to Supabase...');
    const members = db.prepare('SELECT * FROM members ORDER BY id ASC').all() as Member[];
    console.log(`   Found ${members.length} members in local database.`);

    let membersMigrated = 0;
    for (const m of members) {
      const payload = {
        membership_id: m.membership_id,
        name: m.name,
        photo: m.photo,
        designation: m.designation,
        location: m.location,
        mobile: m.mobile,
        email: m.email,
        category: m.category,
        validity_start: m.validity_start || null,
        validity_end: m.validity_end || null,
        organization: m.organization || null,
        address: m.address || null,
        gender: m.gender || null,
        date_of_birth: m.date_of_birth || null,
        notes: m.notes || null,
        is_active: m.is_active,
        membership_status: m.membership_status,
        payment_method: m.payment_method || 'cash',
        payment_status: m.payment_status || 'Pending',
        payment_amount: m.payment_amount || 0,
        payment_reference: m.payment_reference || null,
        payment_date: m.payment_date || null,
        created_at: m.created_at,
        updated_at: m.updated_at,
      };

      const { error } = await supabase
        .from('members')
        .upsert(payload, { onConflict: 'membership_id' });

      if (error) {
        console.warn(`   ⚠️ Warning on member ${m.membership_id} (${m.name}):`, error.message);
      } else {
        membersMigrated++;
      }
    }
    console.log(`   ✅ Successfully migrated ${membersMigrated} / ${members.length} members.\n`);

    // 2. Migrate Payments
    console.log('💳 2. Migrating Payments Ledger to Supabase...');
    const payments = db.prepare('SELECT * FROM payments ORDER BY id ASC').all() as PaymentRecord[];
    console.log(`   Found ${payments.length} payment records in local database.`);

    let paymentsMigrated = 0;
    for (const p of payments) {
      const payload = {
        membership_id: p.membership_id,
        method: p.method,
        amount: p.amount,
        status: p.status,
        reference_id: p.reference_id,
        razorpay_order_id: p.razorpay_order_id,
        notes: p.notes,
        created_at: p.created_at,
      };

      const { error } = await supabase.from('payments').insert(payload);
      if (error) {
        console.warn(`   ⚠️ Warning on payment ${p.reference_id}:`, error.message);
      } else {
        paymentsMigrated++;
      }
    }
    console.log(`   ✅ Successfully migrated ${paymentsMigrated} / ${payments.length} payment records.\n`);

    // 3. Migrate Audit Logs
    console.log('📋 3. Migrating Security Audit Logs to Supabase...');
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id ASC').all() as AuditLog[];
    console.log(`   Found ${logs.length} audit logs in local database.`);

    let logsMigrated = 0;
    for (const l of logs) {
      const payload = {
        admin_id: l.admin_id,
        admin_user: l.admin_user,
        action: l.action,
        entity_type: l.entity_type,
        entity_id: l.entity_id,
        details: l.details,
        ip_address: l.ip_address,
        user_agent: l.user_agent,
        created_at: l.created_at,
      };

      const { error } = await supabase.from('audit_logs').insert(payload);
      if (error) {
        console.warn(`   ⚠️ Warning on audit log ${l.action}:`, error.message);
      } else {
        logsMigrated++;
      }
    }
    console.log(`   ✅ Successfully migrated ${logsMigrated} / ${logs.length} audit logs.\n`);

    console.log('=============================================================');
    console.log('🎉 SUPABASE MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('=============================================================\n');
  } catch (err) {
    console.error('Fatal error during migration:', err);
    process.exit(1);
  }
}

migrate();

