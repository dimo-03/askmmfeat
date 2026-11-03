import process from 'node:process';
process.env.NODE_ENV = 'test';
process.env.SKIP_LISTEN = 'true';

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

async function runCrudTest() {
  console.log('\n===============================================================');
  console.log('🔍 COMPREHENSIVE CRUD VERIFICATION FOR MEMBERSHIP BACKEND');
  console.log('===============================================================\n');

  const { app } = await import('./src/server');
  const { db } = await import('./src/db');
  const { UPLOAD_DIR } = await import('./src/middleware');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address() as { port: number };
  const base = `http://127.0.0.1:${addr.port}`;
  console.log(`📡 Backend API connected on ${base}\n`);

  let totalSteps = 0;
  let passedSteps = 0;

  function report(title: string, ok: boolean, data?: unknown) {
    totalSteps++;
    if (ok) {
      passedSteps++;
      console.log(`[PASS] ${title}`);
      if (data) {
        console.log(`       Data:`, JSON.stringify(data, null, 2).split('\n').join('\n       '));
      }
    } else {
      console.error(`[FAIL] ${title}`);
      if (data) console.error(`       Error details:`, data);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 0. AUTHENTICATE ADMIN FOR CRUD OPERATIONS
    // -------------------------------------------------------------------------
    console.log('🔑 Step 0: Admin Authentication');
    const loginRes = await fetch(`${base}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'ChangeMe123!' }),
    });
    const loginJson = await loginRes.json() as { token: string };
    const authHeaders = { Authorization: `Bearer ${loginJson.token}` };
    report('Admin login token retrieved', loginRes.status === 200 && !!loginJson.token, { token_prefix: loginJson.token.slice(0, 15) + '...' });

    // -------------------------------------------------------------------------
    // 1. CREATE (POST)
    // -------------------------------------------------------------------------
    console.log('\n---------------------------------------------------------------');
    console.log('➕ Step 1: CREATE OPERATION');
    console.log('---------------------------------------------------------------');

    // 1A. Create via Admin with Photo Upload
    const adminCreateForm = new FormData();
    const timestamp = Date.now();
    adminCreateForm.append('name', `Suresh Chandra Jena ${timestamp}`);
    adminCreateForm.append('email', `suresh.jena.${timestamp}@example.com`);
    adminCreateForm.append('mobile', '+91 94370 88990');
    adminCreateForm.append('category', 'Life');
    adminCreateForm.append('designation', 'Chief Technical Officer');
    adminCreateForm.append('organization', 'Odisha Tech Hub');
    adminCreateForm.append('location', 'Bhubaneswar, Odisha');
    adminCreateForm.append('address', 'Plot 45, Chandrasekharpur, Bhubaneswar');
    adminCreateForm.append('gender', 'Male');
    adminCreateForm.append('date_of_birth', '1985-06-20');
    adminCreateForm.append('validity_start', '2026-01-01');
    adminCreateForm.append('validity_end', '2046-12-31');
    adminCreateForm.append('notes', 'VIP Founding Member');
    adminCreateForm.append('membership_status', 'Approved');
    adminCreateForm.append('is_active', '1');

    // Attach test photo
    const photoContent = 'fake-photo-binary-data-1';
    const photoBlob1 = new Blob([photoContent], { type: 'image/jpeg' });
    adminCreateForm.append('photo', photoBlob1, 'suresh_photo.jpg');

    const createRes = await fetch(`${base}/api/admin/members`, {
      method: 'POST',
      headers: authHeaders,
      body: adminCreateForm,
    });
    const createdMember = await createRes.json() as {
      id: number;
      membership_id: string;
      name: string;
      email: string;
      category: string;
      photo: string;
      is_active: number;
      membership_status: string;
    };

    report('CREATE: Admin added new member with photo', createRes.status === 201 && createdMember.id > 0, {
      id: createdMember.id,
      membership_id: createdMember.membership_id,
      name: createdMember.name,
      category: createdMember.category,
      photo: createdMember.photo,
      is_active: createdMember.is_active,
      membership_status: createdMember.membership_status,
    });

    // Verify photo was written to disk in uploads directory
    const photoFilename1 = path.basename(createdMember.photo);
    const photoPath1 = path.join(UPLOAD_DIR, photoFilename1);
    const photoExists1 = fs.existsSync(photoPath1);
    report('CREATE VERIFICATION: Photo file created in uploads folder', photoExists1, { file: photoFilename1, path: photoPath1 });

    const memberId = createdMember.id;

    // -------------------------------------------------------------------------
    // 2. READ (GET)
    // -------------------------------------------------------------------------
    console.log('\n---------------------------------------------------------------');
    console.log('📖 Step 2: READ OPERATION');
    console.log('---------------------------------------------------------------');

    // 2A. Read Single Member by ID (GET /api/admin/members/:id)
    const readSingleRes = await fetch(`${base}/api/admin/members/${memberId}`, { headers: authHeaders });
    const singleMember = await readSingleRes.json() as Record<string, unknown>;
    report('READ: Single member retrieved by ID (/api/admin/members/:id)', readSingleRes.status === 200 && singleMember.id === memberId, {
      id: singleMember.id,
      name: singleMember.name,
      designation: singleMember.designation,
      organization: singleMember.organization,
      location: singleMember.location,
      email: singleMember.email,
      mobile: singleMember.mobile,
      validity: `${singleMember.validity_start} to ${singleMember.validity_end}`,
    });

    // 2B. Read Public Member Directory (GET /api/members)
    const readDirRes = await fetch(`${base}/api/members?q=${encodeURIComponent(createdMember.name)}`);
    const dirJson = await readDirRes.json() as { total: number; members: Array<{ id: number; name: string }> };
    report('READ: Public directory search finds member (/api/members?q=...)', readDirRes.status === 200 && dirJson.members.length > 0, {
      matches: dirJson.total,
      first_match: dirJson.members[0],
    });

    // 2C. Read with Category Filter (GET /api/members?category=Life)
    const readCatRes = await fetch(`${base}/api/members?category=Life`);
    const catJson = await readCatRes.json() as { members: Array<{ category: string }> };
    report('READ: Filter by category (/api/members?category=Life)', readCatRes.status === 200 && catJson.members.every(m => m.category === 'Life'), {
      count: catJson.members.length,
    });

    // -------------------------------------------------------------------------
    // 3. UPDATE (PUT & PATCH)
    // -------------------------------------------------------------------------
    console.log('\n---------------------------------------------------------------');
    console.log('✏️ Step 3: UPDATE OPERATION');
    console.log('---------------------------------------------------------------');

    // 3A. Update Details via PUT (changing designation, location, and validity)
    const updateRes = await fetch(`${base}/api/admin/members/${memberId}`, {
      method: 'PUT',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        designation: 'Senior Vice President of Technology',
        location: 'Puri, Odisha',
        organization: 'Global Innovation Labs',
        validity_end: '2050-12-31',
      }),
    });
    const updatedMember = await updateRes.json() as { designation: string; location: string; validity_end: string; organization: string };
    report('UPDATE: Details updated via PUT', updateRes.status === 200 && updatedMember.designation === 'Senior Vice President of Technology', {
      new_designation: updatedMember.designation,
      new_location: updatedMember.location,
      new_org: updatedMember.organization,
      new_validity_end: updatedMember.validity_end,
    });

    // 3B. Update Photo via PUT (replaces existing photo with a new one)
    const updatePhotoForm = new FormData();
    const photoBlob2 = new Blob(['fake-new-photo-binary-data-2'], { type: 'image/png' });
    updatePhotoForm.append('photo', photoBlob2, 'new_avatar.png');

    const updatePhotoRes = await fetch(`${base}/api/admin/members/${memberId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: updatePhotoForm,
    });
    const photoUpdatedMember = await updatePhotoRes.json() as { photo: string };
    const photoFilename2 = path.basename(photoUpdatedMember.photo);
    const photoPath2 = path.join(UPLOAD_DIR, photoFilename2);

    report('UPDATE: Photo replaced via PUT', updatePhotoRes.status === 200 && photoFilename2 !== photoFilename1, {
      old_photo: photoFilename1,
      new_photo: photoFilename2,
    });

    // Verify old photo was deleted and new photo exists on disk
    const oldPhotoExists = fs.existsSync(photoPath1);
    const newPhotoExists = fs.existsSync(photoPath2);
    report('UPDATE VERIFICATION: Old photo unlinked & new photo saved on disk', !oldPhotoExists && newPhotoExists, {
      old_photo_deleted: !oldPhotoExists,
      new_photo_created: newPhotoExists,
    });

    // 3C. Quick Category Change via PATCH
    const patchCatRes = await fetch(`${base}/api/admin/members/${memberId}/category`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'Corporate' }),
    });
    const patchCatMember = await patchCatRes.json() as { category: string };
    report('UPDATE: Category changed to Corporate via PATCH', patchCatRes.status === 200 && patchCatMember.category === 'Corporate', {
      new_category: patchCatMember.category,
    });

    // 3D. Quick Status Change via PATCH
    const patchStatusRes = await fetch(`${base}/api/admin/members/${memberId}/status`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ membership_status: 'Suspended' }),
    });
    const patchStatusMember = await patchStatusRes.json() as { membership_status: string };
    report('UPDATE: Status changed to Suspended via PATCH', patchStatusRes.status === 200 && patchStatusMember.membership_status === 'Suspended', {
      new_status: patchStatusMember.membership_status,
    });

    // 3E. 1-Click Activate / Deactivate via PATCH
    const patchActiveRes = await fetch(`${base}/api/admin/members/${memberId}/active`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: false }),
    });
    const patchActiveMember = await patchActiveRes.json() as { is_active: number };
    report('UPDATE: Deactivated via PATCH (is_active: 0)', patchActiveRes.status === 200 && patchActiveMember.is_active === 0, {
      is_active: patchActiveMember.is_active,
    });

    // Reactivate
    const patchReactivateRes = await fetch(`${base}/api/admin/members/${memberId}/active`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: true }),
    });
    const reactivatedMember = await patchReactivateRes.json() as { is_active: number };
    report('UPDATE: Reactivated via PATCH (is_active: 1)', patchReactivateRes.status === 200 && reactivatedMember.is_active === 1, {
      is_active: reactivatedMember.is_active,
    });

    // -------------------------------------------------------------------------
    // 4. DELETE (DELETE)
    // -------------------------------------------------------------------------
    console.log('\n---------------------------------------------------------------');
    console.log('🗑️ Step 4: DELETE OPERATION');
    console.log('---------------------------------------------------------------');

    const deleteRes = await fetch(`${base}/api/admin/members/${memberId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const deleteJson = await deleteRes.json() as { message: string };
    report('DELETE: Member deleted via DELETE /api/admin/members/:id', deleteRes.status === 200 && deleteJson.message === 'Member deleted.', deleteJson);

    // Verify 404 on subsequent read
    const verifyDeleteRes = await fetch(`${base}/api/admin/members/${memberId}`, { headers: authHeaders });
    report('DELETE VERIFICATION: Subsequent GET returns 404 Not Found', verifyDeleteRes.status === 404);

    // Verify photo was also removed from disk
    const photoAfterDeleteExists = fs.existsSync(photoPath2);
    report('DELETE VERIFICATION: Photo file deleted from uploads folder', !photoAfterDeleteExists, {
      photo_path: photoPath2,
      file_exists: photoAfterDeleteExists,
    });

    // Verify database row is completely gone
    const dbRow = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);
    report('DELETE VERIFICATION: Database record completely removed from SQLite', dbRow === undefined);

  } finally {
    server.close();
  }

  console.log('\n===============================================================');
  console.log(`📊 FINAL CRUD VERIFICATION RESULT: ${passedSteps} / ${totalSteps} PASSED`);
  console.log('===============================================================\n');

  if (passedSteps !== totalSteps) {
    process.exit(1);
  }
}

runCrudTest().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

