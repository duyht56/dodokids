## ADDED Requirements

### Requirement: IAP Product Loading
On PaywallScreen mount the app SHALL call `getProducts` (or `initConnection` + `getSubscriptions` for `react-native-iap`) with product IDs `["kido_monthly_139k", "kido_annual_999k"]` and display the store-returned localised prices. If the store is unavailable the screen SHALL fall back to the hardcoded price strings and disable the CTA with a "Không kết nối được App Store / Google Play" message.

#### Scenario: Products load successfully
- **WHEN** the store connection succeeds
- **THEN** plan cards show the localised price strings returned by the store

#### Scenario: Store unavailable
- **WHEN** `initConnection` or `getProducts` throws
- **THEN** hardcoded prices are shown and the CTA is disabled with an error message

### Requirement: Purchase Flow
When the parent taps the CTA, the app SHALL call `requestSubscription` with the selected product ID. On success it SHALL send the purchase token / receipt to the backend (`POST /api/iap/verify-android` or `/verify-ios` depending on platform), sync the returned entitlement into `subscriptionStore`, dismiss the paywall, and navigate Home (unlocked). On failure or cancellation it SHALL return to the paywall without navigating away.

#### Scenario: Successful annual purchase on Android
- **WHEN** the parent selects the annual plan and the Google Play sheet completes successfully
- **THEN** the app posts the token to `/api/iap/verify-android`, updates the store, and navigates Home

#### Scenario: Successful purchase on iOS
- **WHEN** Apple confirms the purchase
- **THEN** the app posts the receipt to `/api/iap/verify-ios`, updates the store, and navigates Home

#### Scenario: Purchase cancelled
- **WHEN** the user cancels the native payment sheet
- **THEN** the paywall remains open and no navigation or store update occurs

#### Scenario: Backend verification failure
- **WHEN** the backend returns HTTP 402
- **THEN** an error toast is shown and the user stays on the paywall

### Requirement: Restore Purchases
The "Khôi phục mua hàng" link SHALL call `getAvailablePurchases`, send the most-recent active purchase to the appropriate backend verify endpoint, and restore entitlement if valid. An alert SHALL confirm success or inform the user if no active purchases are found.

#### Scenario: Active purchase found
- **WHEN** the user taps restore and a valid prior purchase exists
- **THEN** entitlement is restored, store is updated, and a success alert is shown

#### Scenario: No active purchases
- **WHEN** `getAvailablePurchases` returns an empty list
- **THEN** an alert informs the user that no active subscriptions were found

### Requirement: Pending Purchase Handling
The app SHALL register a `purchaseUpdatedListener` on mount and process any pending purchases (e.g. those interrupted by a network failure) by re-sending them to the backend verify endpoint. The listener SHALL be removed on unmount.

#### Scenario: Pending purchase resolved on reopen
- **WHEN** a purchase was interrupted and the user reopens the app
- **THEN** the pending purchase is detected and verification is retried automatically

### Requirement: App-launch Entitlement Sync
On app launch the app SHALL call `GET /children/:childId` (or a dedicated entitlement endpoint) to fetch the current server-side entitlement and overwrite the local `subscriptionStore` values, ensuring the store reflects server truth (e.g. after subscription expiry or renewal).

#### Scenario: Entitlement refreshed on launch
- **WHEN** the app starts and a childId is known
- **THEN** the subscription store is updated with the server's current `entitlement` values
