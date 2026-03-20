# Python Backend

Run locally with:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend loads env vars in this order:

1. project `.env.local`
2. `backend/.env`
3. shell environment

So you can either keep a dedicated `backend/.env`, or reuse your existing root `.env.local`.

If you want a dedicated backend file, create `backend/.env` from `backend/.env.example`, then fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

The Next.js app proxies `/api/*` requests to this backend through `PYTHON_BACKEND_URL`, which defaults to `http://127.0.0.1:8000`.
