# Montola School — Frontend Conventions

> Coding patterns, component conventions, and how-to guides for contributors and AI assistants.

---

## File Organization

### App Router Structure

Pages are organized by **user role**, matching the URL structure:

```
src/app/
├── page.tsx              # / (public homepage)
├── layout.tsx            # Root layout
├── admin/                # /admin/* (ADMIN/MANAGER role)
│   ├── layout.tsx        # Admin layout with sidebar + role guard
│   ├── page.tsx          # /admin (dashboard)
│   └── {resource}/       # /admin/{resource}
│       ├── page.tsx      # List page
│       └── [id]/page.tsx # Detail page
├── auth/                 # /auth/* (public)
│   └── {action}/page.tsx # Login, register, activate, etc.
├── student/              # /student/* (authenticated)
│   ├── dashboard/        # /student/dashboard
│   └── chapters/[id]/    # /student/chapters/[id]
│       └── content/[contentId]/  # Content player
├── teacher/              # /teacher/* (TEACHER role)
│   ├── layout.tsx        # Teacher layout with role guard
│   └── chapters/[id]/    # Chapter editor
├── classes/              # /classes (public)
├── chapters/[id]/        # /chapters/[id] (public)
├── featured-chapters/    # /featured-chapters (public)
└── free-chapters/        # /free-chapters (public)
```

### Component Structure

```
src/components/
├── ui/                   # Reusable primitives (Button, Input, Modal, etc.)
├── admin/                # Admin-specific components
├── teacher/              # Teacher-specific components
├── student/              # Student-specific components
├── shared/               # Cross-role components (ProfileContent)
├── Navbar.tsx            # Global navbar
├── Footer.tsx            # Global footer
└── Hero.tsx, etc.        # Landing page sections
```

### Library Structure

```
src/lib/                  # API + utility modules
├── api.ts                # Axios instance + interceptors (shared)
├── auth.ts               # Auth endpoints
├── admin.ts              # Admin endpoints
├── teacher.ts            # Teacher endpoints
├── student.ts            # Student endpoints
├── public.ts             # Public endpoints
├── user.ts               # User endpoints
└── roles.ts              # Role helpers (client-side)
```

---

## Page Pattern

Pages are `async` server components by default, with `"use client"` when state/effects are needed:

```tsx
"use client";

import { useState, useEffect } from "react";
import { getClasses } from "@/lib/admin";
import { DataTable } from "@/components/ui/DataTable";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClasses()
      .then(res => setClasses(res.data))
      .catch(err => toast.error("Failed to load classes"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Classes</h1>
      <DataTable data={classes} columns={columns} />
    </div>
  );
}
```

**Conventions:**
- Most pages use `"use client"` (state management, effects)
- Data fetching via `useEffect` + API module calls
- Loading state with `LoadingSpinner` component
- Error handling with `react-toastify` (`toast.error(...)`)
- Pages manage their own data — no global data store

---

## Component Pattern

### Reusable UI Components (`components/ui/`)

Primitives use `forwardRef` and accept standard HTML props:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <button ref={ref} className={`...tailwind classes...`} {...props}>
        {isLoading ? <LoadingSpinner size="sm" /> : children}
      </button>
    );
  }
);
```

### Domain Components

Larger components accept data and callbacks as props:

```tsx
interface ClassFormProps {
  onSubmit: (data: CreateClassRequest) => void;
  initialData?: ClassEntity;
  isLoading?: boolean;
}

