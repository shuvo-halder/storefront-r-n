# Storefront Review API Integration & Contract Verification Report

## Overview

The Vyzobd Storefront review system has been integrated with the backend REST API (`https://admin.vyzobd.com/api/storefront/v1`) in accordance with the backend contract.

---

## 1. Storefront Review API Contract Matrix

| Endpoint | HTTP Method | Auth Required | Purpose | Payload / Query | Response Structure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/reviews/:productId` | `GET` | No | Fetch approved reviews, distribution breakdown, and pagination | Query: `page`, `limit`, `rating`, `hasImages`, `sort` | `{ reviews: ProductReview[], stats: ReviewStats, total, page, limit, totalPages }` |
| `/reviews/:productId/eligibility` | `POST` | No | Authoritative customer review entitlement check | Body: `{ mobile: string }` | `{ eligible: boolean, message?: string, orderItemId?: string, reason?: string }` |
| `/reviews/:productId` | `POST` | No / Optional Auth | Submit customer/guest product review | Body: `{ name, mobile, email?, rating, reviewHeadline?, reviewComment, images?: string[] }` | `{ status: "success", data: ProductReview }` |
| `/reviews/featured` | `GET` | No | Fetch curated 5-star approved reviews for homepage carousel | Query: `limit=5` | `{ status: "success", data: FeaturedReview[] }` |

---

## 2. Image Upload Pipeline (Cloudinary)

- **Client Validation**: Enforces maximum 5 images, maximum 5 MB per file, and strict MIME type checks (`image/jpeg`, `image/png`, `image/webp`).
- **Cloudinary Integration**: Utilizes `uploadService.ts` to transform file inputs into permanent Cloudinary `https://res.cloudinary.com/...` URL strings prior to submission.
- **Contract Adherence**: Submits only `images: string[]` in the final `POST /reviews/:productId` payload—never sending `File[]`, `Blob[]`, or ephemeral `blob:` URLs to the review API.

---

## 3. Component Integrations

1. **`ReviewFormModal.tsx`**:
   - Executes `POST /reviews/:productId/eligibility` check using the entered mobile number before submission.
   - Converts image uploads via Cloudinary pipeline into `string[]`.
   - Submits payload matching the backend schema and updates local review lists on success.

2. **`ReviewSection.tsx` & `ReviewList.tsx`**:
   - Queries `GET /reviews/:productId` with pagination support and dynamic breakdown statistics.
   - Handles loading, error with retry, and empty states.

3. **`CustomerReviewCarousel.tsx`**:
   - Queries `GET /reviews/featured` for curated homepage reviews.
   - Enforces exact **302px** layout height, 5-card carousel with center highlight and 4000ms autoplay.

---

## 4. Environment Variables

Documented in `.env.example`:
```env
NEXT_PUBLIC_API_URL=https://admin.vyzobd.com/api/storefront/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```
