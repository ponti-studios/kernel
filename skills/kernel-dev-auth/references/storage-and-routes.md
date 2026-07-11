# Storage And Routes

Use this reference when deciding what auth owns in storage and route surface.

## Auth-Owned Tables

Only Better Auth-native and enabled-plugin tables belong in the auth schema.

| Table          | Source                     |
| -------------- | -------------------------- |
| `user`         | core                       |
| `session`      | core                       |
| `account`      | core                       |
| `verification` | core                       |
| `passkey`      | passkey plugin             |
| `jwks`         | jwt plugin                 |
| `device_code`  | deviceAuthorization plugin |

Add plugin tables only when the plugin is enabled.

Do not make auth own:

- app-domain role tables
- permission tables
- custom refresh/session caches

## Route Surface

Keep only thin wrappers around Better Auth-native endpoints:

| Route                      | Backed by                            |
| -------------------------- | ------------------------------------ |
| `/api/auth/session`        | Better Auth session                  |
| `/api/auth/jwks`           | Better Auth JWT plugin               |
| `/api/auth/token`          | Better Auth JWT plugin               |
| Email OTP send/verify      | Better Auth emailOTP plugin          |
| Passkey register/auth      | Better Auth passkey plugin           |
| Device authorization flows | Better Auth deviceAuthorization      |

Remove custom endpoints once Better Auth-native replacements are live:

- `/api/auth/refresh`
- `/api/auth/token-from-session`
- custom refresh-grant flows
- custom revocation/session-cache logic
