import process from 'node:process';
process.env.NODE_ENV = 'test';
process.env.SKIP_LISTEN = 'true';

import http from 'node:http';

async function run() {
  console.log('\n======================================================');
  console.log('🔗 VERIFYING FRONTEND-BACKEND AXIOS API WIRING');
  console.log('======================================================\n');

  const { app } = await import('./src/server');
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address() as { port: number };
  const base = `http://127.0.0.1:${addr.port}/api`;
  console.log(`Test API running on ${base}\n`);

  // Import axios from frontend
  const axios = (await import('../frontend/node_modules/axios/index.js')).default;
  const client = axios.create({ baseURL: base });

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string, detail?: unknown) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      if (detail) console.error('     Detail:', detail);
      failed++;
    }
  }

  try {
    // 1. GET /site
    const siteRes = await client.get('/site');
    assert(siteRes.status === 200 && 'name' in siteRes.data, 'Axios GET /api/site returns foundation info');

    // 2. GET /config
    const cfgRes = await client.get('/config');
    assert(cfgRes.status === 200 && Array.isArray(cfgRes.data.categories), 'Axios GET /api/config returns categories');

    // 3. GET /team
    const teamRes = await client.get('/team');
    assert(teamRes.status === 200 && Array.isArray(teamRes.data) && teamRes.data.length > 0, `Axios GET /api/team returns team members (count: ${teamRes.data.length})`);

    // 4. GET /events
    const eventsRes = await client.get('/events');
    assert(eventsRes.status === 200 && Array.isArray(eventsRes.data) && eventsRes.data.length > 0, `Axios GET /api/events returns events (count: ${eventsRes.data.length})`);

    // 5. GET /gallery
    const galleryRes = await client.get('/gallery');
    assert(galleryRes.status === 200 && Array.isArray(galleryRes.data) && galleryRes.data.length > 0, `Axios GET /api/gallery returns gallery items (count: ${galleryRes.data.length})`);

    // 6. POST /contact
    const contactRes = await client.post('/contact', {
      name: 'Integration Test User',
      email: 'test@example.org',
      phone: '+91 94370 00000',
      message: 'Hello from Axios frontend integration test!',
    });
    assert(contactRes.status === 201 && contactRes.data.message.includes('Thank you'), 'Axios POST /api/contact receives 201 and confirmation message');

    // 7. GET /members
    const membersRes = await client.get('/members');
    assert(membersRes.status === 200 && Array.isArray(membersRes.data.members) && membersRes.data.total > 0, `Axios GET /api/members lists approved members (total: ${membersRes.data.total})`);

    // 8. POST /admin/login
    const loginRes = await client.post('/admin/login', {
      username: 'admin',
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
    });
    assert(loginRes.status === 200 && typeof loginRes.data.token === 'string', 'Axios POST /api/admin/login returns JWT token');

    // 9. Authenticated GET /admin/stats
    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    const statsRes = await client.get('/admin/stats', { headers: authHeaders });
    assert(statsRes.status === 200 && typeof statsRes.data.total === 'number', `Axios GET /api/admin/stats returns statistics (total members: ${statsRes.data.total})`);

    // 10. Authenticated GET /admin/me
    const meRes = await client.get('/admin/me', { headers: authHeaders });
    assert(meRes.status === 200 && meRes.data.username === 'admin', 'Axios GET /api/admin/me returns authenticated admin user');

    // 11. Authenticated GET /admin/members
    const adminMembersRes = await client.get('/admin/members', { headers: authHeaders });
    assert(adminMembersRes.status === 200 && Array.isArray(adminMembersRes.data.members), `Axios GET /api/admin/members returns admin members list (count: ${adminMembersRes.data.members.length})`);

    // 12. Authenticated PATCH /admin/members/:id/active
    if (adminMembersRes.data.members.length > 0) {
      const testMember = adminMembersRes.data.members[0];
      const nextActive = testMember.is_active === 1 ? 0 : 1;
      const toggleRes = await client.patch(`/admin/members/${testMember.id}/active`, { is_active: nextActive }, { headers: authHeaders });
      assert(toggleRes.status === 200 && toggleRes.data.is_active === nextActive, `Axios PATCH /api/admin/members/:id/active toggled active status`);
    }

    // 13. Authenticated GET /admin/payments
    const paymentsRes = await client.get('/admin/payments', { headers: authHeaders });
    assert(paymentsRes.status === 200 && Array.isArray(paymentsRes.data.payments), `Axios GET /api/admin/payments returns payment records (total: ${paymentsRes.data.total})`);

    // 14. Authenticated GET /admin/cms/enquiries
    const enquiriesRes = await client.get('/admin/cms/enquiries', { headers: authHeaders });
    assert(enquiriesRes.status === 200 && Array.isArray(enquiriesRes.data), `Axios GET /api/admin/cms/enquiries returns contact enquiries (count: ${enquiriesRes.data.length})`);

    // 15. Authenticated GET /admin/audit-logs
    const auditRes = await client.get('/admin/audit-logs', { headers: authHeaders });
    assert(auditRes.status === 200 && Array.isArray(auditRes.data.logs), `Axios GET /api/admin/audit-logs returns security audit logs (count: ${auditRes.data.logs.length})`);

    console.log(`\n======================================================`);
    console.log(`🎉 ALL ${passed} AXIOS INTEGRATION CHECKS PASSED (${failed} failed)`);
    console.log(`======================================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Integration test failure:', err);
    process.exit(1);
  }
}

run();

