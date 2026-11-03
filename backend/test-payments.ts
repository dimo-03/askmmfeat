import process from 'node:process';
process.env.NODE_ENV = 'test';
process.env.SKIP_LISTEN = 'true';

import http from 'node:http';

async function runPaymentTests() {
  console.log('\n===============================================================');
  console.log('💳 TESTING PAYMENT METHODS: CASH & ONLINE (RAZORPAY)');
  console.log('===============================================================\n');

  const { app } = await import('./src/server');
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address() as { port: number };
  const base = `http://127.0.0.1:${addr.port}`;
  console.log(`📡 Backend connected on ${base}\n`);

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
    // 0. Setup: Admin Login & Register a Test Member
    // -------------------------------------------------------------------------
    const loginRes = await fetch(`${base}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'ChangeMe123!' }),
    });
    const loginData = await loginRes.json() as { token: string };
    const authHeaders = { Authorization: `Bearer ${loginData.token}` };

    const memberName = `PaymentUser_${Date.now()}`;
    const form = new FormData();
    form.append('name', memberName);
    form.append('email', `${memberName.toLowerCase()}@example.org`);
    form.append('mobile', '+91 91234 56789');
    form.append('category', 'Annual');
    form.append('payment_method', 'cash');

    const regRes = await fetch(`${base}/api/register`, { method: 'POST', body: form });
    const regData = await regRes.json() as { membership_id: string; payment_method: string; payment_status: string };
    const membershipId = regData.membership_id;

    assert(regRes.status === 201, 'Test member registered successfully');
    assert(regData.payment_method === 'cash' && regData.payment_status === 'Pending', 'Member initialized with cash method and Pending status');

    // -------------------------------------------------------------------------
    // 1. Config Endpoint
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Check Config for Payment Methods ---');
    const configRes = await fetch(`${base}/api/config`);
    const cfg = await configRes.json() as { paymentMethods: string[]; razorpay: { enabled: boolean; keyId: string } };
    assert(cfg.paymentMethods.includes('cash') && cfg.paymentMethods.includes('online'), 'Config provides both "cash" and "online" payment methods');
    assert(typeof cfg.razorpay === 'object', 'Config provides Razorpay gateway info');

    // -------------------------------------------------------------------------
    // 2. CASH PAYMENT METHOD
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Test Cash Payment Flow ---');
    const cashReceipt = `CASH-REC-${Date.now()}`;
    const cashRes = await fetch(`${base}/api/payments/cash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membership_id: membershipId,
        amount: 1500,
        reference_id: cashReceipt,
        notes: 'Cash collected by desk agent',
      }),
    });
    const cashJson = await cashRes.json() as {
      success: boolean;
      payment: { method: string; amount: number; status: string; reference_id: string };
      member: { payment_method: string; payment_status: string; payment_amount: number; payment_reference: string };
    };

    assert(cashRes.status === 200, 'POST /api/payments/cash returns 200 OK');
    assert(cashJson.success === true, 'Cash payment response indicates success: true');
    assert(cashJson.payment.method === 'cash' && cashJson.payment.status === 'Paid', 'Payment record method is cash and status is Paid');
    assert(cashJson.member.payment_status === 'Paid' && cashJson.member.payment_reference === cashReceipt, 'Member record updated with Paid cash receipt');

    // -------------------------------------------------------------------------
    // 3. ONLINE PAYMENT (RAZORPAY) METHOD
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Test Online (Razorpay) Payment Flow ---');

    // A. Create Online Order
    const orderRes = await fetch(`${base}/api/payments/razorpay/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membership_id: membershipId,
        amount: 2500,
        notes: 'Annual Membership Renewal',
      }),
    });
    const orderData = await orderRes.json() as {
      order_id: string;
      amount: number;
      currency: string;
      method: string;
    };

    assert(orderRes.status === 200, 'POST /api/payments/razorpay/order returns 200 OK');
    assert(typeof orderData.order_id === 'string' && orderData.order_id.length > 5, `Razorpay Order ID generated: ${orderData.order_id}`);
    assert(orderData.amount === 250000 && orderData.currency === 'INR', 'Amount converted correctly to paise (2500 INR = 250000 paise)');
    assert(orderData.method === 'online', 'Order method is marked online');

    // B. Verify Online Payment
    const testPaymentId = `pay_rzp_test_${Date.now()}`;
    const verifyRes = await fetch(`${base}/api/payments/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membership_id: membershipId,
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: testPaymentId,
      }),
    });
    const verifyData = await verifyRes.json() as { success: boolean; status: string; method: string; payment_id: string };

    assert(verifyRes.status === 200, 'POST /api/payments/razorpay/verify returns 200 OK');
    assert(verifyData.success === true && verifyData.status === 'Paid', 'Online payment verified and marked Paid');
    assert(verifyData.payment_id === testPaymentId, 'Razorpay payment ID recorded');

    // Check member record reflects online payment
    const checkMemberRes = await fetch(`${base}/api/admin/members?q=${encodeURIComponent(memberName)}`, { headers: authHeaders });
    const checkMemberJson = await checkMemberRes.json() as { members: Array<{ payment_method: string; payment_status: string; payment_reference: string }> };
    const memberAfterOnline = checkMemberJson.members[0];

    assert(memberAfterOnline && memberAfterOnline.payment_method === 'online', 'Member payment method updated to "online"');
    assert(memberAfterOnline && memberAfterOnline.payment_status === 'Paid', 'Member payment status is "Paid"');
    assert(memberAfterOnline && memberAfterOnline.payment_reference === testPaymentId, 'Member reference points to Razorpay payment ID');

    // -------------------------------------------------------------------------
    // 4. ADMIN PAYMENT MANAGEMENT & LOGS
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Admin Payment Management ---');

    // Admin view payment history list
    const adminPaymentsRes = await fetch(`${base}/api/admin/payments`, { headers: authHeaders });
    const adminPayments = await adminPaymentsRes.json() as { total: number; payments: Array<{ method: string; status: string; reference_id: string }> };

    assert(adminPaymentsRes.status === 200, 'GET /api/admin/payments returns 200 OK');
    assert(adminPayments.total >= 2, `Admin payments ledger contains logged payments (found: ${adminPayments.total})`);
    assert(adminPayments.payments.some(p => p.method === 'cash'), 'Payments ledger contains Cash transactions');
    assert(adminPayments.payments.some(p => p.method === 'online'), 'Payments ledger contains Online Razorpay transactions');

    // Admin direct payment patch
    const memberObjRes = await fetch(`${base}/api/admin/members?q=${encodeURIComponent(memberName)}`, { headers: authHeaders });
    const memberObj = (await memberObjRes.json() as { members: Array<{ id: number }> }).members[0];

    const adminPatchPay = await fetch(`${base}/api/admin/members/${memberObj.id}/payment`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_method: 'cash',
        payment_status: 'Paid',
        payment_amount: 5000,
        payment_reference: 'ADMIN-CASH-RECEIPT-500',
        notes: 'Full life membership payment in cash',
      }),
    });
    const patchedMember = await adminPatchPay.json() as { payment_amount: number; payment_reference: string };
    assert(adminPatchPay.status === 200, 'PATCH /api/admin/members/:id/payment returns 200 OK');
    assert(patchedMember.payment_amount === 5000 && patchedMember.payment_reference === 'ADMIN-CASH-RECEIPT-500', 'Admin successfully updated payment amount & reference');

  } finally {
    server.close();
  }

  console.log('\n===============================================================');
  console.log(`📊 FINAL PAYMENT TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) process.exit(1);
}

runPaymentTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
