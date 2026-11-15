# Security Specification — SI-WARGA 05 Firestore Rules

## 1. Data Invariants
- Every document ID in `citizens`, `attachments`, `letters`, `programs`, `feedback`, and `admins` must match `^[a-zA-Z0-9_-]+$` and be <= 128 chars.
- PII documents (`citizens`, `citizens/{id}/attachments`, `letters`) must never be publicly readable or listable by unauthenticated users or non-owner residents. Only `isAdmin()` or the owning verified user (`ownerUid == request.auth.uid`) can read or query their own records.
- Attachment payloads (`ktp`, `kk`) are isolated in `/citizens/{citizenId}/attachments/{attachmentId}` with a strict `dataUrl.size() <= 550000` limit so no document approaches Firestore's 1 MB document ceiling.
- All `createdAt` and `updatedAt` timestamps must match `request.time`; `createdAt` and `ownerUid` are immutable on update.
- Residents (`!isAdmin()`) cannot self-verify (`diverifikasiRt` cannot be set or altered to `true` by non-admins) and cannot alter `status` of a letter request once created as `'Menunggu Verifikasi'`.
- Admin privileges are verified only via verified email (`rt05perumahanbsi@gmail.com`) or `/admins/{request.auth.uid}` lookup, never via client claims.

## 2. The "Dirty Dozen" Attack Payloads
1. Unauthenticated read/list of `/citizens`: must return `PERMISSION_DENIED`.
2. Signed-in non-owner trying to `get` or `list` another resident's `/citizens/{id}`: must return `PERMISSION_DENIED`.
3. Signed-in user with `email_verified == false` attempting to create `/citizens/{id}`: must return `PERMISSION_DENIED`.
4. Shadow field injection on `/citizens/{id}` create (`extraAdminFlag: true`): blocked by `keys().hasOnly(...)`.
5. Identity spoofing on `/citizens/{id}` create (`ownerUid` != `request.auth.uid` for non-admin): blocked by `ownerUid == request.auth.uid`.
6. Privilege escalation on `/citizens/{id}` update (resident changing `diverifikasiRt: false -> true`): blocked by `affectedKeys().hasOnly(...)` and `diverifikasiRt == existing().diverifikasiRt`.
7. Resource poisoning / Denial-of-Wallet via 1.5 MB string in `citizenId` or `catatanKhusus`: blocked by `isValidId()` and `.size()` bounds.
8. Client timestamp forgery (`createdAt: "2020-01-01"`) on create or update: blocked by `== request.time`.
9. Oversized attachment in `/citizens/{id}/attachments/ktp` (`dataUrl.size() > 550000`) or invalid `attachmentId` (`passport`): blocked by `attachmentId in ['ktp', 'kk']` and size check.
10. Letter status shortcutting by resident (`status: "Disetujui RT"` on create or modifying `"Selesai"` letter): blocked by `status == 'Menunggu Verifikasi'` and terminal state lock.
11. Orphaned feedback write to `/programs/nonexistent/feedback/f1`: blocked by `exists(/databases/$(database)/documents/programs/$(programId))`.
12. Vote manipulation on `/programs/{id}` (`jumlahDukungan + 50` or editing `judul` by non-admin): blocked by `incoming().jumlahDukungan == existing().jumlahDukungan + 1` and `affectedKeys().hasOnly(['jumlahDukungan', 'updatedAt'])`.
