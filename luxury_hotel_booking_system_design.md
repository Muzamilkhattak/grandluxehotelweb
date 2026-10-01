# Luxury Hotel Booking System - Technical & Design Specification

## 1. Project Overview
A bespoke, high-performance, SEO-optimized luxury hotel booking platform. The platform blends an immersive, opulent aesthetic with lightning-fast performance and a robust administrative control center.

---

## 2. Design Tokens & Styling System

### 2.1 Color Palette
*   **Deep Espresso Brown (`#362618`):** Primary canvas color for the user-facing site, evoking warmth, privacy, and exclusivity.
*   **Muted Luxury Gold (`#7E652E`):** Accent color used for interactive buttons, borders, highlights, and icons.
*   **Complementary Cream (`#FAF8F5`):** Text and light contrast background elements.

### 2.2 Typography Hierarchy
*   **Primary Display / Hero Titles:** `font-marcellus` (Marcellus, serif) for a timeless, classical heritage feel.
*   **Subheadings & Brand Accents:** `font-vogue` ("Classic Vogue", sans-serif) for high-fashion, chic editorial touches.
*   **Body & Descriptions:** `font-jost` (Jost, sans-serif) for clean geometric legibility across all screen sizes.

---

## 3. Frontend Architecture & User Experience

### 3.1 Public-Facing Pages
1.  **Hero Landing Page:** High-resolution video/image background, immersive booking bar widget (Check-in, Check-out, Guests), and brand ethos statement.
2.  **Accommodations / Room Showcase:** Grid layout featuring high-res photo galleries, starting rates, and quick amenity highlights.
3.  **Room Detail View:** Deep-dive pages with immersive image carousels, detailed descriptions, amenity badges (e.g., Rain shower, Butler service, Ocean view), and dynamic date picker availability.
4.  **Checkout & Reservation Flow:** Secure guest details collection, instant date validation, and payment gateway integration.

---

## 4. Admin Panel Specifications

The admin dashboard operates on a clean, high-contrast light/dark hybrid theme tailored for operational clarity.

### 4.1 Key Modules
*   **Dashboard Overview:** Key Performance Indicators (Total revenue, active occupancy rate, pending bookings count).
*   **Inventory & Room Manager:**
    *   Add, edit, and delete room types and accommodations.
    *   Upload multiple high-res images (integrated with Cloudinary).
    *   Configure pricing per night, maximum occupancy, and descriptions.
    *   Toggle specific room amenities.
*   **Reservation & Booking Management:**
    *   View all incoming, confirmed, and cancelled bookings.
    *   Filter reservations by date range and status.
    *   Manual override or status update capabilities.

---

## 5. Automated Email Notification System

*   **Guest Confirmation Workflow:**
    *   Triggered immediately upon successful booking submission.
    *   Sends a beautifully formatted HTML email containing confirmation number, check-in/out dates, room summary, and hotel policies via **Resend**.
*   **Admin Notification Workflow:**
    *   Triggered concurrently with guest booking.
    *   Dispatches an instant notification email to the hotel management inbox detailing guest contact information, selected dates, and financial breakdown.

---

## 6. Database Schema (PostgreSQL)

### Tables Overview
*   **`users`**: Stores guest and admin profiles (`id`, `email`, `role`, `created_at`).
*   **`rooms`**: Stores accommodation inventory (`id`, `title`, `description`, `price_per_night`, `capacity`, `images` JSON array).
*   **`amenities`**: Stores available room amenities (`id`, `name`, `icon`).
*   **`room_amenities`**: Junction table linking rooms to amenities.
*   **`bookings`**: Stores reservation data (`id`, `user_id`, `room_id`, `check_in_date`, `check_out_date`, `total_price`, `status`, `created_at`).