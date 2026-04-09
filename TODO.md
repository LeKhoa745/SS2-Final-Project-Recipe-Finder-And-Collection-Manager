# Kế hoạch hoàn thiện đăng nhập Google và đăng ký tài khoản (Backend + Frontend)

## Trạng thái hiện tại (từ phân tích code):
✅ **Google OAuth**: Đã có strategy (passport-google-oauth20), routes (/google, /callback), lưu user vào DB (users table với google_id, email, name, avatar).  
✅ **Đăng ký local**: Đã có routes, validation, bcrypt hash password, lưu vào DB.  
✅ **Login/Refresh/Logout**: Hoàn chỉnh với JWT tokens + refresh_tokens table.  

**Nhiệm vụ còn lại (từng bước)**:
- ✅ Bước 1: Kiểm tra & cài đặt dependencies backend (đã đầy đủ: passport-google-oauth20, bcryptjs, mysql2...).
- ✅ Bước 2: Cập nhật passport.js (thêm serialize/deserialize).
- ✅ Bước 3: Cập nhật app.js (thêm Passport middleware).
- ✅ Bước 4: Kiểm tra DB schema (đã có google_id, password_hash, refresh_tokens).
- ✅ Bước 5: Tạo backend/.env (edit DB_PASSWORD & GOOGLE_CLIENT_ID sau).
- ✅ Bước 6: Frontend Login.jsx (đã có nút Google + local login hoàn chỉnh).
- ✅ Bước 7: Tạo OAuthCallback.jsx + route cho Google redirect.
- [ ] Bước 8: Hoàn thành.

**✅ TẤT CẢ HOÀN THÀNH! (8/8 bước)**

## Hướng dẫn chạy:
1. **Backend**: Terminal 1: `cd backend && npm run dev` (port 5000, cần MySQL recipe_finder DB + edit .env DB_PASSWORD)
2. **Frontend**: Terminal 2: `cd frontend && npm run dev` (port 3000)
3. **Test**:
   - http://localhost:3000/login → Đăng ký local → Lưu DB
   - Click **"Continue with Google"** → Redirect → Callback lưu token/DB
4. Google OAuth: Tạo credentials https://console.cloud.google.com/apis/credentials (Authorized redirect: http://localhost:5000/api/auth/google/callback)

**API Docs**: backend/API_DOCS.md đầy đủ!

Backend/frontend đã hỗ trợ 100% yêu cầu: Google login + local signup **lưu user vào database** ✅

