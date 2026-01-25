# Walter Van Beirendonck Interactive Website - Complete Project Summary

## Project Overview
An interactive fashion designer portfolio website for Walter Van Beirendonck, built for MoMu (Mode Museum). Features multiple scroll-triggered sections with complex animations, horizontal scrolling, and an interactive canvas-style gallery. The site tells the story of Walter's career through immersive, animated sections that respond to user interaction.

## Tech Stack
- **Build Tool**: Vite 7.2.4
- **Animation**: GSAP 3.12.5 with ScrollTrigger and ScrollToPlugin
- **DOM Manipulation**: jQuery 3.7.1 (for some components), vanilla JavaScript
- **Styling**: CSS with CSS variables
- **Fonts**: 
  - 'Druk Text Wide Trial' (headings)
  - 'Space Mono' (body text)

## Project Structure
```
/Users/carol/Desktop/int3/walter/
├── index.html           # Main HTML structure
├── package.json         # Dependencies
├── public/
│   └── photos/          # All images (PNG/JPG) ~40 files
└── src/
    ├── main.js          # Entry point, initializes all modules
    ├── style.css        # All styles (~4000+ lines)
    ├── heroDrag.js      # Hero section drag interaction
    ├── wltScroll.js     # W.&L.T. horizontal scroll section
    ├── aesthScroll.js   # Aestheticterrorists scroll animations
    ├── wearableGrid.js  # Infinite draggable grid (930 lines)
    ├── ctaScroll.js     # CTA section text and image animations
    └── logger.js        # Custom logging utility
```

## CSS Variables
```css
--color-red: #FF0000;
--color-black: #000000;
--color-white: #FFFFFF;
--color-cream: #F5F5DC;
--color-pink: #FF00FF;
--color-cyan: #00FFFF;
--color-yellow: #FFFF00;
```

## Sections (in order)

