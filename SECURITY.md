## Security policy (quick)

- **Do not commit secrets**: `.env`, API keys, OAuth secrets, SMTP passwords, etc.
- Keep local configuration in `.env` (ignored by git). Use `.env.example` as a template.
- If you accidentally leaked a token, **rotate it immediately** in the provider dashboard.
