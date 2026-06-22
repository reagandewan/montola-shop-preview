# Montola School — Demo Backend

A lightweight **in-memory** Express server that mimics the real Montola School
Java/Spring backend's API contract, so the
[frontend](https://github.com/Avi-Dewan/Montola-School-FrontEnd) can run locally
without Postgres, Docker, Java, or a Resend email key.

> ⚠️ Demo only. Passwords are plain text, data lives in memory and resets on
> restart. Do not use for anything real.

## Run

```bash
cd /Users/reagan/Montola-School/demo-backend
npm install            # first time only
npm start              # serves http://localhost:8080
# or auto-restart on edits to data.js/server.js:
# node --watch server.js
```

## Demo logins

All passwords are `password123`.

| Email | Role(s) | Lands on |
|-------|---------|----------|
| `admin@montola.test` | ADMIN | `/admin` dashboard |
| `manager@montola.test` | MANAGER | `/admin` dashboard |
| `teacher@montola.test` | TEACHER | `/teacher` |
| `student@montola.test` | STUDENT | `/` (enrolled in 2 chapters) |
| `multi@montola.test` | TEACHER + STUDENT | role toggle |

## What's seeded

- 2 classes (Class 9, Class 10), 5 subjects, 7 chapters (free + paid, published + draft)
- Topics + content items: lectures (with YouTube video ids + rich text), quizzes
  (MCQ / fill-blank / matching / written), and Google-PDF placeholders
- Featured chapters, free chapters
- Payments (pending + verified, bKash/Nagad), enrollments, and student progress

## Notes / limitations

- **Images return 404** (cover images, profile pictures). The UI degrades
  gracefully — no real image bytes are stored.
- Writes (create/update/delete from admin & teacher panels) work but are
  in-memory only; restarting the server resets everything to the seed data.
- JWT login + auto-refresh on 401 are real, so the auth flow behaves like prod.

To add or change seed data, edit `data.js` and restart.
