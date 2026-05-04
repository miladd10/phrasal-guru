# Security Specification - Phrasal Guru

## Data Invariants
1. A user profile must only be accessible and modifiable by the owner.
2. Mastering lists are strictly bounded to 2000 items to prevent resource exhaustion.
3. Custom verbs must have a valid `userId` matching the owner.
4. Timestamps (`createdAt`, `updatedAt`) must be strictly validated against `request.time`.
5. All writes require a verified email (`email_verified == true`).

## The "Dirty Dozen" Payloads (Attack Vectors)

1. **Identity Spoofing (Create Profile)**: Attempt to create a profile for another user.
   - Payload: `{ "masteredVerbs": [], "updatedAt": "request.time" }` at `/users/attacker_id`
   - Expected: `PERMISSION_DENIED` if UID doesn't match.

2. **Privilege Escalation (Update Profile)**: Attempt to inject extra fields into user profile.
   - Payload: `{ "masteredVerbs": [], "updatedAt": "request.time", "isAdmin": true }`
   - Expected: `PERMISSION_DENIED` via `affectedKeys().hasOnly()`.

3. **Identity Spoofing (Create Verb)**: Attempt to create a verb with another user's ID.
   - Payload: `{ "verb": "test", ..., "userId": "victim_id", "createdAt": "request.time" }`
   - Expected: `PERMISSION_DENIED` via `data.userId == request.auth.uid`.

4. **Resource Exhaustion (Long Strings)**: Attempt to inject a 1MB string into the verb definition.
   - Payload: `{ "verb": "test", "definition": "A".repeat(1000000), ... }`
   - Expected: `PERMISSION_DENIED` via `.size() <= 500`.

5. **Resource Exhaustion (ID Poisoning)**: Attempt to create a document with a massive ID.
   - Path: `/users/uid/customVerbs/` + "A".repeat(2000)
   - Expected: `PERMISSION_DENIED` via `isValidId()`.

6. **Temporal Attack (Fake Timestamp)**: Attempt to send a client-side timestamp.
   - Payload: `{ ..., "createdAt": "2020-01-01T00:00:00Z" }`
   - Expected: `PERMISSION_DENIED` via `== request.time`.

7. **Cross-User Snooping (List Verbs)**: Attempt to list another user's verbs.
   - Query: `collection('users/victim_id/customVerbs')`
   - Expected: `PERMISSION_DENIED` via `isOwner(userId)`.

8. **Orphaned Write (Invalid Reference)**: Attempt to create a verb for a non-existent user path? (Path already enforces this).

9. **PII Leak (Profile Get)**: Attempt to read another user's profile.
   - Expected: `PERMISSION_DENIED` via `isOwner(userId)`.

10. **State Shortcut (Bulk Mastering)**: Attempt to send 10,000 mastered verbs at once.
    - Expected: `PERMISSION_DENIED` via `.size() <= 2000`.

11. **Unverified Account Write**: Attempt to write with `email_verified: false`.
    - Expected: `PERMISSION_DENIED` via `isVerified()`.

12. **Shadow Field Injection**: Attempt to update a verb with a "isSystem" field.
    - Expected: `PERMISSION_DENIED` via `affectedKeys().hasOnly()`.

## Test Suite Plan
A suite of tests will verify these invariants using the Firestore emulator or equivalent verification logic in the rules.
