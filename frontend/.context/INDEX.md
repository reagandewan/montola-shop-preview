# Montola School — Frontend Index

> Quick reference for navigating the codebase. See also: [ARCHITECTURE.md](./ARCHITECTURE.md) | [CONVENTIONS.md](./CONVENTIONS.md)
>
> **Backend context →** `Montola-School/.context/`

---

## Entry Points

| What | File |
|------|------|
| HTML shell | `index.html` (via `public/`) |
| Root layout | `src/app/layout.tsx` — Poppins font, AuthProvider, I18nProvider, TopLoader, Toasts |
| Homepage | `src/app/page.tsx` — marketing landing + role-based redirect |
| Layout wrapper | `src/components/AppChrome.tsx` — conditional Navbar/Footer |
| Auth state | `src/contexts/AuthContext.tsx` — tokens, user, roles |
| API client | `src/lib/api.ts` — Axios instance + interceptors |
| Type definitions | `src/types/index.ts` — all TypeScript interfaces |
| Tailwind config | `tailwind.config.ts` — custom green theme, Poppins font |
| Next.js config | `next.config.ts` — image remote patterns |

---

## Run Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `next dev` | Development server (:3000) |
| `npm run build` | `next build` | Production build |
| `npm start` | `next start` | Serve production build |
| `npm run lint` | `eslint` | Lint checks |

---

## Pages Index (`src/app/`)

### Public Pages

| Path | File | Purpose |
|------|------|---------|
| `/` | `page.tsx` | Homepage — Hero, Classes, Featured, Free chapters |
| `/classes` | `classes/page.tsx` | Browse all classes |
| `/classes/[id]` | `classes/[id]/page.tsx` | Class detail with subjects |
| `/classes/[id]/subjects/[subjectId]` | `classes/[id]/subjects/[subjectId]/page.tsx` | Subject detail |
| `/chapters/[id]` | `chapters/[id]/page.tsx` | Public chapter detail (24KB) |
| `/featured-chapters` | `featured-chapters/page.tsx` | Featured chapters listing |
| `/free-chapters` | `free-chapters/page.tsx` | Free chapters listing |

### Auth Pages

| Path | File | Purpose |
|------|------|---------|
| `/auth/login` | `auth/login/page.tsx` | Login form |
| `/auth/register` | `auth/register/page.tsx` | Registration form |
| `/auth/activate` | `auth/activate/page.tsx` | Email activation |
| `/auth/check-email` | `auth/check-email/page.tsx` | Post-registration notice |
| `/auth/forgot-password` | `auth/forgot-password/page.tsx` | Password reset request |
| `/auth/reset-password` | `auth/reset-password/page.tsx` | Password reset form |

### Student Pages

| Path | File | Purpose |
|------|------|---------|
| `/student/dashboard` | `student/dashboard/page.tsx` | Progress overview + payments (14KB) |
| `/student/chapters/[id]` | `student/chapters/[id]/page.tsx` | Chapter overview |
| `/student/chapters/[id]/content/[contentId]` | `student/chapters/[id]/content/[contentId]/page.tsx` | **Content player (44KB)** — lectures, quizzes, PDFs |
| `/student/profile` | `student/profile/page.tsx` | Profile management |

**Special files:**
| File | Purpose |
|------|---------|
| `student/chapters/[id]/layout.tsx` | Chapter layout with CourseSidebar + ProgressContext |
| `student/chapters/[id]/ProgressContext.tsx` | Content progress tracking context |

### Teacher Pages

| Path | File | Purpose |
|------|------|---------|
| `/teacher` | `teacher/page.tsx` | Teacher dashboard |
| `/teacher/assigned-chapters` | `teacher/assigned-chapters/page.tsx` | Assigned chapters list |
| `/teacher/chapters/[id]` | `teacher/chapters/[id]/page.tsx` | **Chapter editor (22KB)** — topics + content CRUD |
| `/teacher/profile` | `teacher/profile/page.tsx` | Profile management |

**Layout:** `teacher/layout.tsx` — role guard (TEACHER or admin with teacher activeRole)

### Admin Pages

| Path | File | Purpose |
|------|------|---------|
| `/admin` | `admin/page.tsx` | Dashboard with statistics (8KB) |
| `/admin/classes` | `admin/classes/page.tsx` | Class list |
| `/admin/classes/[id]` | `admin/classes/[id]/page.tsx` | Class detail + structure |
| `/admin/subjects` | `admin/subjects/page.tsx` | Subject list |
| `/admin/subjects/[id]` | `admin/subjects/[id]/page.tsx` | Subject detail |
| `/admin/chapters` | `admin/chapters/page.tsx` | Chapter list + filtering |
| `/admin/chapters/[id]` | `admin/chapters/[id]/page.tsx` | **Chapter management (25KB)** |
| `/admin/featured` | `admin/featured/page.tsx` | Featured chapters |
| `/admin/payments` | `admin/payments/page.tsx` | All payments |
| `/admin/payments/unverified` | `admin/payments/unverified/page.tsx` | Unverified payments |
| `/admin/users` | `admin/users/page.tsx` | User management |
| `/admin/profile` | `admin/profile/page.tsx` | Admin profile |

**Layout:** `admin/layout.tsx` — role guard + AdminSidebar (8KB)

---

## Components Index (`src/components/`)

### UI Primitives (`ui/`)

| Component | Purpose |
|-----------|---------|
| `Button.tsx` | Variants: primary/secondary/danger/outline, sizes, loading state |
| `Input.tsx` | Text input with label + error, ref forwarding |
| `Select.tsx` | Dropdown with options array, ref forwarding |
| `Modal.tsx` | Sizes: sm–xl, Escape key + backdrop close |
| `DataTable.tsx` | Generic sortable table with pagination |

