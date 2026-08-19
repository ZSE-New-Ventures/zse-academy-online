# ZSE Training Platform - Project Handover

> [!NOTE]
> This document serves as a comprehensive handover guide for the ZSE Training Platform (ZSE Academy Online). It outlines the architecture, recent changes, technology stack, and outstanding features to guide future development.

## 📌 Project Overview
**ZSE Training** is a premium, modern e-learning platform built for the Zimbabwe Stock Exchange. It offers professional investment modules, trading tutorials, and certifications, serving as Zimbabwe's capital markets hub for financial education.

## 🛠 Technology Stack
- **Frontend Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router DOM
- **State Management / Data Fetching**: React Query / Context API
- **Alerts & Modals**: SweetAlert2 (Swal) + Radix UI Primitives
- **Icons**: FontAwesome + Lucide React

## 🎨 Design System & Branding
- **Primary Brand Color**: Vibrant ZSE Blue (`#00aeef`)
- **Typography**: Montserrat (Primary) & Poppins
- **Aesthetic**: Premium, square UI (no border-radius on major components), dark modes with glassmorphism overlays, and smooth micro-animations.

---

## ✅ Recently Completed Work
The following features and aesthetic upgrades have been recently integrated into the platform:

### 1. Home Ecosystem Bento Grid
The homepage features a dynamic, responsive Bento Grid that seamlessly cross-links to external ZSE platforms:
- **ZEEX**: Integrated into the center tall card with a dynamic, smoothly crossfading background image slider (using `investment.jpg` and `bento.jpg`).
- **InvoiceX**: Added as a dedicated block featuring a sleek document icon over the vibrant ZSE blue background.
- **Data Direct & VFEX Direct**: Maintained in the ecosystem layout to complete the capital markets suite.

### 2. Global Hero Header Synchronization
All major pages (`/tutorials`, `/courses`, `/events`) now utilize a synchronized, premium hero header design:
- Deep `#00aeef` mix-blend-multiply tint overlays.
- Centered, high-contrast typography.
- Truncated titles (e.g., *Market Analysis Live: Cryptos & Forex*) properly scaled and compacted to stay on a single line.

### 3. Bulletproof Error Handling
Complete overhaul of the Authentication error boundary (`Login.tsx` & `Signup.tsx`):
- **API Validation Parsing**: Intelligently parses Laravel's `422 Unprocessable Content` payloads, extracting deep array strings (e.g., *"The email has already been taken"*) and rendering them into clean UI Toasts.
- **System Failure Fallbacks**: Catches network drops (`!error.response`) and Server Crashes (`500+`) with polite, non-technical fallback messages to prevent scaring users.

### 4. Seamless Enrollment Flow
Implemented **SweetAlert2** modals across `Courses.tsx` and `CourseDetail.tsx`:
- Unauthenticated users attempting to enroll are greeted with a styled, branded Swal popup prompting them to log in.
- Automatically routes the user to the `/login` page upon confirmation.

---

## 🚀 Outstanding Backlog (Next Steps)
The following features were previously requested and remain in the backlog for future sprints:

1. **Certificate Generation**
   - Implement a feature to dynamically generate and download PDF certificates upon course completion. (Note: Mention of certificates was removed from the sidebar/overview pending this feature).
2. **Course Q&A / Discussions**
   - Add a discussion or Q&A section directly inside the course player to facilitate student-instructor interaction.
3. **Course Reviews**
   - Create a UI flow allowing students to submit course reviews and ratings upon completion.
4. **Instructor Profiles**
   - Build dedicated, public-facing profile pages for course instructors.
5. **Gamification**
   - Integrate gamified elements (badges, points, leaderboards) to incentivize learning progress.

## 👤 User Workflows & Experience

### 1. The Enrollment Process
The platform handles course discovery and enrollment with a focus on low-friction conversions:
- **Discovery**: Users browse the available modules on the `/courses` page or view deep details on the `/course/:id` page.
- **Authentication Check**: Clicking "Enroll Now" triggers an immediate check. If unauthenticated, a branded SweetAlert modal intercepts the action, explaining that login is required, and routes them to the authentication flow.
- **Enrollment Execution**: Once authenticated, the user clicks "Enroll Now". A React Query mutation communicates with the backend, securely registering the student in the course. Upon success, a celebratory green Toast confirms the enrollment.
- **Access**: The UI dynamically updates the button to read "Enrolled", and the course is immediately appended to their Dashboard and "My Courses" tab.

### 2. The User Dashboard (`/dashboard`)
Upon logging in, students are routed to their personal Dashboard (`src/pages/Dashboard.tsx`). This centralized hub tracks their complete educational journey:
- **Analytics & Progress**: Displays high-level stats such as total enrolled courses, completed courses, and average quiz scores. It intelligently calculates progress percentages for active courses.
- **Continue Learning**: A prominent dynamic widget surfaces the user's most recently accessed course, allowing them to jump straight back into the exact module/lesson they last viewed.
- **My Courses & Wishlist**: Dedicated tabs (`MyCourses.tsx`, `WishlistTab.tsx`) allow users to filter their active curriculum and saved courses.
- **Recent Activity**: A chronological feed (`RecentActivityTab.tsx`) tracks their milestones, such as completed lessons, quiz attempts, and reviews written.

---

## 📁 Key Files & Navigation
- **Homepage Grid (`src/components/TrainingDepartments.tsx`)**: The core entry point of the application. It serves as a visual ecosystem hub, utilizing a responsive Bento grid to direct users to various ZSE platforms (ZEEX, InvoiceX, VFEX Direct, Data Direct) and the main training portal.
- **Authentication (`src/pages/Login.tsx`, `src/pages/Signup.tsx`)**: Handles secure user onboarding and sessions. Features comprehensive client-side and server-side validation error parsing, ensuring users are guided gracefully through credential requirements and API rejections.
- **Course Enrollment (`src/pages/Courses.tsx`, `src/pages/CourseDetail.tsx`)**: The central learning hub. `Courses.tsx` displays the catalog of available modules, while `CourseDetail.tsx` provides deep-dives into curriculum content. Both integrate SweetAlert2 flows to seamlessly intercept and route unauthenticated users who attempt to enroll.
- **Interactive Tutorials (`src/pages/Tutorials.tsx`)**: A dedicated page for step-by-step guided demos, allowing users to navigate deposits, withdrawals, and trading mechanics at their own pace. Features a standardized, premium hero header.
- **Event Views (`src/pages/EventDetail.tsx`)**: Dedicated landing pages for live webinars, market analysis streams, and recorded sessions. Features a sleek, dynamic hero header with integrated badging to indicate event status.
- **Styling (`tailwind.config.ts`)**: The design system's source of truth. Contains core branding constraints, typography configurations, and custom color mappings required to maintain the platform's premium aesthetic.

## 💡 Developer Notes
When extending this platform, always prioritize the visual excellence rule: maintain the `#00aeef` branding, avoid rounded corners (`rounded-none`), and ensure all new integrations (like APIs from Laravel) are wrapped in user-friendly error handlers.
