# Luxury Hotel Homepage Layout & CRO Blueprint

## 1. Visual & Architectural Foundation
* **Brand Canvas Color:** `#362618` (Deep Espresso Brown)
* **Accent & Interactive Highlight:** `#7E652E` (Muted Luxury Gold)
* **Text / Light Accents:** `#FAF8F5` (Warm Alabaster / Cream)
* **Typography Pairing:**
  * **Headings / Hero:** `Marcellus` (Serif elegance)
  * **Sub-accents / Eyebrows:** `Classic Vogue` (Editorial fashion sans)
  * **Body / Meta / UI:** `Jost` (Crisp geometric sans)

---

## 2. Header (Sticky Floating Glassmorphism)
### Layout & Visual Design
* **Position:** Fixed top with dynamic scroll listener (`backdrop-blur-md bg-[#362618]/80 border-b border-[#7E652E]/20`).
* **Desktop Structure (3-Column Split):**
  * **Left Navigation:** "Suites & Villas", "Experiences", "Wellness & Spa", "Dining".
  * **Center Brandmark:** Serif logo typography in `Marcellus`, gold accent tracking.
  * **Right Actions:** Currency selector (`USD / EUR`), Concierge Contact, and a prominent solid pill CTA button: `"Check Availability"`.
* **Animations:**
  * Micro-hover underline animation sliding in from center (`transform scale-x-100`).
  * Seamless shrink on page scroll (padding reduces from `py-6` to `py-3` with ease-in-out transition).

---

## 3. Hero Section (Parallax & Conversion Engine)
### Visual & Emotional Impact
* **Background:** High-definition video loop or optimized WebP image with slow zoom-in Ken Burns effect (`scale-105 transition-transform duration-10000`).
* **Overlay:** Subtle vertical gradient (`from-black/40 via-[#362618]/50 to-[#362618]`) maintaining readability.
* **Hero Content:**
  * **Eyebrow:** `"SANCTUARY OF TIMELESS ELEGANCE"` (Font: Classic Vogue, tracking-widest, color: `#7E652E`).
  * **Main Title:** `"Where Serenity Meets Architecture"` (Font: Marcellus, text-5xl to text-7xl).
  * **Value Prop:** One punchy line highlighting privacy, bespoke services, and panoramic views.

### CRO Floating Booking Engine (Persistent Above the Fold)
* **Design:** Floating card docked at the bottom of the hero, overlapping the next section (`-mb-16 z-30`).
* **Fields:**
  1. **Check-In Date:** Popover calendar with instant rate previews.
  2. **Check-Out Date:** Auto-focused right after check-in selection.
  3. **Guests & Rooms:** Dropdown selector (Adults, Children, Suite types).
  4. **Primary CTA Button:** `"Search Availability"` (Solid `#7E652E` gold, hover state: `#8F7335`, ripple click animation).
* **CRO Badges:** Direct Booking Guarantee badge below button: *"Best Rate Guaranteed • Complimentary Late Checkout • Zero Booking Fees"*.

---

## 4. Curated Accommodations Showcase (Rooms & Suites)
### Layout Structure
* **Section Title:** Centered with ornamental divider (`Marcellus` heading, `#7E652E` divider bar).
* **Card Grid:** 3-column responsive layout showcasing premier room tiers.
* **Modern Luxury Card Components:**
  * **Image Container:** Aspect ratio `4:3` or `16:10`, overflow-hidden with smooth scale-up on card hover (`group-hover:scale-105 duration-700`).
  * **Floating Badges:** Top-left badge (`"Oceanfront"`, `"Private Pool"`, `"Butler Service"`).
  * **Pricing & Capacity:** Bottom bar inside image showing *"From $650 / night • 2 Guests • 85 sqm"*.
  * **Card Body:**
    * Suite Title in `Marcellus`.
    * 2-line description in `Jost` summarizing texture, light, and balcony views.
    * **Solid Amenity Icons Row:** King Bed (`BedDouble`), Rain Shower (`ShowerHead`), Private Terrace (`Sun`), Wi-Fi (`Wifi`).
    * **Action Bar:** Ghost button `"Explore Suite"` + Solid Gold Button `"Instant Reserve"`.

---

## 5. Parallax Feature Section ("The Experience")
### Layout & Transitions
* Split screen: 60% dynamic full-bleed image with smooth scroll-driven parallax movement, 40% curated text card.
* **Content:** Highlight Michelin-star private dining, heated cliffside infinity pools, and bespoke wellness retreats.
* **Interaction:** As user scrolls, content pins briefly while imagery fades smoothly into view.

---

## 6. Curated Hotel Amenities Grid
### Design & Solid Icons
* Clean 4x2 grid of modern minimalist cards with dark espresso backgrounds (`#362618`) and subtle gold borders (`border border-[#7E652E]/30`).
* **Amenities Covered:**
  * Infinity Pool
  * Private Wellness & Spa
  * 24/7 Butler Service
  * Helipad & Airport Chauffeur
  * Michelin-Trained Culinary
  * Sommelier Wine Cellar
  * Private Beach Access
  * High-Speed Dedicated Fiber
* **Hover Interaction:** Icon scales upward with a subtle gold glow, card border illuminates to full gold `#7E652E`.

---

## 7. Social Proof & Trust Architecture (CRO Maximizer)
* **Editorial Endorsements:** High-contrast logo ticker (Architectural Digest, Conde Nast Traveler, Forbes Travel Guide, Vogue).
* **Guest Testimonial Carousel:** Minimalist card carousel showing verified guest reviews, star rating, verified dates, and room booked.

---

## 8. Footer (Editorial Luxury Aesthetic)
### Layout & Elements
* **Top Newsletter Block:**
  * Heading: *"Receive Curated Invitations & Private Offers"*.
  * Clean inline input field with `#7E652E` submit button.
* **4-Column Links Architecture:**
  * **Column 1 (Brand):** Logo, awards badge, registered address, direct concierge phone/email.
  * **Column 2 (Suites):** Executive Suites, Penthouse Residences, Garden Villas, Accessible Rooms.
  * **Column 3 (Experience):** Dining & Lounges, Private Charters, Spa Treatments, Event Venues.
  * **Column 4 (Policies & Direct Benefits):** Cancellation Policy, Privacy Policy, Best Rate Guarantee, Admin Portal Access.
* **Bottom Bar:**
  * Copyright notice, local time indicator (e.g., *"Local Time: 12:45 AM GMT+5"*), and currency toggle.