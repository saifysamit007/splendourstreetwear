# Firestore Security Specification

## 1. Data Invariants
- Products: Only admins can manage products.
- Orders: Users can only see/edit their own orders. Admins can see all.
- Comments: Anyone can read, but only authors can edit/delete their comments.
- SiteConfig: Global settings, only admin can modify.
- Admins: Only existing admins (or the system) can grant admin status.

## 2. "Dirty Dozen" Payloads (Testing for Denials)
1. **Unauthenticated Write**: Creating a product without being signed in.
2. **Identity Spoofing**: Creating an order with someone else's `userId`.
3. **Privilege Escalation**: Updating a product's price as a regular user.
4. **ID Poisoning**: Injecting a 2KB string as a `productId`.
5. **State Shortcutting**: Manually setting an order status to 'delivered' by the customer.
6. **Shadow Fields**: Adding an `isAdmin: true` field to a product document.
7. **Orphaned Writes**: Creating an order for a non-existent product.
8. **Resource Exhaustion**: Sending a 1MB string in a product description.
9. **Unauthorized Profile Read**: Fetching a user profile document belonging to another user.
10. **Global Config Tampering**: Updating `logoText` in `siteConfig` as a non-admin.
11. **Negative Price**: Creating a product with a negative price.
12. **Recursive List Query**: Requesting all orders in the system without a `userId` filter as a regular user.

## 3. Test Runner Invariant
All payloads above MUST return `PERMISSION_DENIED`.
