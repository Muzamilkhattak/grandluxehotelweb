# Technical Architecture Document: Luxury Hotel Booking Platform

## 1. System Overview & Architecture Topology

The application follows a **Modern Monolithic / Modular Server-Side Rendered (SSR)** architecture built on Next.js, leveraging a relational database layer and third-party cloud services for media optimization and email dispatch.

```
+-----------------------------------------------------------------+
|                         CLIENT LAYER                            |
|     [ Next.js Frontend (SSR / ISR) + Tailwind CSS + Framer ]      |
+-----------------------------------------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------+
|                       API & ROUTING LAYER                       |
|         [ Next.js Server Actions / App Router Endpoints ]       |
+-----------------------------------------------------------------+
          |                                       |
          v                                       v
+-----------------------+               +-------------------------+
|    DATABASE LAYER     |               | THIRD-PARTY INTEGRATIONS|
|  [ PostgreSQL (ORM) ] |               | - Cloudinary (Media)    |
|  - Users & Roles      |               | - Resend (Transactional |
|  - Rooms & Amenities  |               |   Email Service)        |
|  - Bookings & Dates   |               +-------------------------+
+-----------------------+
```

---

## 2. Component Breakdown & Data Flow

### 2.1 Frontend & Rendering Engine (Next.js App Router)
* **Server-Side Rendering (SSR):** Landing pages and room catalog pages are pre-rendered on the server to pass rich meta tags and schema markup to search engine crawlers, ensuring top-tier SEO performance.
* **Client-Side Interactivity:** Interactive availability search widgets, image galleries, and the admin dashboard utilize React client components for fluid state transitions.

### 2.2 Database Architecture (PostgreSQL)
A robust relational model ensuring zero double-booking overlaps via strict date constraint validation.

#### Core Tables:
1. **`users`**: Manages guest and admin accounts.
   * `id` (UUID, PK)
   * `email` (VARCHAR, Unique)
   * `role` (ENUM: `guest`, `admin`)
   * `created_at` (TIMESTAMP)

2. **`rooms`**: Stores physical accommodation inventory.
   * `id` (UUID, PK)
   * `title` (VARCHAR)
   * `description` (TEXT)
   * `price_per_night` (DECIMAL)
   * `max_capacity` (INTEGER)
   * `images` (JSON / ARRAY of Cloudinary URLs)

3. **`amenities`**: Stores available luxury amenities (e.g., "Private Butler", "Infinity Pool Access").
   * `id` (UUID, PK)
   * `name` (VARCHAR)
   * `icon` (VARCHAR)

4. **`room_amenities`**: Many-to-Many junction table connecting rooms and amenities.
   * `room_id` (FK)
   * `amenity_id` (FK)

5. **`bookings`**: Stores reservations with transaction states.
   * `id` (UUID, PK)
   * `user_id` (FK)
   * `room_id` (FK)
   * `check_in_date` (DATE)
   * `check_out_date` (DATE)
   * `total_price` (DECIMAL)
   * `status` (ENUM: `pending`, `confirmed`, `cancelled`)
   * `created_at` (TIMESTAMP)

---

## 3. Core Workflows & Data Flows

### 3.1 Availability & Booking Flow
1. **User Search:** User selects check-in date, check-out date, and guest count on the homepage widget.
2. **Availability Check Query:** Server action executes a PostgreSQL query to filter out rooms where overlapping bookings exist (`NOT (check_out <= $1 OR check_in >= $2)`).
3. **Reservation Submission:** Guest fills in contact info. System creates a pending booking record and triggers concurrent email dispatch.

### 3.2 Automated Email Dispatch Flow (Resend API)
* **Guest Confirmation Trigger:** On successful booking insertion, an asynchronous server job calls the Resend API to render a luxury-styled HTML confirmation template.
* **Admin Alert Trigger:** Concurrently, a notification email is dispatched to the hotel management email inbox containing guest details and reservation dates.

### 3.3 Admin Panel Management Flow
* **Authentication Check:** Protected layout middleware validates session tokens and admin roles.
* **CRUD Operations:** Admins can mutate room inventory (`rooms`), upload photos (routed via Cloudinary CDN), adjust pricing, and update booking reservation statuses.