### Layout Components

| Component | Purpose |
|-----------|---------|
| `AppChrome.tsx` | Conditionally wraps with Navbar+Footer (skips for admin routes) |
| `Navbar.tsx` (19KB) | Main navigation — adapts to user role, mobile responsive |
| `Footer.tsx` (6KB) | Site footer with school info |

### Landing Page Components

| Component | Purpose |
|-----------|---------|
| `Hero.tsx` | Green gradient CTA section |
| `ClassesListSection.tsx` | Browse classes grid |
| `FeaturedCourses.tsx` | Featured chapter cards |
| `FreeChapterList.tsx` | Free chapter cards |
| `ValueProps.tsx` | "Why Montola" section |
| `Testimonials.tsx` | Testimonials section |
| `Pricing.tsx` | Pricing section |
| `TeacherSpotLight.tsx` | Teacher spotlight |
| `PublicChapterGrid.tsx` | Chapter card grid |
| `PublicStructureTree.tsx` | Public course structure tree |
| `ChapterPlaceholder.tsx` | Fallback when no cover image |

### Admin Components (`admin/`)

| Component | Purpose |
|-----------|---------|
| `AdminSidebar.tsx` | 7-item sidebar navigation |
| `ClassForm.tsx` | Class create/edit form |
| `SubjectForm.tsx` | Subject create/edit form |
| `ChapterForm.tsx` | Chapter create/edit form |
| `StatusToggle.tsx` | Chapter status switcher (DRAFT/PUBLISHED/ARCHIVED) |
| `TeacherAssignment.tsx` | Assign/unassign teachers to chapters |
| `PaymentVerification.tsx` | Verify/reject payment |
| `RoleToggle.tsx` | Multi-role user switcher dropdown |

### Teacher Components (`teacher/`)

| Component | Purpose |
|-----------|---------|
| `AssignedChaptersList.tsx` | Card grid of assigned chapters |
| `ChapterTreeView.tsx` (16KB) | Hierarchical topic/content tree editor |
| `ContentForm.tsx` | Content type selector wrapper |
| `TopicForm.tsx` | Topic create/edit form |
| `LectureForm.tsx` | Lecture create/edit form (video ID + text) |
| `PdfForm.tsx` | PDF create/edit form (Google Drive file) |
| `QuizForm.tsx` (32KB) | **Quiz builder** — MCQ, fill-blank, matching, written |

### Student Components (`student/`)

| Component | Purpose |
|-----------|---------|
| `PaymentModal.tsx` | bKash/Nagad payment submission modal |
| `CourseSidebar.tsx` (13KB) | Chapter navigation with progress indicators |

### Shared Components (`shared/`)

| Component | Purpose |
|-----------|---------|
| `ProfileContent.tsx` (16KB) | Profile page: avatar upload, password change, personal info |

### Utility Components

| Component | Purpose |
|-----------|---------|
| `LoadingSpinner.tsx` | Configurable spinner (size, variant, label) |
| `Alert.tsx` | Simple colored alert (error/success/info) |

---

## API Modules (`src/lib/`)

| Module | Scope | Key Functions |
|--------|-------|--------------|
| `api.ts` | Shared | Axios instance, request/response interceptors, token refresh |
| `auth.ts` | Public/Any | `login`, `register`, `activate`, `changePassword`, `forgotPassword`, `resetPassword` |
| `admin.ts` | ADMIN/MANAGER | CRUD for classes, subjects, chapters, users; teacher assignment; payment management |
| `teacher.ts` | TEACHER | `getAssignedChapters`, topic CRUD, lecture/quiz/PDF CRUD, student progress |
| `student.ts` | STUDENT | `getProgress`, `markComplete`, `submitQuiz`, `enrollFree`, `submitPayment` |
| `public.ts` | Public | `getFeaturedChapters`, `getFreeChapters`, public structures |
| `user.ts` | Any | `uploadProfilePicture`, `getProfilePicture`, `getUserByEmail` |
| `roles.ts` | Client | `ROLE_ORDER`, `getHighestPriorityRole()`, `getRouteForRole()` |

---

## State Management (`src/contexts/`)

| Context | State | Persistence |
|---------|-------|-------------|
| `AuthContext.tsx` | `isLoggedIn`, `user`, `activeRole`, `accessToken`, `refreshToken` | localStorage |
| `I18nProvider.tsx` | `locale`, `t()` function | Memory only |
| `ProgressContext.tsx` | `detailedProgress`, `overallProgress` | Per-chapter scope |

---

## Translations (`src/locales/`)

| File | Language | Size |
|------|----------|------|
| `en/common.json` | English | 17KB |
| `bn/common.json` | Bengali (বাংলা) | 32KB |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `tailwind.config.ts` | Custom green primary palette (50–900), Poppins font |
| `next.config.ts` | Image remote patterns for backend API |
| `tsconfig.json` | TypeScript config with `@/*` path alias |
| `postcss.config.mjs` | Tailwind + Autoprefixer |
| `eslint.config.mjs` | ESLint + Next.js + TypeScript rules |
| `src/config/schoolInfo.json` | School email, phone, address, bKash merchant |

---

## Assets (`public/`)

| File | Purpose |
|------|---------|
| `montola-logo.png` | Primary school logo (used in Navbar, Footer, Hero, auth pages) |
| `file.svg`, `globe.svg`, `window.svg` | Default Next.js icons (unused) |
