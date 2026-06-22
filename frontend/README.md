# 🏫 Montola School — Frontend

The web application for **Montola School**, an online learning management system serving students in the Chittagong Hill Tracts, Bangladesh. Built with Next.js 16 and React 19.

> **Backend repo →** [Montola-School](https://github.com/Avi-Dewan/Montola-School)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 |
| **HTTP Client** | Axios |
| **Notifications** | react-toastify |
| **Icons** | react-icons (Heroicons, Font Awesome) |
| **Loading** | nextjs-toploader |
| **Font** | Poppins (Google Fonts via `next/font`) |

---

## Prerequisites

- **Node.js ≥ 18**
- **Backend API running** on port 8080 (see [Backend README](https://github.com/Avi-Dewan/Montola-School))

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Avi-Dewan/Montola-School-FrontEnd.git
cd Montola-School-FrontEnd
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env.local` file in the project root:

```env
# Backend API URL (must include /api)
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Image proxy (for Next.js Image component)
NEXT_PUBLIC_API_IMAGES_PROTOCOL=http
NEXT_PUBLIC_API_IMAGES_HOSTNAME=localhost
NEXT_PUBLIC_API_IMAGES_PORT=8080
```

### 4. Run the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Run Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `next dev` | **Development server** with hot reload |
| `npm run build` | `next build` | Production build |
| `npm start` | `next start` | Serve production build |
| `npm run lint` | `eslint` | Run ESLint checks |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080/api` |
| `NEXT_PUBLIC_API_IMAGES_PROTOCOL` | Protocol for image proxy | `http` |
| `NEXT_PUBLIC_API_IMAGES_HOSTNAME` | Hostname for image proxy | `localhost` |
| `NEXT_PUBLIC_API_IMAGES_PORT` | Port for image proxy | `8080` |

> All env files (`.env*`) are gitignored. The image proxy variables configure Next.js `remotePatterns` for serving backend images through the Next.js Image component.

---

## Project Structure

```
Montola-School-FrontEnd/
├── public/
│   └── montola-logo.png               # School logo
├── src/
│   ├── app/                            # Next.js App Router pages
│   │   ├── layout.tsx                  # Root layout (Poppins font, providers)
│   │   ├── page.tsx                    # Homepage (marketing landing)
│   │   ├── loading.tsx                 # Global loading spinner
│   │   ├── globals.css                 # Tailwind base + custom scrollbar
│   │   ├── admin/                      # Admin panel (ADMIN/MANAGER role)
│   │   │   ├── layout.tsx              # Admin layout with sidebar
│   │   │   ├── page.tsx                # Dashboard with statistics
│   │   │   ├── classes/                # Class CRUD
│   │   │   ├── subjects/               # Subject CRUD
│   │   │   ├── chapters/               # Chapter management
│   │   │   ├── featured/               # Featured chapters management
│   │   │   ├── payments/               # Payment verification
│   │   │   ├── users/                  # User management
│   │   │   └── profile/                # Admin profile
│   │   ├── auth/                       # Authentication pages
│   │   │   ├── login/                  # Login form
│   │   │   ├── register/               # Registration form
│   │   │   ├── activate/               # Email activation
│   │   │   ├── check-email/            # Post-registration notice
│   │   │   ├── forgot-password/        # Password reset request
│   │   │   └── reset-password/         # Password reset form
│   │   ├── student/                    # Student area
│   │   │   ├── dashboard/              # Progress overview + payments
│   │   │   ├── chapters/[id]/          # Chapter study view
│   │   │   │   └── content/[contentId] # Content player (lectures, quizzes, PDFs)
│   │   │   └── profile/                # Student profile
│   │   ├── teacher/                    # Teacher area
│   │   │   ├── page.tsx                # Teacher dashboard
│   │   │   ├── layout.tsx              # Teacher layout with role check
│   │   │   ├── assigned-chapters/      # Assigned chapter list
│   │   │   ├── chapters/[id]/          # Chapter editor (topics, content)
│   │   │   └── profile/                # Teacher profile
│   │   ├── classes/                    # Public class browser
│   │   ├── chapters/[id]/              # Public chapter detail
│   │   ├── featured-chapters/          # Featured chapters listing
│   │   └── free-chapters/              # Free chapters listing
│   ├── components/                     # Reusable components
│   │   ├── ui/                         # Primitives: Button, Input, Select, Modal, DataTable
│   │   ├── admin/                      # Admin-specific: forms, toggles, verification
│   │   ├── teacher/                    # Teacher-specific: chapter tree, content forms, quiz builder
│   │   ├── student/                    # Student-specific: PaymentModal
│   │   ├── shared/                     # Cross-role: ProfileContent
│   │   ├── Navbar.tsx                  # Main navbar (role-based links)
│   │   ├── Footer.tsx                  # Site footer
│   │   ├── CourseSidebar.tsx           # Student course navigation
│   │   ├── Hero.tsx                    # Landing page hero
│   │   ├── FeaturedCourses.tsx         # Featured courses grid
│   │   ├── FreeChapterList.tsx         # Free chapters grid
│   │   └── ...                         # Other landing page sections
│   ├── contexts/                       # React Context providers
│   │   ├── AuthContext.tsx             # Auth state (tokens, user, roles)
│   │   └── I18nProvider.tsx            # Internationalization (en/bn)
│   ├── lib/                            # API service modules
│   │   ├── api.ts                      # Axios instance + interceptors
│   │   ├── auth.ts                     # Auth API calls
│   │   ├── admin.ts                    # Admin API calls
│   │   ├── teacher.ts                  # Teacher API calls
│   │   ├── student.ts                  # Student API calls
│   │   ├── public.ts                   # Public API calls
│   │   ├── user.ts                     # User API calls
│   │   └── roles.ts                    # Role priority & routing helpers
│   ├── locales/                        # Translation files
│   │   ├── en/common.json              # English translations
│   │   └── bn/common.json              # Bengali (বাংলা) translations
│   ├── types/
│   │   └── index.ts                    # All TypeScript interfaces
│   └── config/
│       └── schoolInfo.json             # School contact info & payment numbers
├── tailwind.config.ts                  # Custom green theme + Poppins font
├── next.config.ts                      # Image remote patterns for backend
├── tsconfig.json                       # TypeScript config with @/* path alias
└── postcss.config.mjs                  # PostCSS + Autoprefixer
```

---

## Routing

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing homepage (auto-redirects logged-in staff to their dashboard) |
| `/classes` | Browse all classes |
| `/classes/[id]` | Class detail with subjects |
| `/classes/[id]/subjects/[subjectId]` | Subject detail with chapters |
| `/chapters/[id]` | Public chapter detail (enrollment/payment) |
| `/featured-chapters` | Featured chapters listing |
| `/free-chapters` | Free chapters listing |

### Auth Routes

| Route | Description |
|-------|-------------|
| `/auth/login` | Email + password login |
| `/auth/register` | Student registration |
| `/auth/activate?email=&token=` | Email activation |
| `/auth/check-email?email=` | Post-registration verification notice |
| `/auth/forgot-password` | Request password reset |
| `/auth/reset-password?email=&token=` | Reset password form |

### Student Routes (requires authentication)

| Route | Description |
|-------|-------------|
| `/student/dashboard` | Progress overview + payment history |
| `/student/chapters/[id]` | Chapter study view with course sidebar |
| `/student/chapters/[id]/content/[contentId]` | Content player (lectures, quizzes, PDFs) |
| `/student/profile` | Profile management |

### Teacher Routes (requires TEACHER role)

| Route | Description |
|-------|-------------|
| `/teacher` | Teacher dashboard |
| `/teacher/assigned-chapters` | List of assigned chapters |
| `/teacher/chapters/[id]` | Chapter editor (topics, content CRUD) |
| `/teacher/profile` | Profile management |

### Admin Routes (requires ADMIN or MANAGER role)

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard with statistics |
| `/admin/classes` | Class management |
| `/admin/classes/[id]` | Class detail with structure view |
| `/admin/subjects` | Subject management |
| `/admin/subjects/[id]` | Subject detail |
| `/admin/chapters` | Chapter management with filtering |
| `/admin/chapters/[id]` | Chapter detail (full management) |
| `/admin/featured` | Featured chapters management |
| `/admin/payments` | All payments list |
| `/admin/payments/unverified` | Unverified payment review |
| `/admin/users` | User management |
| `/admin/profile` | Admin profile |

---

## Component Architecture

### Hierarchy

```
Root Layout
 ├── AuthProvider (contexts/AuthContext)
 │    └── I18nProvider (contexts/I18nProvider)
 │         └── AppChrome (conditional Navbar + Footer)
 │              ├── Public pages (marketing, auth)
 │              ├── Student pages
 │              ├── Teacher pages (TeacherLayout with role guard)
 │              └── Admin pages (AdminLayout with role guard + AdminSidebar)
```

### UI Primitives (`components/ui/`)

| Component | Features |
|-----------|----------|
| `Button` | Variants: primary, secondary, danger, outline · Sizes: sm, md, lg · Loading state |
| `Input` | Label, error display, ref forwarding |
| `Select` | Options array, placeholder, ref forwarding |
| `Modal` | Sizes: sm–xl, Escape key + backdrop close |
| `DataTable` | Generic sortable table with pagination |

### Key Components

| Component | Size | Purpose |
|-----------|------|---------|
| `Navbar` | 19KB | Main navigation — adapts links based on user role |
| `CourseSidebar` | 12KB | Student chapter navigation with progress tracking |
| `ProfileContent` | 16KB | Shared profile page (avatar upload, password change) |
| `ChapterTreeView` | 16KB | Teacher hierarchical content editor |
| `QuizForm` | 32KB | Quiz builder (MCQ, fill-blank, matching, written) |
| `Content Player` | 44KB | Student content viewer (lectures, quizzes, PDFs) |

---

## State Management

### AuthContext

The primary state manager, stored in `contexts/AuthContext.tsx`:

- **State**: `isLoggedIn`, `isLoading`, `accessToken`, `refreshToken`, `user`, `activeRole`
- **Persistence**: localStorage (`accessToken`, `refreshToken`, `user`, `activeRole`)
- **Methods**: `setAuthTokens`, `removeAuthTokens`, `hasRole`, `isAdminOrManager`, `setActiveRole`, `refreshUser`, `updateUser`
- **Multi-role support**: Users can have multiple roles. `RoleToggle` component switches the active role and navigates to the corresponding dashboard.

### I18nProvider

Simple client-side i18n in `contexts/I18nProvider.tsx`:

- **Languages**: English (`en`) and Bengali (`bn`)
- **Usage**: `const { t } = useI18n()` → `t('nav.home')` with `{{variable}}` interpolation
- **Translation files**: `src/locales/en/common.json` and `src/locales/bn/common.json`

### ProgressContext

Course-scoped context in `student/chapters/[id]/ProgressContext.tsx`:

- Tracks per-content completion status within a chapter
- Provides `detailedProgress`, `overallProgress`, `refreshProgress`, `structure`

---

## API Integration

### Axios Setup (`lib/api.ts`)

- **Base URL**: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8080/api`)
- **Request interceptor**: Attaches `Authorization: Bearer <token>` from localStorage
- **Response interceptor**: On 401 → attempts token refresh via `/auth/refresh-token` → if refresh fails, clears localStorage and redirects to `/auth/login`

### API Modules (`lib/`)

| Module | Endpoints |
|--------|-----------|
| `auth.ts` | Login, register, activate, resend activation, change/forgot/reset password |
| `admin.ts` | CRUD for classes, subjects, chapters, featured chapters, users, teacher assignments, payments |
| `teacher.ts` | Assigned chapters, statistics, topic CRUD, content CRUD (lectures, PDFs, quizzes) |
| `student.ts` | Progress tracking, content viewing, enrollment, payment submission |
| `public.ts` | Featured chapters, free chapters, public class/subject/chapter structures |
| `user.ts` | Profile picture upload/download, get user by email |
| `roles.ts` | Role priority helpers (`ADMIN > MANAGER > TEACHER > STUDENT`), role-based routing |

---

## Internationalization

The app supports **English** and **Bengali (বাংলা)** via a custom i18n provider:

- Translation files are in `src/locales/{en,bn}/common.json`
- Uses dot-notation keys: `t('hero.title')`, `t('nav.dashboard')`
- Supports variable interpolation: `t('welcome', { name: 'Avi' })` → `"Welcome, Avi"`
- Language is switchable at runtime (not persisted across sessions)

---

## Styling

- **Framework**: Tailwind CSS 3.4 with PostCSS + Autoprefixer
- **Theme**: Custom green primary color palette (50–900), white accent
- **Font**: Poppins (loaded via `next/font/google`, weights 300–900)
- **Responsive**: Mobile-first with `md:` and `lg:` breakpoints
- **Approach**: Utility classes directly in JSX (no CSS modules)

### Custom Colors

```
primary-50:  #e6f4ea (lightest)
primary-500: #2ca83e (brand green)
primary-900: #07300f (darkest)
```

---

## Backend Integration

| Aspect | Detail |
|--------|--------|
| **API URL** | `http://localhost:8080/api` (configurable via env) |
| **Auth** | JWT Bearer tokens in Authorization header |
| **Token refresh** | Automatic on 401 responses |
| **Images** | Proxied through Next.js Image component (`/api/**` pattern) |
| **CORS** | Backend allows requests from `FRONTEND_URL` |

See the [Backend README](https://github.com/Avi-Dewan/Montola-School) for API setup.

---

## License

Private project — all rights reserved.
