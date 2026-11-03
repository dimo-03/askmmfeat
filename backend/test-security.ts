import process from 'node:process';
process.env.NODE_ENV = 'test';
process.env.SKIP_LISTEN = 'true';

import http from 'node:http';

async function run() {
  console.log('\n======================================================');
  console.log('🔒 VERIFYING BACKEND SECURITY & HARDENING SUITE');
  console.log('======================================================\n');

  const { app } = await import('./src/server');
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address() as { port: number };
  const base = `http://127.0.0.1:${addr.port}`;

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
    // 1. Enhanced Health Check
    // -------------------------------------------------------------------------
    console.log('--- 1. Enhanced Health Check (/api/health) ---');
    const resHealth = await fetch(`${base}/api/health`);
    const healthData = await resHealth.json() as {
      status: string;
      database: { status: string; total_members: number };
      memory_usage_mb: { rss: number; heap_used: number };
    };
    assert(resHealth.status === 200, 'GET /api/health returns 200');
    assert(healthData.status === 'healthy', 'Health check status is "healthy"');
    assert(healthData.database.status === 'connected', 'Database status is "connected"');
    assert(typeof healthData.memory_usage_mb.rss === 'number', 'Reports memory usage');

    // -------------------------------------------------------------------------
    // 2. Admin Login & JTI-backed Token
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Admin Authentication & Token JTI ---');
    const resLogin = await fetch(`${base}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'ChangeMe123!' }),
    });
    const loginData = await resLogin.json() as { token: string; username: string };
    assert(resLogin.status === 200, 'Admin login succeeds');
    const token = loginData.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    const resMe = await fetch(`${base}/api/admin/me`, { headers: authHeaders });
    const meData = await resMe.json() as { username: string };
    assert(resMe.status === 200 && meData.username === 'admin', 'GET /api/admin/me returns admin identity');

    // -------------------------------------------------------------------------
    // 3. XSS Sanitization Defense
    // -------------------------------------------------------------------------
    console.log('\n--- 3. XSS & Script Injection Sanitization ---');
    const xssPayloadName = `Hacker<script>alert("XSS")</script>_Sanitized`;
    const form = new FormData();
    form.append('name', xssPayloadName);
    form.append('mobile', '+91 91234 56789');
    form.append('email', 'sanitized@example.org');
    form.append('category', 'Student');
    form.append('notes', 'Clean text <script>evil()</script> javascript:void(0)');

    const resXss = await fetch(`${base}/api/register`, { method: 'POST', body: form });
    const regResult = await resXss.json() as { membership_id: string };
    assert(resXss.status === 201, 'Registration with script tag processed safely');

    // Check that admin view has sanitized the name
    const resAdminFind = await fetch(`${base}/api/admin/members?q=Sanitized`, { headers: authHeaders });
    const adminFindData = await resAdminFind.json() as { members: Array<{ name: string; notes: string }> };
    const savedMember = adminFindData.members.find(m => m.name.includes('Sanitized'));
    assert(savedMember !== undefined, 'Found registered member in admin database');
    assert(!savedMember?.name.includes('<script>'), 'Script tag stripped from member name');
    assert(!savedMember?.notes.includes('<script>'), 'Script tag stripped from member notes');

    // -------------------------------------------------------------------------
    // 4. File Upload Magic Bytes Protection
    // -------------------------------------------------------------------------
    console.log('\n--- 4. File Upload Magic Bytes Enforcement ---');
    const maliciousForm = new FormData();
    maliciousForm.append('name', 'Malicious User');
    maliciousForm.append('mobile', '+91 99999 88888');
    maliciousForm.append('email', 'malicious@example.org');
    maliciousForm.append('category', 'Student');

    // Fake executable disguised as photo.jpg
    const maliciousBlob = new Blob(['MZ\x90\x00\x03\x00\x00\x00DOS_HEADER_FAKE_EXE_FILE'], { type: 'image/jpeg' });
    maliciousForm.append('photo', maliciousBlob, 'trojan.jpg');

    const resMalicious = await fetch(`${base}/api/register`, { method: 'POST', body: maliciousForm });
    const maliciousResult = await resMalicious.json() as { errors?: string[] };
    assert(resMalicious.status === 400, 'Rejects disguised executable with status 400');
    assert(
      Array.isArray(maliciousResult.errors) && maliciousResult.errors[0].includes('not a valid image'),
      'Returns clean error explaining magic bytes validation failure'
    );

    // -------------------------------------------------------------------------
    // 5. Password Complexity & Invalidation
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Password Complexity & Policy Enforcement ---');
    // Weak password attempt (too short)
    const resWeak1 = await fetch(`${base}/api/admin/password`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: 'ChangeMe123!', next: 'weak' }),
    });
    assert(resWeak1.status === 400, 'Rejects password shorter than 8 chars');

    // Weak password attempt (no uppercase or numbers)
    const resWeak2 = await fetch(`${base}/api/admin/password`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: 'ChangeMe123!', next: 'alllowercaseletters' }),
    });
    assert(resWeak2.status === 400, 'Rejects password without uppercase and numbers');

    // -------------------------------------------------------------------------
    // 6. Audit Trail Logging & Inspection
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Audit Trail Logging (/api/admin/audit-logs) ---');
    const resLogs = await fetch(`${base}/api/admin/audit-logs`, { headers: authHeaders });
    const logsData = await resLogs.json() as { total: number; logs: Array<{ action: string; admin_user: string }> };
    assert(resLogs.status === 200, 'GET /api/admin/audit-logs returns 200');
    assert(logsData.total > 0, `Audit logs recorded (total: ${logsData.total})`);
    assert(
      logsData.logs.some(l => l.action === 'ADMIN_LOGIN_SUCCESS'),
      'Audit logs record ADMIN_LOGIN_SUCCESS event'
    );

    // -------------------------------------------------------------------------
    // 7. Database Point-in-time Backup Snapshot
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Database Point-in-Time Backup (/api/admin/backup) ---');
    const resBackup = await fetch(`${base}/api/admin/backup`, { headers: authHeaders });
    assert(resBackup.status === 200, 'GET /api/admin/backup returns 200');
    const backupContent = await resBackup.arrayBuffer();
    const backupHeader = new Uint8Array(backupContent.slice(0, 16));
    const isSqlite = String.fromCharCode(...backupHeader).startsWith('SQLite format 3');
    assert(isSqlite, 'Downloaded backup is a valid SQLite format 3 database');

    // -------------------------------------------------------------------------
    // 8. Token Revocation on Logout
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Token Revocation / Blacklist on Logout ---');
    const resLogout = await fetch(`${base}/api/admin/logout`, {
      method: 'POST',
      headers: authHeaders,
    });
    const logoutData = await resLogout.json() as { success: boolean; message: string };
    assert(resLogout.status === 200 && logoutData.success, 'POST /api/admin/logout succeeds');

    // Try accessing protected route with revoked token
    const resAfterLogout = await fetch(`${base}/api/admin/stats`, { headers: authHeaders });
    assert(resAfterLogout.status === 401, 'Revoked token is rejected with status 401');

  } finally {
    server.close();
  }

  console.log('\n======================================================');
  console.log(`📊 SECURITY TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error during security test run:', err);
  process.exit(1);
});

