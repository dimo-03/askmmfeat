# Membership Backend (REST API, TypeScript)

Backend REST API for the Membership & Foundation Portal built with Node.js, Express, TypeScript, and SQLite (native `node:sqlite`).

---

## 🚀 Running the Backend

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (auto-restarts on changes)
npm run dev
# Server runs on: http://localhost:3001

# 3. Run automated tests (CRUD & Payment methods)
npm test

# 4. Compile and run production build
npm run build
npm start
```

### Default Admin Credentials (for testing)
- **Username:** `admin`
- **Password:** `ChangeMe123!` (or value configured in `.env`)

---

## 💳 Payment Integration Guide (Cash & Online Razorpay)

The backend natively supports two payment methods:
1. **`cash`**: For in-person, cash-at-office, or manual receipt payments.
2. **`online`**: For online payments powered by **Razorpay** (UPI, Credit/Debit cards, NetBanking, Wallets).

### Setup in `.env`
```env
# Add your Razorpay API Keys from dashboard.razorpay.com > Settings > API Keys
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```
*(Note: If left blank during development, the backend automatically generates a simulated mock order so the frontend developer can test the full checkout flow without waiting for production credentials).*

---

### Payment Flow for Frontend Developers

#### 1. Checking Payment Methods Config
`GET /api/config`
Returns supported payment options:
```json
{
  "categories": ["Life", "Annual", "Student", "Corporate", "Honorary"],
  "membershipStatuses": ["Pending", "Approved", "Suspended", "Expired"],
  "paymentMethods": ["cash", "online"],
  "paymentStatuses": ["Pending", "Paid", "Failed"],
  "razorpay": {
    "enabled": true,
    "keyId": "rzp_test_..."
  }
}
```

---

#### 2. Method A: Cash Payment Flow
When the user or desk agent selects **Cash**:

1. **Member Self-Registration with Cash:**
   - Submit `POST /api/register` with `payment_method: "cash"`.
   - The member is created with `payment_method = "cash"` and `payment_status = "Pending"`.
2. **Recording / Confirming Cash Payment:**
   - Call `POST /api/payments/cash`:
   ```json
   {
     "membership_id": "MEM-2026-0001",
     "amount": 1500,
     "reference_id": "CASH-REC-101",
     "notes": "Cash collected at front desk"
   }
   ```
   - **Response `200`:**
   ```json
   {
     "success": true,
     "message": "Cash payment recorded successfully.",
     "payment": {
       "id": 1,
       "membership_id": "MEM-2026-0001",
       "method": "cash",
       "amount": 1500,
       "status": "Paid",
       "reference_id": "CASH-REC-101"
     }
   }
   ```
   - Automatically marks member's `payment_status` as `Paid`.

---

#### 3. Method B: Online (Razorpay) Payment Flow
When the user selects **Online Payment**:

##### Step 1: Create Order
Call `POST /api/payments/razorpay/order`:
```json
{
  "membership_id": "MEM-2026-0001",
  "amount": 2500,
  "notes": "Annual membership fee"
}
```
- **Response `200`:**
```json
{
  "order_id": "order_EKwxwAgIt4GRmR",
  "amount": 250000,
  "currency": "INR",
  "key": "rzp_test_...",
  "method": "online",
  "membership_id": "MEM-2026-0001"
}
```

##### Step 2: Open Razorpay Checkout in Frontend
Frontend loads `https://checkout.razorpay.com/v1/checkout.js` and opens the modal:
```javascript
const options = {
  key: orderData.key,
  amount: orderData.amount, // in paise
  currency: orderData.currency,
  name: "Your Foundation / Organization Name",
  description: "Membership Registration Fee",
  order_id: orderData.order_id,
  handler: async function (response) {
    // Send response to backend for cryptographic signature verification
    await verifyPayment(response);
  },
  prefill: {
    name: memberName,
    email: memberEmail,
    contact: memberMobile
  },
  theme: { color: "#4f46e5" }
};
const rzp = new window.Razorpay(options);
rzp.open();
```