export function ClassForm({ onSubmit, initialData, isLoading }: ClassFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  // ... form fields and handlers
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Conventions:**
- UI primitives in `components/ui/` — generic, reusable
- Domain components in `components/{role}/` — specific to a role/feature
- Props interfaces defined above the component
- Controlled form inputs with `useState`
- Parent pages handle API calls, components handle UI

---

## API Module Pattern

Each role has a dedicated API module in `lib/`:

```tsx
// lib/admin.ts
import api from "./api";

// GET requests
export const getClasses = () => api.get("/v1/classes");
export const getClassById = (id: number) => api.get(`/v1/classes/${id}`);

// POST requests
export const createClass = (data: CreateClassRequest) => api.post("/v1/classes", data);

// PUT requests
export const updateClass = (id: number, data: UpdateClassRequest) => api.put(`/v1/classes/${id}`, data);

// DELETE requests
export const deleteClass = (id: number) => api.delete(`/v1/classes/${id}`);
```

**Conventions:**
- Each function returns an Axios promise (not pre-unwrapped)
- Pages call `.then(res => res.data)` to extract data
- Functions are named: `get{Entity}`, `create{Entity}`, `update{Entity}`, `delete{Entity}`
- One file per role scope (admin, teacher, student, public, auth)
- All modules import the shared `api` instance from `lib/api.ts`

---

## Tailwind Usage

### Custom Theme Colors

Always use the custom `primary` palette instead of Tailwind defaults:

```tsx
// ✅ Good — uses custom theme
<button className="bg-primary-500 hover:bg-primary-600 text-white">

// ❌ Bad — uses generic Tailwind green
<button className="bg-green-500 hover:bg-green-600 text-white">
```

### Common Patterns

```tsx
// Page container
<div className="p-6">

// Page title
<h1 className="text-2xl font-bold text-gray-800 mb-6">

// Card
<div className="bg-white rounded-lg shadow-sm p-6">

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Form field
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
  <input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
</div>

// Status badge
<span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
```

### Responsive Approach

Mobile-first with breakpoints:
- Default (no prefix): Mobile
- `md:`: Tablet (768px+)
- `lg:`: Desktop (1024px+)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## Type Definitions

All TypeScript interfaces live in `src/types/index.ts`:

```typescript
export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  roles: string[];
  isActivated: boolean;
}

export interface Chapter {
  id: number;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  price: number;
  isFree: boolean;
  subject: Subject;
  coverImageUrl?: string;
}
```

**Conventions:**
- All types in a single file (`types/index.ts`)
- Use `interface` for object shapes
- Use string literal unions for enums: `"DRAFT" | "PUBLISHED" | "ARCHIVED"`
- Optional fields use `?` suffix
- Nested types reference other interfaces
- Import as `import { User, Chapter } from "@/types"`

---

## Auth Context Usage

```tsx
"use client";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export default function SomePage() {
  const { user, isLoggedIn, activeRole, hasRole, isAdminOrManager } = useContext(AuthContext);

  // Check authentication
  if (!isLoggedIn) redirect("/auth/login");

  // Check specific role
  if (!hasRole("TEACHER")) return <Forbidden />;

  // Check admin/manager
  if (isAdminOrManager()) {
    // show admin features
  }

  return <div>Hello, {user?.fullName}</div>;
}
```

**Key methods:**
- `hasRole(role: string)` — checks if user has a specific role
- `isAdminOrManager()` — shorthand for admin/manager check
- `setActiveRole(role: string)` — switch active role (multi-role users)
- `removeAuthTokens()` — logout (clears localStorage + state)

---

## Internationalization (i18n)

### Using Translations

```tsx
import { useContext } from "react";
import { I18nContext } from "@/contexts/I18nProvider";

export default function Hero() {
  const { t } = useContext(I18nContext);

  return (
    <div>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.subtitle")}</p>
    </div>
  );
}
```

### Translation Key Structure

Keys use dot notation organized by section:

```json
{
  "nav": {
    "home": "Home",
    "classes": "Classes",
    "dashboard": "Dashboard"
  },
  "hero": {
    "title": "Empowering Education in the Hills",
    "subtitle": "Quality learning for every student"
  },
  "auth": {
    "login": {
      "title": "Welcome Back",
      "email": "Email Address",
      "password": "Password"
    }
  }
}
```

**Conventions:**
- Group by page/section: `nav.*`, `hero.*`, `auth.login.*`, `admin.dashboard.*`
- Use lowercase keys with dots: `footer.copyright`
- Variables use double braces: `"Welcome, {{name}}"`
- Bengali file mirrors the exact same key structure

---

## Loading States

### Page-Level Loading

Use Next.js `loading.tsx` convention:

```tsx
// app/admin/chapters/loading.tsx
export default function Loading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
```

### Component-Level Loading

Use the `LoadingSpinner` component:

```tsx
import { LoadingSpinner } from "@/components/LoadingSpinner";

if (loading) return <LoadingSpinner size="lg" label="Loading chapters..." />;
```

### Button Loading

```tsx
<Button isLoading={isSubmitting} type="submit">
  Save Chapter
</Button>
```

---

## Error Handling

### Toast Notifications

```tsx
import { toast } from "react-toastify";

// Success
toast.success("Chapter created successfully!");

// Error
toast.error("Failed to load data. Please try again.");

// From API errors
try {
  await createChapter(data);
  toast.success("Created!");
} catch (err: any) {
  toast.error(err.response?.data?.message || "Something went wrong");
}
```

### API Error Pattern

The Axios response interceptor handles 401s automatically (token refresh → retry → logout). Components handle other errors:

```tsx
useEffect(() => {
  fetchData()
    .then(res => setData(res.data))
    .catch(err => {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load");
    })
    .finally(() => setLoading(false));
}, []);
```

---

## How to Add a New Page/Feature

### Example: Adding a "Notice Board" page to the admin panel

#### 1. Create the API module functions

In `src/lib/admin.ts`, add:

```tsx
// Notices
export const getNotices = () => api.get("/v1/notices");
export const createNotice = (data: CreateNoticeRequest) => api.post("/v1/notices", data);
export const deleteNotice = (id: number) => api.delete(`/v1/notices/${id}`);
```

#### 2. Add TypeScript types

In `src/types/index.ts`, add:

```typescript
export interface Notice {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
}

export interface CreateNoticeRequest {
  title: string;
  content: string;
}
```

#### 3. Create the page

Create `src/app/admin/notices/page.tsx`:

```tsx
"use client";
import { useState, useEffect } from "react";
import { getNotices, createNotice, deleteNotice } from "@/lib/admin";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = () => {
    getNotices()
      .then(res => setNotices(res.data))
      .catch(() => toast.error("Failed to load notices"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notices</h1>
        <Button onClick={() => {/* open form modal */}}>Add Notice</Button>
      </div>
      <DataTable data={notices} columns={columns} />
    </div>
  );
}
```

#### 4. Add a loading skeleton (optional)

Create `src/app/admin/notices/loading.tsx`:

```tsx
export default function Loading() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}
```

#### 5. Add sidebar navigation

In `src/components/admin/AdminSidebar.tsx`, add a new nav item:

```tsx
{ label: "Notices", href: "/admin/notices", icon: HiOutlineBell }
```

#### 6. Add translations (if using i18n)

In `src/locales/en/common.json`:
```json
{
  "admin": {
    "notices": {
      "title": "Notices",
      "create": "Add Notice",
      "deleteConfirm": "Are you sure you want to delete this notice?"
    }
  }
}
```

And mirror in `src/locales/bn/common.json`.

---

## Path Aliases

The project uses `@/*` → `./src/*` path alias:

```tsx
// ✅ Good
import { Button } from "@/components/ui/Button";
import { getChapters } from "@/lib/admin";
import { Chapter } from "@/types";

// ❌ Bad
import { Button } from "../../components/ui/Button";
```

---

## File Naming

| Item | Convention | Example |
|------|-----------|---------|
| Page | `page.tsx` (Next.js convention) | `app/admin/classes/page.tsx` |
| Layout | `layout.tsx` | `app/admin/layout.tsx` |
| Loading | `loading.tsx` | `app/admin/loading.tsx` |
| Component | PascalCase | `ChapterForm.tsx`, `DataTable.tsx` |
| API module | camelCase | `admin.ts`, `student.ts` |
| Context | PascalCase | `AuthContext.tsx`, `I18nProvider.tsx` |
| Types | `index.ts` in `types/` | `types/index.ts` |
| Translations | `common.json` in locale dir | `locales/en/common.json` |
| Config | camelCase | `schoolInfo.json` |
