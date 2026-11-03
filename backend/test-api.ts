import process from 'node:process';
process.env.NODE_ENV = 'test';
process.env.SKIP_LISTEN = 'true';

import http from 'node:http';

async function run() {
  console.log('\n======================================================');
  console.log('🧪 STARTING COMPREHENSIVE MEMBERSHIP API TEST SUITE');
  console.log('======================================================\n');

  const { app } = await import('./src/server');
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address() as { port: number };
  const base = `http://127.0.0.1:${addr.port}`;
  console.log(`Test server running on ${base}\n`);

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
    // -------------------------------------------------------------------------
    // 1. Health check & Config
    // -------------------------------------------------------------------------
    console.log('--- 1. Health Check & Config ---');
    const resHealth = await fetch(`${base}/`);
    const health = await resHealth.json() as { status: string; service: string };
    assert(resHealth.status === 200 && health.status === 'ok', 'GET / returns 200 OK');

    const resConfig = await fetch(`${base}/api/config`);
    const cfg = await resConfig.json() as { categories: string[]; membershipStatuses: string[] };
    assert(resConfig.status === 200, 'GET /api/config returns 200');
    assert(Array.isArray(cfg.categories) && cfg.categories.includes('Life'), 'Categories include "Life"');
    assert(cfg.membershipStatuses.includes('Approved') && cfg.membershipStatuses.includes('Pending'), 'Statuses include Approved and Pending');

    // -------------------------------------------------------------------------
    // 2. Public Member Directory
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Public Member Directory ---');
    const resDir = await fetch(`${base}/api/members`);
    const dir = await resDir.json() as { total: number; members: Array<Record<string, unknown>> };
    assert(resDir.status === 200, 'GET /api/members returns 200');
    assert(dir.total > 0, `Directory contains members (total: ${dir.total})`);

    const sample = dir.members[0];
    assert(sample && 'membership_id' in sample, 'Directory members have membership_id');
    assert('name' in sample && 'category' in sample && 'is_active' in sample, 'Directory members have name, category, and is_active');
    assert(!('password_hash' in sample), 'Directory hides private internal credentials');

    // Filter by category
    const resFilterCat = await fetch(`${base}/api/members?category=Life`);
    const dirCat = await resFilterCat.json() as { members: Array<{ category: string }> };
    assert(dirCat.members.every(m => m.category === 'Life'), 'Filter by category=Life returns only Life members');

    // Search query
    const resSearch = await fetch(`${base}/api/members?q=Dibyajyoti`);
    const dirSearch = await resSearch.json() as { members: Array<{ name: string }> };
    assert(dirSearch.members.some(m => m.name.includes('Dibyajyoti')), 'Search by name "Dibyajyoti" finds member');

    // -------------------------------------------------------------------------
    // 3. Member Self-Registration
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Member Registration (POST /api/register) ---');
    const testName = `TestMember_${Date.now()}`;
    const form = new FormData();
    form.append('name', testName);
    form.append('mobile', '+91 94371 99887');
    form.append('email', `${testName.toLowerCase()}@example.org`);
    form.append('category', 'Student');
    form.append('designation', 'Student Researcher');
    form.append('organization', 'IIT Bhubaneswar');
    form.append('location', 'Bhubaneswar, Odisha');
    form.append('gender', 'Female');
    form.append('date_of_birth', '2002-04-12');
    form.append('notes', 'Interested in membership portal events');

    // Attach sample photo file
    const fakePhotoBlob = new Blob(['sample-fake-photo-binary-content'], { type: 'image/jpeg' });
    form.append('photo', fakePhotoBlob, 'avatar.jpg');

    const resReg = await fetch(`${base}/api/register`, { method: 'POST', body: form });
    const regResult = await resReg.json() as { message: string; membership_id: string };
    assert(resReg.status === 201, 'POST /api/register returns 201 Created');
    assert(typeof regResult.membership_id === 'string' && regResult.membership_id.startsWith('MEM-'), `Assigned Membership ID: ${regResult.membership_id}`);

    // Verify self-registered member is Pending (hidden from public directory)
    const resCheckPub = await fetch(`${base}/api/members?q=${encodeURIComponent(testName)}`);
    const checkPub = await resCheckPub.json() as { members: Array<{ name: string }> };
    assert(checkPub.members.length === 0, 'Self-registered member is initially Pending and not visible in public directory');

    // -------------------------------------------------------------------------
    // 4. Admin Authentication
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Admin Authentication ---');
    const resLogin = await fetch(`${base}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'ChangeMe123!' }),
    });
    const loginData = await resLogin.json() as { token: string; username: string };
    assert(resLogin.status === 200, 'POST /api/admin/login succeeds with status 200');
    assert(typeof loginData.token === 'string' && loginData.token.length > 20, 'Admin JWT token received');

    const authHeaders = { Authorization: `Bearer ${loginData.token}` };

    // -------------------------------------------------------------------------
    // 5. Admin Stats & View All Members
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Admin Dashboard & Member List ---');
    const resStats = await fetch(`${base}/api/admin/stats`, { headers: authHeaders });
    const stats = await resStats.json() as { total: number; active: number; inactive: number; pending: number };
    assert(resStats.status === 200, 'GET /api/admin/stats returns 200');
    assert(stats.pending >= 1, `Pending member count accurately reflects registration (${stats.pending} pending)`);

    const resAdminList = await fetch(`${base}/api/admin/members?q=${encodeURIComponent(testName)}`, { headers: authHeaders });
    const adminList = await resAdminList.json() as { total: number; members: Array<Record<string, unknown>> };
    assert(resAdminList.status === 200, 'GET /api/admin/members returns 200');

    // Find the newly registered member
    const newMember = adminList.members.find(m => m.name === testName);
    assert(newMember !== undefined, `Admin list includes the registered member "${testName}"`);
    assert(newMember && newMember.membership_status === 'Pending' && newMember.is_active === 0, 'New member status is Pending and is_active is 0');
    assert(newMember && typeof newMember.photo === 'string' && (newMember.photo as string).includes('/uploads/'), 'Member photo URL is stored and served');

    // -------------------------------------------------------------------------
    // 6. Admin Member Actions (Approve, Edit, Change Category, Change Status)
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Admin Actions (Activate, Category, Status, Edit, Delete) ---');
    const newMemberId = newMember!.id as number;

    // A. 1-Click Activate (which also approves pending members)
    const resActive = await fetch(`${base}/api/admin/members/${newMemberId}/active`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: true }),
    });
    const activeMember = await resActive.json() as { is_active: number; membership_status: string };
    assert(resActive.status === 200, 'PATCH /api/admin/members/:id/active returns 200');
    assert(activeMember.is_active === 1 && activeMember.membership_status === 'Approved', 'Activating pending member marks them Active and Approved');

    // Now verify member is visible in public directory
    const resCheckPubAfter = await fetch(`${base}/api/members?q=${encodeURIComponent(testName)}`);
    const checkPubAfter = await resCheckPubAfter.json() as { members: Array<{ name: string }> };
    assert(checkPubAfter.members.length === 1, 'Approved active member now appears in public Member Directory');

    // B. Change Category
    const resCat = await fetch(`${base}/api/admin/members/${newMemberId}/category`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'Life' }),
    });
    const catMember = await resCat.json() as { category: string };
    assert(resCat.status === 200, 'PATCH /api/admin/members/:id/category returns 200');
    assert(catMember.category === 'Life', 'Member category successfully updated to Life');

    // C. Update Status
    const resStatus = await fetch(`${base}/api/admin/members/${newMemberId}/status`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ membership_status: 'Suspended' }),
    });
    const statusMember = await resStatus.json() as { membership_status: string };
    assert(resStatus.status === 200, 'PATCH /api/admin/members/:id/status returns 200');
    assert(statusMember.membership_status === 'Suspended', 'Member status updated to Suspended');

    // D. Edit Details (PUT)
    const resEdit = await fetch(`${base}/api/admin/members/${newMemberId}`, {
      method: 'PUT',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        designation: 'Lead Research Scientist',
        location: 'Cuttack, Odisha',
        validity_start: '2026-01-01',
        validity_end: '2030-12-31',
      }),
    });
    const edited = await resEdit.json() as { designation: string; location: string; validity_end: string };
    assert(resEdit.status === 200, 'PUT /api/admin/members/:id returns 200');
    assert(edited.designation === 'Lead Research Scientist' && edited.location === 'Cuttack, Odisha', 'Member designation and location updated');
    assert(edited.validity_end === '2030-12-31', 'Member validity dates updated');

    // E. Add New Member directly as Admin
    const adminAddName = `AdminAdded_${Date.now()}`;
    const adminAddForm = new FormData();
    adminAddForm.append('name', adminAddName);
    adminAddForm.append('email', `${adminAddName.toLowerCase()}@example.com`);
    adminAddForm.append('mobile', '+91 98610 55443');
    adminAddForm.append('category', 'Corporate');
    adminAddForm.append('designation', 'Director of Operations');
    adminAddForm.append('location', 'Rourkela, Odisha');
    adminAddForm.append('validity_start', '2026-01-01');
    adminAddForm.append('validity_end', '2028-12-31');

    const resAdminAdd = await fetch(`${base}/api/admin/members`, {
      method: 'POST',
      headers: authHeaders,
      body: adminAddForm,
    });
    const addedMember = await resAdminAdd.json() as { id: number; name: string; is_active: number; membership_status: string };
    assert(resAdminAdd.status === 201, 'POST /api/admin/members directly creates member with 201 Created');
    assert(addedMember.is_active === 1 && addedMember.membership_status === 'Approved', 'Admin-created member defaults to Approved and Active');

    // F. Export CSV
    const resCsv = await fetch(`${base}/api/admin/members/export.csv`, { headers: authHeaders });
    const csvText = await resCsv.text();
    assert(resCsv.status === 200, 'GET /api/admin/members/export.csv returns 200');
    assert(csvText.includes('membership_id') && csvText.includes(testName), 'CSV export includes headers and member data');

    // G. Delete Member
    const resDelete = await fetch(`${base}/api/admin/members/${addedMember.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const delResult = await resDelete.json() as { message: string };
    assert(resDelete.status === 200 && delResult.message === 'Member deleted.', 'DELETE /api/admin/members/:id deletes member');

    const resVerifyDel = await fetch(`${base}/api/admin/members/${addedMember.id}`, { headers: authHeaders });
    assert(resVerifyDel.status === 404, 'Deleted member returns 404 Not Found');

  } finally {
    server.close();
  }

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