##### Step 3: Verify Payment Signature
In the `handler` callback, send the response to `POST /api/payments/razorpay/verify`:
```json
{
  "membership_id": "MEM-2026-0001",
  "razorpay_order_id": "order_EKwxwAgIt4GRmR",
  "razorpay_payment_id": "pay_29QQoUBi66xm2f",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```
- **Response `200`:**
```json
{
  "success": true,
  "message": "Online Razorpay payment verified and recorded successfully.",
  "payment_id": "pay_29QQoUBi66xm2f",
  "order_id": "order_EKwxwAgIt4GRmR",
  "status": "Paid",
  "method": "online"
}
```
- The backend verifies HMAC-SHA256 signature, sets `payment_method = "online"`, `payment_status = "Paid"`, and logs the transaction.

---

### 4. Admin Payment Management (Requires `Authorization: Bearer <token>`)

#### `GET /api/admin/payments`
Lists all payment transactions (both Cash & Online Razorpay).
- **Query Filters:**
  - `method`: `cash` or `online`
  - `status`: `Paid`, `Pending`, or `Failed`
  - `q`: Search member name, membership_id, or reference_id
- **Response `200`:**
```json
{
  "total": 15,
  "payments": [
    {
      "id": 1,
      "member_id": 12,
      "membership_id": "MEM-2026-0001",
      "member_name": "Suresh Chandra Jena",
      "method": "online",
      "amount": 2500,
      "status": "Paid",
      "reference_id": "pay_29QQoUBi66xm2f",
      "razorpay_order_id": "order_EKwxwAgIt4GRmR",
      "created_at": "2026-10-30 16:30:00"
    }
  ]
}
```

#### `PATCH /api/admin/members/:id/payment`
Admin directly records or overrides a member's payment:
- **Body:**
```json
{
  "payment_method": "cash",
  "payment_status": "Paid",
  "payment_amount": 1500,
  "payment_reference": "RECEIPT-501",
  "notes": "Paid in cash to admin"
}
```
- **Response `200`:** Updated member object.

---

## 📡 Full API Reference

### Public Endpoints
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/config` | Returns categories, statuses, payment methods, Razorpay config |
| `GET` | `/api/members` | Public member directory (supports `q`, `category`, `location`, `active`, `sort`, `page`, `limit`) |
| `POST` | `/api/register` | Self-registration (`multipart/form-data`) with photo and payment method |
| `POST` | `/api/payments/cash` | Record Cash payment for a membership |
| `POST` | `/api/payments/razorpay/order` | Create Razorpay order for online payment |
| `POST` | `/api/payments/razorpay/verify` | Verify Razorpay payment signature & mark Paid |

### Admin Endpoints (`Authorization: Bearer <token>`)
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Admin authentication (`username`, `password`) |
| `GET` | `/api/admin/stats` | Dashboard statistics (`total`, `active`, `inactive`, `pending`, `expiringIn30Days`) |
| `GET` | `/api/admin/members` | List all members with full contact & payment details |
| `GET` | `/api/admin/members/:id` | Get details of a single member |
| `POST` | `/api/admin/members` | Add new member directly (`multipart/form-data`) |
| `PUT` | `/api/admin/members/:id` | Edit member details & update/replace photo |
| `PATCH` | `/api/admin/members/:id/active` | 1-Click activate/deactivate member |
| `PATCH` | `/api/admin/members/:id/status` | Update status (`Approved`, `Pending`, `Suspended`, `Expired`) |
| `PATCH` | `/api/admin/members/:id/category` | Update category (`Life`, `Annual`, etc.) |
| `PATCH` | `/api/admin/members/:id/payment` | Record/update member payment details |
| `GET` | `/api/admin/payments` | View full payment history (Cash & Online) |
| `GET` | `/api/admin/members/export.csv` | Export members to CSV |
| `DELETE` | `/api/admin/members/:id` | Delete member record & unlinks photo |
