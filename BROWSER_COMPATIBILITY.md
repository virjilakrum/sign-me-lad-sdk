# Browser Compatibility

This document outlines the browser compatibility of SignMeLad and provides information about how the SDK handles different browser environments.

## Supported Browsers

SignMeLad is tested and supported on the following browsers:

| Browser         | Minimum Version | Notes                                    |
|-----------------|----------------|------------------------------------------|
| Chrome          | 61+            | Full support                             |
| Firefox         | 60+            | Full support                             |
| Safari          | 11+            | Full support                             |
| Edge (Chromium) | 79+            | Full support                             |
| Opera           | 48+            | Full support                             |
| Edge (Legacy)   | 16+            | Basic support, some features may be limited |
| Safari iOS      | 11+            | Mobile support                           |
| Chrome Android  | 61+            | Mobile support                           |

## Required Browser Features

The SDK relies on the following browser features:

- **ES2020 JavaScript Support**: The SDK uses modern JavaScript features like optional chaining, nullish coalescing, and more.
- **Promise API**: For asynchronous operations.
- **Fetch API**: For making HTTP requests to backend services.
- **localStorage**: For storing authentication tokens (if using the default storage mechanism).
- **TextEncoder/TextDecoder**: For encoding/decoding messages for signing.

## Polyfills

For older browsers, you may need to include the following polyfills:

- Promise polyfill
- Fetch polyfill
- TextEncoder/TextDecoder polyfill

A simplified example of including polyfills:

```html
<!-- Include these before loading the SDK -->
<script src="https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/text-encoding@0.7.0/lib/encoding.min.js"></script>
```

## Mobile Browser Support

The SDK works on mobile browsers, but there are some considerations:

1. **Wallet Connections**: Mobile browsers may handle wallet connections differently than desktop browsers. Some wallets may redirect users to a separate app.

2. **Deep Linking**: For the best mobile experience, consider implementing deep linking to handle wallet redirects.

3. **UI Considerations**: Ensure your authentication UI is responsive and works well on smaller screens.

## Browser Detection

The SDK automatically detects if it's running in a browser environment. Server-side usage (e.g., Node.js) is supported for verification functions but not for wallet connection features.

The detection is performed using:

```typescript
if (typeof window === 'undefined') {
  // Not in a browser environment
}
```

## Browser Extension Requirements

To use the SDK, users must have a Solana wallet browser extension installed. The SDK supports:

- Phantom
- Solflare
- Sollet
- Slope

The SDK will attempt to detect any of these wallet extensions and will throw a `WalletNotFoundError` if none are found.

## Wallet Provider Behavior

Different wallet providers may have slightly different behaviors:

1. **Phantom**: Adds `window.phantom.solana` to the global scope.
2. **Solflare**: Adds `window.solflare` to the global scope.
3. **Sollet**: Adds `window.sollet` to the global scope.
4. **Slope**: Adds `window.slope` to the global scope.

The SDK handles these differences transparently.

## Testing in Different Browsers

When implementing the SDK, we recommend testing in multiple browsers to ensure compatibility. Pay special attention to:

1. Wallet connection behavior
2. Message signing UI
3. Session persistence
4. Error handling

## Reporting Browser-Specific Issues

If you encounter browser-specific issues, please report them with:

1. Browser name and version
2. Operating system
3. Wallet extension being used
4. Steps to reproduce
5. Expected vs. actual behavior

## Progressive Enhancement

For applications that need to support very old browsers, consider implementing progressive enhancement:

1. Detect browser capabilities
2. Fall back to traditional authentication methods if necessary
3. Provide clear instructions for users on unsupported browsers
