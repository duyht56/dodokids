## ADDED Requirements

### Requirement: Asset-URL checker blocks SSRF targets
Before fetching any publish asset URL, the server SHALL validate the URL and refuse to fetch internal/non-public targets. It MUST NOT follow redirects, MUST time out, and MUST NOT echo internal HTTP status/error strings back to the caller.

#### Scenario: Non-http(s) schemes are blocked
- **WHEN** an asset URL uses a scheme other than `http`/`https` (e.g. `file:`, `gopher:`, `data:`)
- **THEN** the URL is treated as broken with a generic `blocked` reason and is not fetched

#### Scenario: Loopback and metadata addresses are blocked
- **WHEN** an asset URL points at `localhost`/`127.0.0.1`/`::1`/`169.254.169.254` or any host resolving to a loopback/link-local address
- **THEN** the URL is not fetched and is reported as `blocked`

#### Scenario: Private and reserved ranges are blocked
- **WHEN** an asset URL resolves (via DNS) to an RFC1918 (`10/8`, `172.16/12`, `192.168/16`), CGNAT (`100.64/10`), ULA (`fc00::/7`), multicast, or reserved address
- **THEN** the URL is not fetched and is reported as `blocked`

#### Scenario: Redirects are not followed
- **WHEN** a fetched URL returns a 3xx redirect
- **THEN** the checker does not follow it (`redirect: 'manual'`) and treats the response as non-200

#### Scenario: Slow targets time out
- **WHEN** a target does not respond within the configured timeout
- **THEN** the fetch aborts and the URL is reported broken, without hanging the request

#### Scenario: Optional host allowlist
- **WHEN** `PUBLISH_ASSET_ALLOWED_HOSTS` is configured
- **THEN** only URLs whose host is in the allowlist may be fetched; all others are `blocked`

#### Scenario: No status oracle
- **WHEN** a URL is blocked for safety reasons
- **THEN** the reported reason is a generic `blocked`, not the internal HTTP status or raw connection error
