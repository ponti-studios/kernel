# Research brief: which licensing service to use

Paste this to whatever agent you use for research. It is written so the answer comes back usable — a
ranked decision plus the integration shape, not a survey. Replace the angle-bracketed parts.

```
You are researching a licensing service for a commercial macOS app. Produce a decision, not a list.
Another engineer will implement your recommendation from your answer without further research.

THE PRODUCT
<Name>: a native macOS <floor> app, Swift + SwiftUI, written by one developer. <One sentence on what it
does and why someone pays.> Sold as a signed, notarized DMG downloaded from the developer's own website —
not the App Store, so App Store IAP is out of scope. No user accounts, no telemetry, no server of any
kind. The entire pitch is that nothing leaves the user's Mac. Sole trader in <country>, so VAT and
sales-tax handling matters.

WHAT IS ALREADY DECIDED (do not re-litigate)
- Distribution: DMG, Developer ID signed, hardened runtime, not sandboxed.
- Dependencies today: <list>. No crash reporting, no analytics, no networking in the app at all.
- No licence code exists yet. The Keychain is unused, so adding one item is fine.

WHAT THE SERVICE MUST SATISFY
1. Merchant of record, or not? Say which services actually take on VAT/sales tax and which merely
   process payments. This matters more than a 1% fee difference.
2. Offline verification. The best fit is a signed licence file (or key) the app verifies locally with a
   public key — no server call at launch — with an optional periodic re-check. A service that requires a
   round trip on every launch, or phones home telemetry, contradicts the product. For each candidate,
   state exactly how verification works and whether the format is documented and stable.
3. Swift integration. Ideally plain URLSession + CryptoKit (Ed25519/RSA) against a REST API. A heavyweight
   or cross-platform SDK is a bad fit; so is anything requiring JIT, unsigned dynamic libraries, or writes
   outside standard locations, because of the hardened runtime.
4. Activation UX without accounts: paste a key, it lands in the Keychain, done. If a service requires the
   buyer to create an account or log in, say so plainly — that is a strike against it.
5. Seat limits, deactivation, transfer to a new machine, revocation, and what happens on refund (do keys
   die automatically?). Note anything that expects a hardware identifier.
6. One-time purchase vs subscription for this kind of app: recommend one, say whether the service supports
   both, and whether it supports a time-limited trial without a key.
7. Pricing: real numbers (percentage, minimums, payout schedule, chargebacks), and how portable the keys
   are if the developer later switches services.
8. Do not recommend building payment handling. Do cover download/appcast hosting if a candidate bundles it
   with updates, since the app will otherwise use Sparkle.

DELIVER
A. A ranked shortlist of at most three, in a table: service | merchant of record | offline verification
   (mechanism) | Swift integration shape | cost | the single biggest gotcha | why we might not pick it.
B. For the winner: a concrete integration plan — the exact endpoints and payloads for purchase →
   activation → validation → deactivation, a Swift sketch of the offline verification, what to store in
   the Keychain, and the UX inside an app whose window is a menu bar item.
C. A cost model at three price points and three sales volumes, showing what the developer nets.
D. Cite a source link and a date for every price and feature claim, and flag anything you could not
   verify or that looks like it changed recently.

Constraints on your process: verify current pricing and features rather than recalling them; assume the
developer is one person, so integration effort counts for more than a marginal fee; and state what would
change your recommendation (e.g. if offline verification is non-negotiable, which popular options does
that eliminate?).
```

## Why the brief is shaped this way

- **The hard technical constraints come before the feature list.** "Hardened runtime", "no accounts", "no
  network on launch" eliminate candidates that look fine in a comparison table.
- **Merchant of record is asked first** because it decides the real cost, and a 1 % fee difference is noise
  beside handling VAT yourself.
- **The delivery shape (A–D) is what makes the answer implementable**: a decision, an integration plan, a
  cost model, and citations. Without it you get a survey and still have to do the research.
- **Ask it to state what would change its mind.** That is where you find out whether the recommendation is
  load-bearing or a preference.
