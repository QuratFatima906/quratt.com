# DNS snapshot — quratt.com

Taken **2026-08-18**, before delegating nameservers to Vercel (D9). Captured from public DNS
(`dig`) and `whois`, which is what actually resolves — the GoDaddy control panel may list
records that are not published, so the owner confirmation below matters as much as this table.

## Registration

| Field | Value |
|---|---|
| Registrar | GoDaddy.com, LLC |
| Created | 2021-10-13 |
| Nameservers | `ns25.domaincontrol.com`, `ns26.domaincontrol.com` (GoDaddy default) |
| Status | `clientTransferProhibited` + delete/renew/update prohibited (registrar lock — normal) |

## Zone as published

| Name | Type | Value | Recreate on Vercel? |
|---|---|---|---|
| `quratt.com` | SOA | `ns25.domaincontrol.com. dns.jomax.net.` | no — replaced by Vercel's |
| `quratt.com` | NS | `ns25`/`ns26.domaincontrol.com` | no — this is what delegation changes |
| `quratt.com` | A | `13.248.243.5`, `76.223.105.230` | **no** — GoDaddy parking, being replaced |
| `www.quratt.com` | A | same two parking IPs | **no** — replaced by the redirect to apex |
| `_domainconnect` | CNAME | `_domainconnect.gd.domaincontrol.com.` | no — GoDaddy's own setup helper |
| — | MX | **none** | — |
| — | TXT | **none** (no SPF, no verification tokens) | — |
| — | CAA | **none** | — |
| — | AAAA | **none** | — |
| `_dmarc`, `default._domainkey` | TXT | **none** | — |

Probed and absent: `mail`, `smtp`, `imap`, `pop`, `webmail`, `ftp`, `cpanel`, `blog`, `shop`,
`dev`, `staging`, `api`, `autodiscover`, `email`, `m`.

## What this means for delegation

**Nothing on this domain is in use.** The two A records are GoDaddy's parking page. There is no
mail: no MX means no server accepts mail for `@quratt.com` today, and no SPF/DKIM/DMARC means
none was ever configured. So delegation destroys nothing — the risk D9 accepted turns out to be
zero, measured rather than assumed.

**Nothing needs recreating on Vercel** beyond the apex and `www` that P8 adds anyway.

## Owner sign-off

- [x] Confirmed no GoDaddy email plan is attached to the domain, and none is planned before
      delegation. (A purchased-but-unconfigured mailbox publishes no MX, so `dig` cannot see it.)

If mail is ever added later, it is added as records **in Vercel's DNS**, not GoDaddy's.

## Rolling delegation back

Point the nameservers at `ns25.domaincontrol.com` / `ns26.domaincontrol.com` again in GoDaddy.
GoDaddy retains the original zone, so the parking records return. Propagation is bounded by the
registry TTL (48 h worst case, typically far less).

---

**Signed off 2026-08-18:** owner confirms no mail on the domain, none planned. Delegating.
