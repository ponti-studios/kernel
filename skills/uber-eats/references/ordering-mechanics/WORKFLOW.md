# Ordering mechanics

How the Uber Eats web app behaves, and the exact browser moves that work. Commands are for the `browsermcp` browser tool: one command per line, executed in order, stopping at the first error.

## Session and address

Go to `https://www.ubereats.com/gb`. The saved address is encoded in the `pl` query parameter, so every onward link carries it — do not rebuild those URLs by hand. Confirm the header reads **"Deliver to <expected address>"** before building anything. If it reads a different address, say so instead of ordering to the wrong door.

Menu prices, availability and fees are all address-dependent. Changing the address mid-flow invalidates the cart.

## Finding a store

Typing into the search box and submitting is unreliable (the form often just re-renders the feed). Go straight to the results URL:

```
goto https://www.ubereats.com/gb/search?diningMode=DELIVERY&q=indian
wait 4000
```

Result cards are links of the shape `/gb/store/<slug>/<uuid>`. The anchor's own text is only the store name — the rating, fee and ETA live in the parent card, so read the parent. One eval beats a snapshot, which is enormous here:

```js
() => [...document.querySelectorAll('a[href*="/gb/store/"]')]
  .map(a => ((a.parentElement && a.parentElement.innerText) || '').replace(/\n/g,' · '))
  .filter(t => /Delivery Fee|min/.test(t))
  .filter((t,i,arr) => arr.indexOf(t) === i)
  .slice(0, 10).join('\n')
```

Each line reads `Name · promo · Sponsored · £x Delivery Fee · 4.7 · (4,000+) · 20 min · Great value`. Judge on rating with review count, fee and ETA together — a 4.2 with 92 reviews is not the same claim as a 4.7 with 4,000.

Sponsored rows dominate the first screen; that is normal rather than suspicious. Read past the label and compare the numbers.

## The store page

Open the store with `click <ref>` from a snapshot, or `goto` the card's href plus `?diningMode=DELIVERY`. It shows the opening hours as a button (`Franco Manca 16:00 – 23:59`) — if it is closed, the ETA is tomorrow, so check before promising dinner.

## Reading the whole menu in one call

Every menu item is an anchor carrying `mod=quickView`. This single eval returns the entire menu, with each dish's like-rate and description — which is what you need to filter on diet and pick well:

```js
() => [...document.querySelectorAll('a[href*="mod=quickView"]')]
  .map(a => a.innerText.replace(/\n/g,' | '))
  .filter((t,i,arr) => arr.indexOf(t) === i)
  .join('\n')
```

Each line reads `Punjabi Veg Samosa (3 Pieces) | £6.00 | • | 92% (331) | Home made Punjabi samosa with potato and green peas…`.

Items appear twice — once in a "most liked" carousel, once in the full menu — hence the dedupe. The percentage is the share of diners who liked the dish and the bracketed number is how many; a 96% dish with 286 ratings is the safest order on the page, while a 71% with 14 tells you nothing much.

Read the descriptions for ingredient words: this is where "cured Iberico chorizo", "Cantabrian anchovies", "minced meat" and "Genovese ragu" actually appear. Badges like "Free on £30+" and "#1 most liked" sit in the same string.

## Choosing inside a bundle

Bundles and multi-choice items open a picker in a real dialog:

```
click "a[href*='mod=quickView']:has-text('Bundle for 2 + Drinks')"
```

`:has-text()` can match the same bundle twice (it is listed under both "Save on selected items" and "Picked for you"). Prefer a ref from `snapshot -i`, or resolve the href in an eval and `goto` it.

The picker is a portal, so snapshot the dialog itself:

```
snapshot "div[role='dialog']" -i --depth 8
get text "div[role='dialog']" --max all
```

`get text` gives the whole option list — pizza names, dips, drinks and surcharges — but the per-option `+` buttons come back with no accessible name. Map them by reading each row:

```js
() => [...document.querySelectorAll("div[role='dialog'] button[aria-label='Increment']")]
  .map((b,i) => i + ':' + (b.parentElement.parentElement.innerText || '').split('\n')[0])
  .join(' | ')
```

Then tag the buttons you want and click them by CSS. This survives React re-renders, unlike indices:

```js
() => {
  const want = {'Mushroom Sm Burrata 10':'pizza1','Grana Truffle Dip':'dip1'};
  const bs = [...document.querySelectorAll("div[role='dialog'] button[aria-label='Increment']")];
  return bs.map(b => {
    const name = ((b.parentElement.parentElement.innerText || '').split('\n')[0]).trim();
    if (want[name]) { b.setAttribute('data-fm', want[name]); return name; }
  }).filter(Boolean).join(', ');
}
```

```
click "[data-fm='pizza1']"
```

A row below the fold fails with **"covered by `div._ag`"** — that is the sticky footer, not a missing element. Scroll it into view first, then click:

```
scroll "[data-fm='dip1']"
click "[data-fm='dip1']"
```

Radios (the "Choose your Bite" group) take a role locator:

```
click "getByRole('radio', { name: 'Garlic Bread' })"
```

**Verify the selection, don't assume it.** The chosen options render as a `1` badge before their name inside the group's row text:

```js
() => [...document.querySelectorAll("div[role='dialog'] li")][1].innerText.replace(/\n/g,'~')
```

That reads back as `…~1~Potato Gorgonzola 11 Bundle~…~1~Mushroom Sm Burrata 10~…`, which is proof both pizzas landed.

## Adding and reading the cart

```
click "getByRole('button', { name: /Add 1 to order/ })"
```

The header cart then reads "**1 item**" (it counts bundles, not dishes). Click it and the cart opens as a **side panel, not a dialog**:

```
click "getByRole('button', { name: /^[0-9]+ items?$/ })"
screenshot --path <tmp>/cart.png
```

Screenshot, because the panel is a large unlabelled div and the usual selectors miss it. It shows every component, the promotion, the fee waivers and the subtotal — the number to quote in the report.

`https://www.ubereats.com/gb/cart` is a dead end: it renders a stub page with no line items. Always go through the header button.

## Delivery time

The store page carries the estimate as text next to "Earliest arrival":

```js
() => {
  const e = [...document.querySelectorAll('*')]
    .find(x => x.children.length === 0 && x.textContent.trim() === 'Earliest arrival');
  return e.parentElement.parentElement.innerText.replace(/\n/g,' ~ ');
}
```

→ `14 min ~ ~ Earliest arrival`. Re-read the ETA on the checkout screen and quote that one; the store page figure is optimistic.

## Checkout

`Go to checkout` is a button in the cart panel. The checkout screen shows the address, the payment method, the full fee breakdown and the final ETA, with `Place order` at the bottom. Read the total and ETA from there, report, and wait.

If the account has no saved card, or 3-D Secure appears, stop and hand over — typing card or verification details is not this skill's job.

## Noise

- `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT` — the user's ad blocker. Ignore it, and don't waste a turn "fixing" it.
- Console errors arrive in the hundreds on this site. Never let a console error alone justify abandoning an approach; check the screenshot.
- `eval` must be a single line. Multi-line functions break the command parser — collapse to semicolons, and wrap the whole function in double quotes with inner double quotes escaped.
