# Better Auth Surface Map

Use this reference when choosing the authentication surface for each client type.

## Default Client Mapping

| Client type        | Preferred auth surface                |
| ------------------ | ------------------------------------- |
| First-party web    | Better Auth session cookies           |
| Desktop (Electron) | Better Auth session cookies           |
| Mobile / Expo      | Better Auth JWT + bearer plugin       |
| CLI                | Better Auth device authorization      |
| Non-browser SDK    | Better Auth JWT + bearer plugin       |

## Selection Rules

- Web-like clients should prefer session cookies when the environment supports them.
- Non-browser clients should use the Better Auth-native bearer/JWT surface rather than inventing custom session bridging.
- CLI flows should use device authorization rather than raw password or browser-cookie hacks.
- Service-to-service auth is separate from end-user auth; do not reuse user session flows for service credentials.

## Anti-Patterns

- Web app issues its own bearer token because “mobile also needs one”
- CLI reuses browser session cookies
- Custom refresh endpoint layered on top of Better Auth
- Multiple auth surfaces for the same client with unclear precedence
