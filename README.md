# وصّلني - تطبيق خدمات النقل والسفر في العراق
# Wasilni - Iraqi Transportation and Travel Services Application

<div dir="rtl">

## نظرة عامة

وصّلني هو تطبيق متكامل لخدمات النقل والسفر في العراق، يوفر منصة موحدة تربط بين الركاب والسائقين وشركات النقل والسياحة.

### المميزات الرئيسية

* **واجهة عربية كاملة** - جميع عناصر التطبيق بالعربية مع دعم كامل للكتابة من اليمين لليسار (RTL)
* **تصميم عصري وجذاب** - ألوان حديثة وتدرجات أنيقة مع تجربة مستخدم سلسة
* **نظام متعدد الأدوار** - دعم العملاء والسائقين والشركات والمديرين
* **طلبات فورية ورحلات مجدولة** - خيارات متنوعة لتلبية احتياجات السفر المختلفة
* **تتبع مباشر** - تتبع الرحلات في الوقت الفعلي
* **طرق دفع متعددة** - نقدي، زين كاش، نس والت، ماستركارد
* **نظام تقييم** - تقييمات للسائقين والشركات لضمان الجودة

</div>

---

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy the SQL schema from `supabase/schema.sql` and run it in the Supabase SQL Editor
3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

---

## Project Structure

```
wasilni/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── customer/       # Customer interface
│   │   ├── driver/         # Driver and company dashboards
│   │   ├── admin/          # Admin panel
│   │   └── shared/         # Reusable components
│   ├── contexts/           # React contexts (Auth)
│   ├── config/             # Configuration files
│   ├── index.css           # Global styles & design system
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── supabase/
│   └── schema.sql          # Database schema
├── index.html
├── vite.config.js
└── package.json
```

---

## User Roles & Features

### 👤 Customer (العميل)
- Browse available trips and offers
- Book immediate taxi rides
- Reserve seats in scheduled trips
- Track trips in real-time
- Make payments (cash or electronic)
- Rate drivers and companies

### 🚗 Driver (السائق)
- Receive taxi ride requests
- Accept or reject requests
- Track earnings
- View ratings from customers

### 🚌 Company (الشركة)
- Create scheduled trip offers
- Manage routes and pricing
- Set departure times and available seats
- Track bookings and revenue

### 👨‍💼 Admin (المدير)
- Manage all users (customers, drivers, companies)
- Approve new driver/company registrations
- Assign and transfer requests
- View analytics and reports
- Monitor system performance

---

## Database Schema

### Main Tables
- **users** - All system users with role-based access
- **drivers** - Driver profiles and vehicle information
- **companies** - Tourism and transportation companies
- **requests** - Trip booking requests
- **trips** - Scheduled trip offers
- **trip_bookings** - Customer bookings for trips
- **payments** - Transaction records
- **ratings** - Service ratings and reviews
- **notifications** - Real-time notifications

---

## Technology Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Authentication**: Supabase Auth
- **Maps**: Leaflet + OpenStreetMap
- **Styling**: Custom CSS with RTL support
- **Fonts**: Tajawal (Google Fonts)

---

## Design System

### Colors
- **Primary**: Rich Blue (#1e73be)
- **Secondary**: Fresh Green (#2ecc71)
- **Accent**: Light Brown (#c9a76b) - بني فاتح
- **Status Colors**: Success, Warning, Error, Info

### Typography
- **Font Family**: Tajawal (Arabic-optimized)
- **Direction**: RTL (Right-to-Left)
- **Weights**: 300, 400, 500, 700, 900

---

## Security Features

- Row Level Security (RLS) policies in Supabase
- Role-based access control
- Secure authentication with Supabase Auth
- Protected API routes
- Input validation and sanitization

---

## Development Notes

### Real-time Features
The application uses Supabase Realtime for:
- Live request notifications for drivers
- Trip status updates for customers
- Real-time availability updates

### Payment Integration
Currently supports:
- Cash payments (pending on delivery)
- Zain Cash (placeholder - requires merchant account)
- Nasswallet (placeholder - requires merchant account)
- Mastercard (placeholder - requires payment gateway)

**Note**: Electronic payment methods need to be integrated with actual payment providers in production.

---

## Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy the dist folder to Vercel
```

### Netlify

```bash
npm run build
# Deploy the dist folder to Netlify
```

### Custom Server

```bash
npm run build
# Serve the dist folder with any static hosting service
```

---

<div dir="rtl">

## الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- راجع الوثائق الكاملة
- تحقق من قاعدة بيانات Supabase
- راجع ملفات الأمثلة في المشروع

## الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام التعليمي والتجاري.

## المساهمة

نرحب بالمساهمات! يرجى اتباع معايير البرمجة والتصميم الموجودة في المشروع.

</div>

---

## License

MIT License - Feel free to use this project for educational and commercial purposes.

## Credits

Built with ❤️ for the Iraqi market