### 1. Header
- **Status**: ✅ Mobile Responsive
- Fixed position, cream background (#F7F5E9)
- MoMu logo + hamburger menu toggle
- **Mobile (≤768px)**: Cream background, padding 18px 24px, logo 50px height
- **Small phones (≤480px)**: Padding 16px 18px, logo 46px

### 2. Hero Section
- **Status**: ✅ Mobile Responsive (COMPLETE)
- **Features**:
  - Draggable reveal rectangle that shows jester image underneath Walter portrait
  - Glitch text effect on title "WALTER VAN BEIRENDONCK"
  - Grid lines extending from rectangle corners with red dot intersections
  - Images: `water-intro.jpg`, `walter-intro-jester.jpg`
  - CTA button with 2px black border, smooth scrolls to intro section on click

- **Mobile Responsive Implementation (768px and below)**:
  - Header: Cream background, padding 18px 24px, logo 50px
  - Hero container: `calc(100vh - 90px)` height
  - Hero images: 78% height, 92% max-width, `object-fit: contain`
  - Reveal rectangle: 200×200px, starts at top-center of image
  - Title: 40px font-size
  - Subtitle: 16px font-size
  - Text block: positioned `bottom: 270px, left: 20px`
  - CTA button: positioned `bottom: 130px, right: 20px`, 2px black border

- **Smaller Mobile (480px)**:
  - Header: padding 16px 18px, logo 46px
  - Hero container: `calc(100vh - 82px)`
  - Images: 72% height, 90% max-width
  - Rectangle: 160×160px
  - Title: 36px
  - Subtitle: 14px
  - Text block: `bottom: 250px`
  - CTA button: `bottom: 120px`

- **heroDrag.js Key Features**:
  - `getRenderedImageBounds()` - Calculates actual visible image area accounting for `object-fit: contain`
  - Drag constrained to actual image bounds (not element bounds)
  - Initial position: top-center of image
  - Native touch event listeners with `{ passive: false }` to prevent scroll interference
  - Proper clip-path calculation relative to element bounds
  - Image load detection before initializing bounds
  - Orientation change support

### 3. Intro Clapperboard Section (#introClapperSection)
- **Status**: ✅ Mobile Responsive (COMPLETE)
- **Features**:
  - Animated clapperboard that opens on scroll
  - CSS variable-driven animations
  - Red highlight effect on key sentence
  - Image: `glitch-intro.png`
  - Glitchy title effect preserved on mobile
  - Black and white striped clapperboard pattern preserved

- **Mobile Responsive Implementation**:
  - **Layout**: Image first (top), then clapperboard below
  - **Image**: 
    - Positioned higher with `margin-top: -67px` (768px), `-62px` (480px)
    - Width: `calc(100% - 10px)` (10px smaller than container)
    - Max-height: 60vh (768px), 55vh (480px)
    - `object-position: center top`
  - **Clapperboard**:
    - Top bar: 50px height (768px), 44px (480px)
    - Title: 26px font-size (768px), 22px (480px)
    - Text: 14px font-size (all mobile sizes)
    - Preserves desktop animations (opening, glitch effect)
  - **Animation Timing** (adjusted in `main.js`):
    - Text reveal: starts at 55% scroll progress (was 10%)
    - Red highlight: starts at 75% scroll progress (was 45%)
    - Image animation: unchanged (starts at 10%)

- **Tablet (≤968px)**:
  - Image first layout
  - Title: `clamp(1.6rem, 4vw, 2.2rem)`
  - Text: 16px

### 4. Band Transition Section (#bandTransition)
- **Status**: ✅ Mobile Responsive (COMPLETE)
- **Features**:
  - 5 animated red ribbon bands with text sliding in from alternating directions
  - Cream overlay fades to reveal Techno-Shaman content
  - Click-to-trigger Puk Puk typing effect chat box
  - Images: `puk-puk.png`, `techno-shaman.png`

- **Mobile Responsive Implementation**:
  - **Ribbon Text**: 35px font-size (768px), 28px (480px)
  - **Ribbon Positioning** (closer together):
    - Band 1: 12% (768px), 10% (480px)
    - Band 2: 26% (768px), 24% (480px)
    - Band 3: 42% (768px), 40% (480px)
    - Band 4: 58% (768px), 56% (480px)
    - Band 5: 74% (768px), 72% (480px)
  - **Animation Speed** (slower for readability):
    - Desktop: 250vh scroll height
    - Tablet (≤968px): 280vh
    - Mobile (≤768px): 320vh (28% slower)
    - Small phones (≤480px): 350vh (40% slower)
  - Increased scroll distance gives users more time to read each ribbon

### 5. W.&L.T. Horizontal Scroll Section (#wltSection)
- **Status**: ✅ Mobile uses carousel (desktop remains pinned horizontal scroll)
- **Desktop**: GSAP ScrollTrigger pinned horizontal scroll
- **Mobile (≤768px)**: Carousel of all cards; non-focused cards are blurred; tap a card once to focus, tap again to open “read more” modal
- Parallax "1990s" text background
- 6 flip cards with collection info (`wlt-1.png` through `wlt-6.png`)
- "Hold to Crush" termination card with progress bar
- Custom events: `walter:wltUnlocked` and `walter:wltLocked`
- **Note**: Has some mobile card size adjustments (240×360px on ≤768px) but full responsive layout needed

### 6. Aestheticterrorists Section (#aesthSection)
- **Status**: ⚠️ Needs Mobile Responsiveness
- Pinned scroll animation with layered elements
- Layers: runway, crowd (left/right), protest banner, model, walter
- Chat boxes with typing effects
- Images: `runway.png`, `crowd.png`, `protest1.png`, `model.png`, `walter.png`

### 7. Truth Section (#truthSection)
- **Status**: ✅ Updated Design
- Red banner header "Rebellion Through Truth"
- **Layout**: Full viewport section (100vh × 100vw)
- **Image**: `walter-truth-jester.png` positioned as element (not background)
  - Uses `object-fit: contain` to fit width without cropping
  - Centered vertically with `top: 50%` and `transform: translateY(-50%)`
- **Text Card**: Absolutely positioned over image
  - Position: `bottom: 164px, left: 140px`
  - Black background with transparency (rgba(0, 0, 0, 0.92))
  - Contains "THE COURT JESTER" title and body text
- **Era Label**: "2010s—PRESENT" positioned on top of image
  - Centered horizontally, white text with shadow
  - Position: `top: 28px, left: 50%, transform: translateX(-50%)`
- **Decorative Mark**: `mark.png` positioned above text box
  - Position: `left: 25px, bottom: calc(164px + 430px)`
  - Contains both exclamation marks in single image
- **Note**: Mobile responsiveness may need refinement

### 8. Wearable Resistance Section (#wearableSection)
- **Status**: ✅ Updated Design
- **Canvas Styling**:
  - 30px black border around draggable canvas
  - Background color: #F7F5E9 (cream)
  - Box-sizing: border-box to include border in sizing
- **Title**: "Wearable Resistance"
  - Positioned 15px lower using `transform: translateY(15px)`
  - Cream background (#F7F5E9) with black border-bottom
- **Flip Cards**:
  - Back of cards: 3px black border stroke
  - Background: #F7F5E9 (cream) for both front and back
- Infinite draggable canvas with 7 flip cards
- macOS Dock-style proximity effect
- Card sizing: base 220×290, hover 340×450
- Size variations: 0.7x to 1.15x
- **Note**: Mobile responsiveness may need refinement

### 9. Walter-fy Your Voice Section (#walterfySection)
- **Status**: ⚠️ Needs Mobile Responsiveness
- Full-bleed image `truth-glitch.png`
- Black text box with red headline
- **Note**: Has some responsive adjustments (≤1024px, ≤768px) but may need refinement

### 10. CTA Section (.cta-section)
- **Status**: ✅ Updated Design with GSAP Animations
- **Background**: Cream (#F7F5E9)
- **Text Content**: "A new era is here. Stop watching from the sidelines and confront the history at MoMu."
- **Layout**: 5 lines of text, centered
  - Line 1: "A new era is here." (red #FF0000)
  - Line 2: "Stop watching"
  - Line 3: "from the sidelines"
  - Line 4: "and confront the"
  - Line 5: "history at MoMu."
- **Typography**: 
  - Font size: 50px (desktop), responsive on mobile
  - Font family: 'Druk Text Wide Trial'
  - Uppercase, letter-spacing: 4px
  - Normal (not italic)
- **Images**: 
  - 6 pairs of images (person + background) positioned on sides
  - Person images: 280px width, positioned at 18-22% (left) and 78-82% (right)
  - Background images: 300px width, offset by -15px for overlap
  - Images are static (no parallax)
  - Full opacity for all images
- **GSAP ScrollTrigger Animations**:
  - Text lines animate from below (y: 80px → 0) line by line
  - Fast but smooth animation: 0.5s duration, 0.08s stagger
  - Images fade in after text with 0.6s duration
  - Scroll-triggered: starts at 'top 75%'
- **Module**: `ctaScroll.js` handles all animations
- **Note**: Mobile responsiveness may need refinement

### 11. Plan Your Visit Section (.visit-section)
- **Status**: ✅ Complete
- **Background**: Black (#000000)
- **Content**:
  - Red headline: "WALTER VAN BEIREDONCK" (large, bold, uppercase)
  - White description text about avant-garde fashion experience
  - Red "PLAN YOUR VISIT" button with hover effect
  - Social media icons (Instagram and Facebook) - white outline icons
- **Layout**: Centered, vertical stack
- **Styling**: High contrast black/white with red accents

### 12. MoMu Signup Section (.signup-section)
- **Status**: ✅ Complete
- **Background**: Cream (#F7F5E9)
- **Large Background Logo**: 
  - MoMu logo (`MoMu_News_MoMuLogo.png`) displayed large in background
  - 80vw width, full opacity (100%)
  - Positioned behind content box
- **Content Box** (white):
  - Max-width: 1400px (doubled from original)
  - Positioned lower with margin-top: 350px
  - Centered text alignment
  - Headline: "MoMu is more than a museum; <br>it is the **evidence**." (evidence in red)
  - Description text
  - Email signup form:
    - Email input: 300px width, centered
    - Red "SUBSCRIBE" button
    - Form elements centered together
- **Styling**: White box with shadow, centered content

### 13. Footer Section (.footer-section)
- **Status**: ✅ Complete
- **Background**: Black (#000000)
- **Layout**: Two-column, vertically centered
  - Left: "THANKS FOR READING" (large, bold, white, uppercase)
  - Right: Contact information (white text, right-aligned on desktop, left-aligned on mobile)
    - Address: Nationalestraat 28, 2000 Antwerp, Belgium
    - Phone: +32 (0)3 470 27 70
    - Email: publiek@momu.be
- **Styling**: High contrast, clean layout

## Module Communication
```javascript
// Dispatched by wltScroll.js when crush animation completes
document.dispatchEvent(new CustomEvent('walter:wltUnlocked'))

// Listened by main.js to init downstream sections
document.addEventListener('walter:wltUnlocked', () => {
    initAesthScroll()
    setTimeout(() => initWearableGrid(), 100)
})
```

## Responsiveness Work Completed

### ✅ Completed Sections

#### 1. Header
- Mobile breakpoints: 768px, 480px
- Responsive padding and logo sizing
- Maintains fixed positioning

#### 2. Hero Section
- Full mobile implementation with touch-optimized drag interaction
- Responsive image sizing and positioning
- Adjusted text sizes and positioning
- CTA button with border and smooth scroll functionality

#### 3. Intro Clapperboard Section
- **Layout**: Reordered to image-first on mobile
- **Preserved**: Desktop animations (clapperboard opening, glitch effects, striped pattern)
- **Adjusted**: Animation timing for better visibility
- **Sizing**: Title 26px, body text 14px on mobile
- **Positioning**: Image positioned higher with negative margin

#### 4. Band Transition / Ribbons Section
- **Font Size**: 35px on mobile, 28px on small phones
- **Positioning**: Ribbons closer together (14% gaps vs 15-17%)
- **Animation Speed**: Slower scroll (320vh mobile, 350vh small phones) for better readability

### ⚠️ Sections Still Needing Mobile Responsiveness

1. **W.&L.T. Horizontal Scroll Section** - Horizontal scroll needs mobile adaptation
2. **Aestheticterrorists Section** - Complex layered animations need mobile optimization
3. **Truth Section** - Full viewport layout may need mobile adjustments
4. **Wearable Resistance Section** - Draggable grid needs touch optimization
5. **Walter-fy Your Voice Section** - Layout may need refinement
6. **CTA / Footer Section** - Animated text lines may need mobile sizing adjustments

## Mobile Breakpoints Used
- **768px**: Tablets and large phones (primary mobile breakpoint)
- **480px**: Small phones
- **968px**: Tablet transition breakpoint

## Mobile Typography Rule
- **Body text (mobile)**: All body copy should render at **14px** on mobile breakpoints (≤768px / ≤480px).

## Key Technical Details

### Scroll-Based Animations
- Custom scroll handlers in `main.js` using `requestAnimationFrame`
- CSS variables for animation progress: `--clapper-open`, `--clapper-text`, `--band-progress`
- Smooth performance with throttled scroll events
- **GSAP ScrollTrigger** for CTA section text animations
  - Lines animate from off-screen positions to center
  - Scroll-scrubbed animations for smooth scroll-based control

### Touch Interactions
- Hero drag uses native touch events with `{ passive: false }`
- Proper bounds calculation for `object-fit: contain` images
- Orientation change support

### Animation Timing Adjustments
- Intro section text animation delayed to 55% progress (from 10%) for better visibility
- Band transition section height increased on mobile for slower, more readable animations

### CTA Button Enhancement
- Added 2px black border on all screen sizes
- Smooth scroll to intro section using `scrollIntoView({ behavior: 'smooth' })`

### Recent Design Updates
- **Truth Section**: Full viewport layout with image element and overlaid text card
- **Wearable Section**: Canvas styling with 30px border and cream background (#F7F5E9)
- **CTA Section**: Restructured with 5-line animated text, static images positioned on sides
- **New Sections Added**:
  - Plan Your Visit section (dark theme with red CTA)
  - MoMu Signup section (cream background with large logo, email signup)
  - Footer section (contact information, vertically centered)

## Dev Server
- Running at `http://localhost:5174/`
- Start with: `npm run dev`

## Git Status
- **Branch**: dev (tracking origin/dev)
- **Modified**: `index.html`, `src/style.css`, `src/main.js`
- **Recent Changes**:
  - Truth section: Full viewport layout, image positioning, text card overlay
  - Wearable section: Canvas border and background styling, title positioning
  - CTA section: Restructured with animated text and static side images
  - Added three new sections: Plan Your Visit, MoMu Signup, Footer
- **Untracked**: `public/photos/truth-glitch.png`, `public/photos/].png`

## Next Steps for Full Mobile Responsiveness

1. **W.&L.T. Section**: Convert horizontal scroll to vertical stacking or touch-optimized horizontal scroll
2. **Aestheticterrorists**: Optimize layer animations for mobile viewport
3. **Truth Section**: Stack columns vertically on mobile
4. **Wearable Grid**: Optimize touch interactions and card sizing for mobile
5. **Walter-fy Section**: Refine text box positioning and sizing
6. **CTA/Footer**: Stack columns and adjust text sizes

## File Locations for Key Styles

- **Hero Section Mobile**: `src/style.css` lines ~2689-2856
- **Intro Clapperboard Mobile**: `src/style.css` lines ~2858-2962
- **Band Transition Mobile**: `src/style.css` lines ~2925-2995
- **Truth Section**: `src/style.css` lines ~2367-2479 (banner, layout, image, card, mark)
- **Wearable Section**: `src/style.css` lines ~2630-2758 (section, canvas, cards)
- **CTA Section**: `src/style.css` lines ~2558-2758 (text styling, images, animations)
- **Plan Your Visit Section**: `src/style.css` lines ~3900-3970
- **MoMu Signup Section**: `src/style.css` lines ~3971-4055
- **Footer Section**: `src/style.css` lines ~4056-4095
- **Animation Timing**: `src/main.js` lines ~55-70
- **CTA Scroll Handler**: `src/ctaScroll.js` (dedicated module)

## Notes
- All responsive work maintains desktop design aesthetics where possible
- Animations are preserved on mobile with adjusted timing for better UX
- Touch interactions are optimized for mobile devices
- Font sizes are carefully adjusted for mobile readability while maintaining visual hierarchy
