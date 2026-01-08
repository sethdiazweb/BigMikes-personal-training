# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Big Mike's Personal Training is a static marketing website for a personal training business in Elizabethtown, PA. It's a multi-page static site deployed on Vercel.

## Development Commands

```bash
# Local development - serve files with any static server
npx serve .
# or
python -m http.server 8000

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

## Architecture

### Static Site Structure
- **No build system** - Plain HTML, CSS, and vanilla JavaScript
- **Multi-page architecture** - Each page is a standalone HTML file with inline critical CSS
- **Forms** - Contact/booking forms submit to external service (Formspree-style POST endpoints)

### Pages
- `index.html` - Homepage with hero, services overview, testimonials, contact
- `about.html` - Trainer bio and credentials
- `services.html` - Detailed service offerings
- `pricing.html` - Pricing tiers and packages
- `booking.html` - Consultation booking form
- `contact.html` - Contact form and info
- `testimonials.html` - Client testimonials
- `transformations.html` - Before/after client results
- `faq.html` - Frequently asked questions

### JavaScript Organization
- `js/main.js` - Primary JS with all homepage functionality (navigation, scroll animations, forms, exit-intent popup, phone modal)
- `js/navigation.js` - Standalone navigation module (mobile menu, scroll effects, active link highlighting)
- `js/forms.js` - Standalone form validation and submission

The homepage (`index.html`) uses `main.js` which contains all functionality. Other pages may use the modular `navigation.js` and `forms.js` files.

### CSS Structure
- `css/main.css` - Complete stylesheet with CSS custom properties (design tokens)
- Each HTML page also contains inline `<style>` block with critical/page-specific styles

### Design System (CSS Custom Properties)
Key design tokens in `:root`:
- **Primary color**: `--primary-500: #DC2626` (crimson red)
- **Accent**: `--accent-500: #F97316` (orange)
- **Background**: Dark theme (`--bg-dark: #000000`)
- **Typography**: `--font-display` (Oswald/DM Serif Display), `--font-body` (Inter)
- **Spacing scale**: `--space-xs` through `--space-4xl`

### Key UI Patterns
- Mobile-first responsive design
- Fixed header with scroll-triggered background
- `data-animate` attribute for scroll-triggered animations via IntersectionObserver
- Exit-intent popup (session-based, shows once)
- Phone modal with copy-to-clipboard (desktop) or direct call (mobile)
