# Supplied API contract observations

**Observed:** 2026-10-13. These are read-only GET observations from the public service, not guarantees about uptime or future schema. No cart POST was sent.

## Service and list

Base URL: `https://itx-frontend-test.onrender.com`.

`GET /api/product` returned HTTP success with a JSON array. Each inspected row used a string opaque `id`, string `brand`, string `model`, string `price`, and absolute HTTPS `imgUrl`. Some price strings were empty. The response preserved distinct product order. IDs include URL-safe punctuation such as `_` and `-`; the client still encodes them as a single path segment.

Representative sanitized row:

```json
{"id":"ZmGrkLRPXOTpxsU4jjAcv","brand":"Acer","model":"Iconia Talk S","price":"170","imgUrl":"https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg"}
```

## Detail

`GET /api/product/ZmGrkLRPXOTpxsU4jjAcv` returned HTTP success and a JSON object whose `id` matched the requested ID. The observed detail fields included `cpu`, `ram`, `os`, `displaySize`, `displayResolution`, `battery`, `primaryCamera`, `secondaryCmera`, `dimentions`, and `weight`. The service spells the latter two keys exactly as shown (including typos). Camera data was an array of strings. `displaySize` described the physical display diagonal; `displayResolution` contained pixel dimensions and pixel density. `dimentions` contained a dimension string and `weight` a numeric string. The object also included `colors`, `internalMemory`, and `options.colors`/`options.storages`. Option entries had numeric `code` values and string `name` labels; observed codes included 1000 and 2000/2001. A single sample does not establish all possible cardinalities or values.

Representative sanitized detail excerpt:

```json
{"id":"ZmGrkLRPXOTpxsU4jjAcv","brand":"Acer","model":"Iconia Talk S","price":"170","displayResolution":"720 x 1280 pixels (~210 ppi pixel density)","primaryCamera":["13 MP","autofocus"],"secondaryCmera":["2 MP","720p"],"dimentions":"191.7 x 101 x 9.4 mm (7.55 x 3.98 x 0.37 in)","weight":"260","options":{"colors":[{"code":1000,"name":"Black"}],"storages":[{"code":2000,"name":"16 GB"},{"code":2001,"name":"32 GB"}]}}
```

The source's requested screen-resolution attribute maps to `displayResolution` because that field contains pixels. `displaySize` is not substituted for resolution. Missing/blank optional values remain unavailable in the UI. The service states no currency or units.

On 2026-10-14 every live price was a whole-number string, and the weights in a sample of 13 details (every eighth product) were plain numbers between 105 and 700. The UI therefore shows a plain numeric price in euros (`€170`) and a plain numeric weight in grams (`260 g`). EUR is an assumption based on the brief's Spanish origin. Values that are not plain numbers are shown as supplied. See `src/features/catalog/model/format.ts`.

## Read-only CORS and preflight observation

On 2026-10-13, from the running Vite origin `http://127.0.0.1:5173`, a read-only `GET /api/product` with that `Origin` returned HTTP 200 and `Access-Control-Allow-Origin: *`. A read-only `OPTIONS /api/cart` preflight with requested method `POST` and requested header `content-type` returned HTTP 200, `Allow: POST`, `Access-Control-Allow-Origin: *`, and `Access-Control-Allow-Headers` including `Content-Type`. This supports browser CORS for the current JSON request without credentials. This is response-header evidence collected with curl, not a browser-engine CORS test.

Both responses included an `HttpOnly` `session_id` cookie. Its meaning and whether it affects cart identity/count remain unverified. The client does not add cross-origin credentials or infer session guarantees from the header. No POST was sent.

## Live smoke check (2026-10-13, 20:20 UTC)

These were read-only GETs with finite timeouts; no POST was sent.

- `GET /api/product`: HTTP 200 after **52.4 s**, because the service was cold. The list returned **100** products (the brief and earlier observation described 37) with keys `id`, `brand`, `model`, `price`, `imgUrl`. IDs were unique, 6 prices were blank, and every `imgUrl` used the API origin.
- `GET /api/product/ZmGrkLRPXOTpxsU4jjAcv`: HTTP 200 with the same options as the earlier observation.
- `GET /api/product/does-not-exist-xyz`: **HTTP 500** `{"message":"An Unexpected Error Occurred","code":0}`. The service does not report not-found distinctly, so the UI shows its retryable error state for unknown ids.
- Real-browser check: the production build (`vite preview`) loaded the live catalog (100 cards), a product detail page and its image in Chromium, Firefox and WebKit, with no page errors. This confirms browser-engine CORS for reads under the production CSP.

## Still unverified

- The complete schema across all products, including malformed/missing fields and option combinations beyond the sampled detail.
- Timeout distribution beyond one observed cold start: with the 20 s client timeout, the first request to a sleeping service fails and a manual retry succeeds.
- Cart preflight in a browser engine, cookies/session requirements, and cart semantics.
- `POST /api/cart` response shape and whether `count` is authoritative. The implementation follows the PDF's `{ id, colorCode, storageCode }` request and `{ count }` response contract using mocks; no live POST has been made.

The implementation uses a finite 20-second timeout, validates every response, and presents recoverable errors. It does not assume credentials, retries, or idempotency. See the SDD specifications and verification report for acceptance limits.
