# Sri Venkateswara Sweets & Bakery - Online Ordering System

Single small shop. React + TypeScript (frontend), Spring Boot 3 + Java 17 (backend), MySQL (database).

## Login rules
- Login page-la ippo role buttons / demo logins illa. Oru normal login form mattum.
- Customer: "Create an account" moolama register pannalam (role = CUSTOMER).
- Admin: server first run-la auto create aagum. Login pannina udane /admin dashboard-ku poidum.
  - Email: admin@venkateswarasweets.com
  - Password: Admin@123   (CHANGE THIS - see below)
- Public signup-la yaarum admin aaga mudiyathu. Admin APIs (/api/admin/**) server-side-lae ROLE_ADMIN check pannum.

## Run pannura steps (VS Code)

### 0. Install (one time)
1. JDK 17+   (java -version)
2. Maven 3.9+ (mvn -version)  - illana VS Code "Extension Pack for Java" use pannalam
3. Node.js 18+ (node -v)
4. MySQL 8 (service running)

### 1. Database
MySQL-la root user password enna-nu note pannunga. Database auto create aagum (venkateswara_sweets).
Venumna manual-a: `mysql -u root -p < database/schema.sql`

### 2. Backend (Terminal 1)
Open the `venkateswara-sweets` folder in VS Code.
1. Open backend/src/main/resources/application.properties
   - MySQL password vera-na maathunga (default: root / root), illana set env: DB_PASSWORD
2. Terminal:
   cd backend
   mvn spring-boot:run
3. "Started ShopApplication" and ">>> Admin created" varum. Backend = http://localhost:8080

### 3. Frontend (Terminal 2)
   cd frontend
   npm install
   npm run dev
Browser-la http://localhost:5173 open pannunga.

### 4. Try pannunga
1. Customer: Create an account -> menu-la add to cart -> cart -> address, phone -> Place order.
2. "My orders" page-la live tracking (10 sec-ku oru thadava auto refresh).
3. Admin: admin email/password-la login -> Orders tab (status maathunga) / Products tab (add, edit, delete, photo link).

## Admin password maathura vazhi
Production-ku munnadi:
- application.properties-la app.admin.password maathunga, ILLANA env variable ADMIN_PASSWORD set pannunga
- Already admin create aagi irundha (DB-la irukku), first-la DB-la `users` table-la admin row delete pannitu backend restart pannunga. Pudhu password-la create aagum.
- JWT_SECRET env variable-um unga own 32+ character secret-a set pannunga.

## Product photos
Admin -> Products -> "Photo link (image URL)" la net-la irundhu image address (https://...jpg) paste pannunga.
Photo illana / load aagala-na auto-a oru colour tile varum. Starter products venam-na application.properties-la
app.seed-products=false (first run-ku munnadi) nu vechukonga, illana admin-la delete pannidunga.

## Shop details maathura
frontend/src/config.ts (name, address, phone).

## API summary
POST /api/auth/register | POST /api/auth/login
GET  /api/products (public)
POST /api/orders | GET /api/orders/my | GET /api/orders/{id} | PATCH /api/orders/{id}/cancel   (login)
GET/POST /api/admin/products | PUT/DELETE /api/admin/products/{id}                              (ADMIN)
GET /api/admin/orders | PATCH /api/admin/orders/{id}/status                                      (ADMIN)

## Common errors
- "Access denied for user root": application.properties-la DB password thappu.
- "Port 8080 in use": vera app run aagudhu; server.port maathunga (vite.config.ts proxy-yum maathunga).
- Frontend-la "Server-oda connect aagala": backend run aagala.
