# Deploying the preview (free)

Frontend → **Vercel**. Backend → **Render** (a persistent Node process; Vercel's
serverless functions would lose the in-memory data). Deploy the backend first so
you have its URL for the frontend.

## 1. Backend on Render (free)

Easiest path uses the included `render.yaml`:

1. Go to **render.com** → sign up with GitHub.
2. **New → Blueprint** → pick the `montola-shop-preview` repo.
3. Render reads `render.yaml` and creates the `montola-demo-backend` web service
   (root dir `demo-backend`, free plan). Click **Apply**.
4. When it's live you'll get a URL like
   `https://montola-demo-backend.onrender.com`. Copy it.

Manual alternative (no blueprint): New → Web Service → repo → Root Directory
`demo-backend`, Build `npm install`, Start `node server.js`, Free plan.

> Free tier sleeps after ~15 min idle (first request then takes ~30–60s), and
> in-memory data resets to seed on every restart/wake. Fine for a preview.

## 2. Frontend on Vercel (free)

1. **vercel.com** → Add New → Project → import `montola-shop-preview`.
2. **Root Directory:** `frontend` (Next.js auto-detected).
3. **Environment Variables** — point at the Render backend:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND.onrender.com/api` |
   | `NEXT_PUBLIC_API_IMAGES_PROTOCOL` | `https` |
   | `NEXT_PUBLIC_API_IMAGES_HOSTNAME` | `YOUR-BACKEND.onrender.com` |

4. Deploy.

## Already deployed the frontend before the backend existed?

Just add/update `NEXT_PUBLIC_API_URL` in **Vercel → Project → Settings →
Environment Variables**, then **Redeploy** (Deployments → ⋯ → Redeploy).
Env-var changes only take effect on a new deployment.

## Notes
- Both hosts serve HTTPS, so there's no mixed-content blocking. Don't point the
  frontend at an `http://` backend.
- CORS in the demo backend reflects any origin, so the Vercel domain is allowed
  with no change.
