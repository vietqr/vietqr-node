# Changelog

## 1.2.0

Drop-in upgrade from 1.1.x: existing code keeps working, retired features only print a one-time `[vietqr]` warning.

- `genQRCodeBase64()` / `genQRCodeBase64V1()` generate the QR **offline** (no request to `/v2/generate`): EMVCo payload
  plus a plain QR image (`media`: `png`, `jpg` or `svg`). Same response shape, input cleaning and error codes as the API.
- Template images (`compact`, `compact2`, `print`, ...) are not generated offline: `genQRCodeBase64()` returns the plain
  QR for them (with a warning). Use `genQuickLink()` for template images.
- `getTemplate()` is offline and lists the Quick Link root themes from https://www.vietqr.io/qr-dong.md.
- `genQuickLink()` returns `https://img.vietqr.io/image/<bank>-<account>-<template>.<ext>?...` links
  (img.vietqr.io serves them as SVG).
- API keys are no longer needed: `clientID` / `apiKey` are accepted and ignored (warning).
- `createPaymentGateway()` is retired: no request, resolves to an `Error` (warning).
- `getBanks()` still calls `https://api.vietqr.io/v2/banks`.
- New exports: `generateQR`, `genQRText`, `BANKS`, `findBank`.
- New dependency: `jpeg-js` (pure JavaScript) for JPG output.
