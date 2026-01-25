// Wearable Resistance – Infinite Draggable Grid with Flip Cards
// Features: wrap-around infinite canvas, dock-style hover, parallax depth, flip-to-quote

import gsap from 'gsap'
import { makeLogger } from './logger.js'

const log = makeLogger('WEARABLE')

// Quote data
const QUOTES = [
    {
        id: 'crossed-crocodiles',
        image: '/photos/Crossed-Crocodiles.png',
        quote: 'Stop Terrorising Our World. The runway is my picket line. I use it to say the things that others are too afraid to say.',
        collection: '2015 "Crossed Crocodiles"'
    },
    {
        id: 'war',
        image: '/photos/war.png',
        quote: 'The W:A.R. collection is a reaction to the issues we all encounter... such as global warming, racism, and intolerance. We have no choice but to demand freedom, demand beauty, with no limits.',
        collection: '"W.A.R."'
    },
    {
        id: 'stop-racism',
        image: '/photos/Stop-Racism.png',
        quote: 'We need to go to war on racism. It\'s a billboard made of feathers, meant to be a raised middle finger.',
        collection: 'AW 2014 "Stop Racism"'
    },
    {
        id: 'i-have-seen-the-future',
        image: '/photos/I-Have-Seen-The-Future.png',
        quote: 'Too much war, too much extreme right... They are all afraid of selling less, the money is an issue... that\'s why we see the most incredible things happening and nobody is reacting.',
        collection: '"I Have Seen The Future"'
    },
    {
        id: 'we-yell',
        image: '/photos/we-yell.png',
        quote: 'I don\'t believe in strategies. A strategy is what a big commercial company has. Everything that you do should come from the heart, and not from marketing.',
        collection: 'AW 2023 "We Yell"'
    },
    {
        id: 'ihaveseenthefuturee',
        image: '/photos/IHaveSeenTheFuturee.png',
        quote: 'The world explodes and I\'m dancing... it\'s the contrast between the terrible things we experience and the expectation to be happy.',
        collection: '"I Have Seen The Future"'
    },
    {
        id: 'dawleetoo',
        image: '/photos/dawleetoo.png',
        quote: 'I think that today we are crash test dummies for all of the misery and aggression happening all over the world... You\'re constantly under attack.',
        collection: 'SS 2024 "Dawleetoo"'
    }
]

let initialized = false
let gridItems = []
let worldEl = null
let boardEl = null
let sectionEl = null

// Drag state
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let worldX = 0
let worldY = 0
let velocityX = 0
let velocityY = 0
let lastPointerX = 0
let lastPointerY = 0
let rafId = null

// Mouse position for dock effect + jittery follow
let mouseX = 0
let mouseY = 0
let targetMouseOffsetX = 0
let targetMouseOffsetY = 0
let currentMouseOffsetX = 0
let currentMouseOffsetY = 0
let isMouseInBoard = false

// Currently flipped card and hovered card
let flippedCard = null
let hoveredCard = null

// Intro animation state
let introPlayed = false
let introAnimating = false
let sectionObserver = null

// Layout config - base size for dynamic variations
const CARD_BASE_WIDTH = 220
const CARD_BASE_HEIGHT = 290

// Full size when hovering directly over a card (bigger than largest card: 1.15x = 253x333)
const CARD_FULL_WIDTH = 340
const CARD_FULL_HEIGHT = 450

// Standardized size when flipped (fixed for all, ensures readable text)
const CARD_FLIPPED_WIDTH = 340
const CARD_FLIPPED_HEIGHT = 450

// Mobile size constants (50% of desktop)
const CARD_BASE_WIDTH_MOBILE = 110
const CARD_BASE_HEIGHT_MOBILE = 145
const CARD_FULL_WIDTH_MOBILE = 170
const CARD_FULL_HEIGHT_MOBILE = 225
// Mobile flipped cards will be calculated as 60-70% of viewport dynamically
let CARD_FLIPPED_WIDTH_MOBILE = 0
let CARD_FLIPPED_HEIGHT_MOBILE = 0

// Mobile breakpoint
const MOBILE_BREAKPOINT = 768

// World bounds for wrap-around
let worldWidth = 0
let worldHeight = 0
let viewportWidth = 0
let viewportHeight = 0
let isMobile = false

// Size variations for visual depth - gradual range, max 1.15x (smaller than hover)
const SIZE_VARIATIONS = [0.7, 0.78, 0.85, 0.92, 1.0, 1.08, 1.15]

// Mobile detection function
function detectMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT
}

// Get card sizes based on viewport
function getCardBaseWidth() {
    return isMobile ? CARD_BASE_WIDTH_MOBILE : CARD_BASE_WIDTH
}

function getCardBaseHeight() {
    return isMobile ? CARD_BASE_HEIGHT_MOBILE : CARD_BASE_HEIGHT
}

function getCardFullWidth() {
    return isMobile ? CARD_FULL_WIDTH_MOBILE : CARD_FULL_WIDTH
}

function getCardFullHeight() {
    return isMobile ? CARD_FULL_HEIGHT_MOBILE : CARD_FULL_HEIGHT
}

function getCardFlippedWidth() {
    if (isMobile) {
        // Calculate 65% of viewport width (between 60-70%)
        return Math.round(viewportWidth * 0.65)
    }
    return CARD_FLIPPED_WIDTH
}

function getCardFlippedHeight() {
    if (isMobile) {
        // Calculate 65% of viewport height (between 60-70%)
        return Math.round(viewportHeight * 0.65)
    }
    return CARD_FLIPPED_HEIGHT
}

export function initWearableGrid() {
    if (initialized) return

    worldEl = document.getElementById('wearableWorld')
    boardEl = document.querySelector('.wearable-board')
    sectionEl = document.querySelector('.wearable-section')

    if (!worldEl || !boardEl) {
        log('init:skipped (elements not found)')
        return
    }

    log('init:start')

    // Detect mobile viewport
    isMobile = detectMobile()

    viewportWidth = boardEl.clientWidth
    viewportHeight = boardEl.clientHeight

    // Calculate mobile flipped card sizes (60-70% of viewport)
    if (isMobile) {
        CARD_FLIPPED_WIDTH_MOBILE = Math.round(viewportWidth * 0.65)
        CARD_FLIPPED_HEIGHT_MOBILE = Math.round(viewportHeight * 0.65)
    }

    // World slightly larger than viewport
    worldWidth = viewportWidth * 1.15
    worldHeight = viewportHeight * 1.15

    // Build grid items spread across world
    buildGrid()

    // Center the world so cards are visible
    worldX = -(worldWidth - viewportWidth) / 2
    worldY = -(worldHeight - viewportHeight) / 2
    updateWorldPosition()

    // Set up interactions
    setupDrag()
    setupMouseTracking()
    setupClickOutside()

    // Start animation loop
    animate()

    initialized = true
    log('init:done', { itemCount: gridItems.length })

    // Set up IntersectionObserver to trigger intro when section is fully visible
    if (!introPlayed && sectionEl) {
        setupIntroObserver()
    }

    // Create scroll down button for mobile
    if (isMobile && sectionEl) {
        createScrollDownButton()
    }
}

function setupIntroObserver() {
    sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Trigger when section is at least 80% visible
            if (entry.isIntersecting && entry.intersectionRatio >= 0.8 && !introPlayed) {
                log('intro:sectionVisible')
                // Small delay after section is visible
                setTimeout(() => {
                    playIntroFlipAnimation()
                }, 400)
                // Disconnect after triggering
                sectionObserver.disconnect()
            }
        })
    }, {
        threshold: [0.8]
    })

    sectionObserver.observe(sectionEl)
}

function buildGrid() {
    worldEl.innerHTML = ''
    gridItems = []

    // Generate evenly distributed positions
    const positions = generateGridPositions(QUOTES.length)

    QUOTES.forEach((quote, i) => {
        const pos = positions[i]
        const sizeMultiplier = SIZE_VARIATIONS[i % SIZE_VARIATIONS.length]
        const cardWidth = Math.round(getCardBaseWidth() * sizeMultiplier)
        const cardHeight = Math.round(getCardBaseHeight() * sizeMultiplier)

        // Calculate dynamic font sizes for this card's back (for intro flip)
        const textFontSize = Math.max(0.6, 0.85 * sizeMultiplier)
        const collectionFontSize = Math.max(0.5, 0.72 * sizeMultiplier)

        // Create flip card structure
        const item = document.createElement('div')
        item.className = 'wearable-item'
        item.dataset.quoteId = quote.id
        item.style.width = `${cardWidth}px`
        item.style.height = `${cardHeight}px`

        // Inner container for flip
        const inner = document.createElement('div')
        inner.className = 'wearable-item-inner'

        // Front (image)
        const front = document.createElement('div')
        front.className = 'wearable-item-front'
        const img = document.createElement('img')
        img.src = quote.image
        img.alt = `Collection: ${quote.collection}`
        img.draggable = false
        front.appendChild(img)

        // Back (quote) - dynamic font size that scales with card
        // Use textContent to properly escape HTML and ensure text displays correctly
        const back = document.createElement('div')
        back.className = 'wearable-item-back'

        const quoteDiv = document.createElement('div')
        quoteDiv.className = 'wearable-card-quote'

        const textP = document.createElement('p')
        textP.className = 'wearable-card-text'
        textP.style.fontSize = `${textFontSize}rem`
        textP.textContent = quote.quote // Use textContent to properly parse text

        const collectionP = document.createElement('p')
        collectionP.className = 'wearable-card-collection'
        collectionP.style.fontSize = `${collectionFontSize}rem`
        collectionP.textContent = `Collection: ${quote.collection}` // Use textContent

        quoteDiv.appendChild(textP)
        quoteDiv.appendChild(collectionP)
        back.appendChild(quoteDiv)

        inner.appendChild(front)
        inner.appendChild(back)
        item.appendChild(inner)
        worldEl.appendChild(item)

        const itemData = {
            el: item,
            inner: inner,
            back: back,
            quote,
            baseX: pos.x,
            baseY: pos.y,
            x: pos.x,
            y: pos.y,
            // Store original dynamic size
            baseWidth: cardWidth,
            baseHeight: cardHeight,
            // Current rendered size
            width: cardWidth,
            height: cardHeight,
            sizeMultiplier,
            // Dynamic font sizes for this card
            textFontSize,
            collectionFontSize,
            // Current scale (for proximity effect)
            proximityScale: 1,
            // Target opacity/scale for dimming effect
            dimScale: 1,
            dimOpacity: 1,
            // Flip state tracked via GSAP (not CSS class)
            currentRotation: 0,
            // State
            isHovered: false,
            isFlipped: false,
            isIntroFlipping: false
        }

        gridItems.push(itemData)

        // Hover detection
        item.addEventListener('mouseenter', () => {
            if (!isDragging && !itemData.isFlipped && !introAnimating) {
                setHoveredCard(itemData)
            }
        })

        item.addEventListener('mouseleave', () => {
            if (hoveredCard === itemData && !itemData.isFlipped) {
                clearHoveredCard()
            }
        })

        // Click to flip (works on both desktop and mobile)
        item.addEventListener('click', (e) => {
            e.stopPropagation()
            e.preventDefault()

            // Ignore clicks during intro animation
            if (introAnimating || itemData.isIntroFlipping) return
            if (isDragging) return
            if (Math.abs(velocityX) > 2 || Math.abs(velocityY) > 2) return

            toggleFlip(itemData)
        })

        // Touch to flip (mobile) - simpler approach that matches desktop behavior
        let touchStartX = 0
        let touchStartY = 0
        let touchMoved = false

        item.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX
                touchStartY = e.touches[0].clientY
                touchMoved = false
                // Stop propagation to prevent board drag
                e.stopPropagation()
            }
        }, { passive: false }) // Changed to false so stopPropagation works

        item.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                const dx = Math.abs(e.touches[0].clientX - touchStartX)
                const dy = Math.abs(e.touches[0].clientY - touchStartY)
                // If touch moved more than 15px, consider it a drag (increased threshold)
                if (dx > 15 || dy > 15) {
                    touchMoved = true
                }
            }
        }, { passive: true })

        item.addEventListener('touchend', (e) => {
            e.stopPropagation()
            e.preventDefault() // Prevent click event from firing

            // Only flip if it was a tap (not a drag) and not currently dragging
            if (!touchMoved && !isDragging) {
                // Ignore during intro animation
                if (introAnimating || itemData.isIntroFlipping) return
                if (Math.abs(velocityX) > 2 || Math.abs(velocityY) > 2) return

                // Flip immediately - no delay needed
                toggleFlip(itemData)
            }
            touchMoved = false
        }, { passive: false })

        // Position initially
        updateItemPosition(itemData)
    })
}

// Generate organic-looking positions with coverage guarantee
// Uses anchor points that feel random but ensure no large empty areas
function generateGridPositions(count) {
    const positions = []

    // Pre-defined organic anchor points (percentages of world)
    // These are NOT on a grid - they're hand-placed for natural feel
    const anchorPoints = [
        { x: 0.12, y: 0.22 },  // upper left area
        { x: 0.38, y: 0.15 },  // upper middle-left
        { x: 0.72, y: 0.25 },  // upper right area
        { x: 0.88, y: 0.18 },  // far upper right
        { x: 0.22, y: 0.68 },  // lower left
        { x: 0.55, y: 0.75 },  // lower middle
        { x: 0.82, y: 0.62 },  // lower right
    ]

    // Shuffle anchor points for variety
    const shuffledAnchors = [...anchorPoints].sort(() => Math.random() - 0.5)

    // Maximum empty space allowed (distance from any card center)
    const maxEmptyRadius = Math.min(worldWidth, worldHeight) * 0.35

    // Minimum spacing between cards - more spacing on mobile to prevent overlap
    const minSpacing = isMobile
        ? getCardFullWidth() + 40  // Extra spacing on mobile
        : getCardFullWidth() + 30

    for (let i = 0; i < count; i++) {
        const anchor = shuffledAnchors[i % shuffledAnchors.length]
        const sizeMultiplier = SIZE_VARIATIONS[i % SIZE_VARIATIONS.length]
        const cardWidth = getCardBaseWidth() * sizeMultiplier
        const cardHeight = getCardBaseHeight() * sizeMultiplier

        // Base position from anchor
        let baseX = anchor.x * worldWidth
        let baseY = anchor.y * worldHeight

        // Add organic random offset (feels scattered, not aligned)
        const offsetRange = 80
        let x = baseX + (Math.random() - 0.5) * offsetRange - cardWidth / 2
        let y = baseY + (Math.random() - 0.5) * offsetRange - cardHeight / 2

        // Ensure no overlap with existing cards - use actual card dimensions
        let attempts = 0
        while (attempts < 50 && hasOverlapWithPositions(positions, x, y, minSpacing, cardWidth, cardHeight)) {
            // Try a new random offset
            x = baseX + (Math.random() - 0.5) * offsetRange * 1.5 - cardWidth / 2
            y = baseY + (Math.random() - 0.5) * offsetRange * 1.5 - cardHeight / 2
            attempts++
        }

        // On mobile, use stricter spacing to prevent overlap
        if (isMobile && attempts >= 50) {
            // If still overlapping after 50 attempts, use a grid-like fallback
            const gridCols = 3
            const gridRows = 3
            const cellWidth = worldWidth / gridCols
            const cellHeight = worldHeight / gridRows
            const col = i % gridCols
            const row = Math.floor(i / gridCols)
            x = col * cellWidth + cellWidth / 2 - cardWidth / 2
            y = row * cellHeight + cellHeight / 2 - cardHeight / 2
        }

        // Clamp to world bounds with padding
        const padding = 20
        x = Math.max(padding, Math.min(worldWidth - cardWidth - padding, x))
        y = Math.max(padding, Math.min(worldHeight - cardHeight - padding, y))

        positions.push({
            x,
            y,
            width: cardWidth,
            height: cardHeight,
            centerX: x + cardWidth / 2,
            centerY: y + cardHeight / 2
        })
    }

    // Coverage check: ensure no large empty areas
    // If there's a big gap, shift nearest card toward it
    optimizeCoverage(positions, maxEmptyRadius)

    return positions
}

function hasOverlapWithPositions(positions, x, y, minSpacing, cardWidth, cardHeight) {
    // Use actual card dimensions for accurate overlap detection
    const cardCenterX = x + cardWidth / 2
    const cardCenterY = y + cardHeight / 2

    for (const pos of positions) {
        const dx = Math.abs(cardCenterX - pos.centerX)
        const dy = Math.abs(cardCenterY - pos.centerY)
        // Check if distance between centers is less than minimum spacing
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < minSpacing) {
            return true
        }
    }
    return false
}

function optimizeCoverage(positions, maxEmptyRadius) {
    // Check several sample points across the world
    const samplePoints = [
        { x: worldWidth * 0.25, y: worldHeight * 0.5 },
        { x: worldWidth * 0.5, y: worldHeight * 0.3 },
        { x: worldWidth * 0.5, y: worldHeight * 0.7 },
        { x: worldWidth * 0.75, y: worldHeight * 0.5 },
    ]

    for (const sample of samplePoints) {
        // Find distance to nearest card
        let minDist = Infinity
        let nearestIdx = -1

        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i]
            const dist = Math.sqrt(
                Math.pow(sample.x - pos.centerX, 2) +
                Math.pow(sample.y - pos.centerY, 2)
            )
            if (dist < minDist) {
                minDist = dist
                nearestIdx = i
            }
        }

        // If sample point is too far from any card, nudge nearest card toward it
        if (minDist > maxEmptyRadius && nearestIdx >= 0) {
            const pos = positions[nearestIdx]
            const nudgeStrength = 0.3
            const dx = (sample.x - pos.centerX) * nudgeStrength
            const dy = (sample.y - pos.centerY) * nudgeStrength

            pos.x += dx
            pos.y += dy
            pos.centerX += dx
            pos.centerY += dy
        }
    }
}

function updateItemPosition(item) {
    gsap.set(item.el, {
        x: item.x,
        y: item.y,
        scale: item.proximityScale * item.dimScale,
        opacity: item.dimOpacity
    })
}

// Hover state management
function setHoveredCard(item) {
    if (hoveredCard && hoveredCard !== item) {
        clearHoveredCard()
    }

    hoveredCard = item
    item.isHovered = true
    item.el.classList.add('is-hovered')

    // Animate to full size - VERY SMOOTH transition
    gsap.to(item.el, {
        width: getCardFullWidth(),
        height: getCardFullHeight(),
        duration: 0.7,
        ease: 'power2.out'
    })

    // Update font sizes to full readable size when hovered
    const textEl = item.back.querySelector('.wearable-card-text')
    const collectionEl = item.back.querySelector('.wearable-card-collection')
    if (textEl) gsap.to(textEl, { fontSize: '0.95rem', duration: 0.7, ease: 'power2.out' })
    if (collectionEl) gsap.to(collectionEl, { fontSize: '0.8rem', duration: 0.7, ease: 'power2.out' })

    // Dim other cards
    dimOtherCards(item)

    log('hover:start', { id: item.quote.id })
}

function clearHoveredCard() {
    if (!hoveredCard) return

    const item = hoveredCard

    // Don't shrink if card is flipped (it should stay at full size)
    if (item.isFlipped) {
        hoveredCard = null
        return
    }

    item.isHovered = false
    item.el.classList.remove('is-hovered')

    // Animate back to original dynamic size - VERY SMOOTH
    gsap.to(item.el, {
        width: item.baseWidth,
        height: item.baseHeight,
        duration: 0.6,
        ease: 'power2.out'
    })

    // Restore original font sizes
    const textEl = item.back.querySelector('.wearable-card-text')
    const collectionEl = item.back.querySelector('.wearable-card-collection')
    if (textEl) gsap.to(textEl, { fontSize: `${item.textFontSize}rem`, duration: 0.6, ease: 'power2.out' })
    if (collectionEl) gsap.to(collectionEl, { fontSize: `${item.collectionFontSize}rem`, duration: 0.6, ease: 'power2.out' })

    // Restore other cards
    restoreOtherCards()

    log('hover:end', { id: item.quote.id })
    hoveredCard = null
}

function dimOtherCards(hoveredItem) {
    gridItems.forEach(item => {
        if (item !== hoveredItem && !item.isFlipped) {
            // Animate dimming - MORE size reduction, LESS opacity change
            gsap.to(item, {
                dimScale: 0.85,
                dimOpacity: 0.9,
                duration: 0.4,
                ease: 'power2.out',
                onUpdate: () => updateItemPosition(item)
            })
        }
    })
}

function restoreOtherCards() {
    gridItems.forEach(item => {
        if (!item.isHovered && !item.isFlipped) {
            // Restore from dimming
            gsap.to(item, {
                dimScale: 1,
                dimOpacity: 1,
                duration: 0.4,
                ease: 'power2.out',
                onUpdate: () => updateItemPosition(item)
            })
        }
    })
}

function setupDrag() {
    boardEl.addEventListener('mousedown', onDragStart)
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)

    boardEl.addEventListener('touchstart', onDragStart, { passive: false })
    window.addEventListener('touchmove', onDragMove, { passive: false })
    window.addEventListener('touchend', onDragEnd)
}

function onDragStart(e) {
    // On mobile, don't start drag if touch started on a card or its children (let card handle it)
    const target = e.target || (e.touches && e.touches[0] && document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY))
    if (e.touches && target && target.closest('.wearable-item')) {
        return
    }

    isDragging = true
    boardEl.classList.add('is-dragging')

    // Clear hover when starting drag
    if (hoveredCard && !hoveredCard.isFlipped) {
        clearHoveredCard()
    }

    const point = e.touches ? e.touches[0] : e
    dragStartX = point.clientX - worldX
    dragStartY = point.clientY - worldY
    lastPointerX = point.clientX
    lastPointerY = point.clientY
    velocityX = 0
    velocityY = 0

    if (e.cancelable) e.preventDefault()
}

function onDragMove(e) {
    const point = e.touches ? e.touches[0] : e

    mouseX = point.clientX
    mouseY = point.clientY

    if (!isDragging) return

    velocityX = point.clientX - lastPointerX
    velocityY = point.clientY - lastPointerY
    lastPointerX = point.clientX
    lastPointerY = point.clientY

    worldX = point.clientX - dragStartX
    worldY = point.clientY - dragStartY

    updateWorldPosition()

    if (e.cancelable) e.preventDefault()
}

function onDragEnd() {
    isDragging = false
    boardEl.classList.remove('is-dragging')
}

function setupMouseTracking() {
    boardEl.addEventListener('mousemove', (e) => {
        mouseX = e.clientX
        mouseY = e.clientY
        isMouseInBoard = true
    })

    boardEl.addEventListener('mouseenter', () => {
        isMouseInBoard = true
    })

    boardEl.addEventListener('mouseleave', () => {
        isMouseInBoard = false
        targetMouseOffsetX = 0
        targetMouseOffsetY = 0

        // Clear hover when mouse leaves board
        if (hoveredCard && !hoveredCard.isFlipped) {
            clearHoveredCard()
        }
    })
}

// macOS Dock-style proximity effect - cards get excited near mouse
function applyProximityEffect() {
    if (isDragging || !isMouseInBoard) {
        // Reset scales when not active
        gridItems.forEach(item => {
            if (!item.isHovered && !item.isFlipped) {
                item.proximityScale += (1 - item.proximityScale) * 0.15
                updateItemPosition(item)
            }
        })
        return
    }

    const boardRect = boardEl.getBoundingClientRect()
    const localMouseX = mouseX - boardRect.left
    const localMouseY = mouseY - boardRect.top

    // Calculate mouse position in world space
    const worldMouseX = localMouseX - worldX - currentMouseOffsetX
    const worldMouseY = localMouseY - worldY - currentMouseOffsetY

    // Dock effect parameters - MORE NOTICEABLE
    const maxDistance = 400
    const maxScaleBoost = 0.6

    gridItems.forEach(item => {
        // Skip hovered or flipped cards (they have their own sizing)
        if (item.isHovered || item.isFlipped) {
            item.proximityScale = 1
            return
        }

        const itemCenterX = item.x + item.baseWidth / 2
        const itemCenterY = item.y + item.baseHeight / 2

        const dx = worldMouseX - itemCenterX
        const dy = worldMouseY - itemCenterY
        const distance = Math.sqrt(dx * dx + dy * dy)

        let targetScale = 1
        if (distance < maxDistance) {
            const proximity = 1 - (distance / maxDistance)
            targetScale = 1 + maxScaleBoost * proximity * proximity
        }

        item.proximityScale += (targetScale - item.proximityScale) * 0.22

        updateItemPosition(item)
    })
}

function applyJitteryFollow() {
    if (!isMouseInBoard) {
        currentMouseOffsetX += (0 - currentMouseOffsetX) * 0.06
        currentMouseOffsetY += (0 - currentMouseOffsetY) * 0.06
        return
    }

    if (isDragging) return

    const boardRect = boardEl.getBoundingClientRect()
    const centerX = boardRect.width / 2
    const centerY = boardRect.height / 2

    const localMouseX = mouseX - boardRect.left
    const localMouseY = mouseY - boardRect.top

    const normalizedX = (localMouseX - centerX) / centerX
    const normalizedY = (localMouseY - centerY) / centerY

    const maxOffset = 50
    targetMouseOffsetX = -normalizedX * maxOffset
    targetMouseOffsetY = -normalizedY * maxOffset

    currentMouseOffsetX += (targetMouseOffsetX - currentMouseOffsetX) * 0.12
    currentMouseOffsetY += (targetMouseOffsetY - currentMouseOffsetY) * 0.12
}

function setupClickOutside() {
    boardEl.addEventListener('click', (e) => {
        if (e.target === boardEl || e.target === worldEl) {
            if (flippedCard) {
                flipBack(flippedCard)
            }
        }
    })

    // Touch support for mobile - tap outside to close
    boardEl.addEventListener('touchend', (e) => {
        if (e.target === boardEl || e.target === worldEl) {
            if (flippedCard && !e.target.closest('.wearable-item')) {
                flipBack(flippedCard)
            }
        }
    }, { passive: true })

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && flippedCard) {
            flipBack(flippedCard)
        }
    })
}

function toggleFlip(item) {
    log('toggleFlip', { id: item.quote.id, isFlipped: item.isFlipped })

    if (item.isFlipped) {
        flipBack(item)
    } else {
        if (flippedCard && flippedCard !== item) {
            flipBack(flippedCard)
        }
        flipToQuote(item)
    }
}

function flipToQuote(item) {
    // FIRST: Clear hover state without triggering size animation
    // This prevents mouseleave from calling clearHoveredCard and shrinking the card
    if (hoveredCard === item) {
        hoveredCard = null
    }
    item.isHovered = false
    item.el.classList.remove('is-hovered')

    // Set flipped state
    item.isFlipped = true
    flippedCard = item
    item.el.classList.add('is-flipped')

    log('flipToQuote', { id: item.quote.id })

    // Kill ALL existing animations on this card
    gsap.killTweensOf(item.el)
    gsap.killTweensOf(item.inner)
    gsap.killTweensOf(item)

    // Ensure scales are reset to 1
    item.proximityScale = 1
    item.dimScale = 1
    item.dimOpacity = 1

    // Ensure card stays at full size with no scale transform issues
    const flippedWidth = getCardFlippedWidth()
    const flippedHeight = getCardFlippedHeight()

    gsap.set(item.el, {
        width: flippedWidth,
        height: flippedHeight,
        scale: 1,
        opacity: 1
    })

    // On mobile, center the card in viewport when flipped
    if (isMobile) {
        // Calculate center position in world coordinates
        const centerX = viewportWidth / 2 - worldX - currentMouseOffsetX
        const centerY = viewportHeight / 2 - worldY - currentMouseOffsetY

        // Update item position to center it, ensuring it stays within world bounds
        item.x = Math.max(10, Math.min(worldWidth - flippedWidth - 10, centerX - flippedWidth / 2))
        item.y = Math.max(10, Math.min(worldHeight - flippedHeight - 10, centerY - flippedHeight / 2))
        updateItemPosition(item)
    }

    // Ensure font is at full readable size - adjust for mobile
    const textEl = item.back.querySelector('.wearable-card-text')
    const collectionEl = item.back.querySelector('.wearable-card-collection')
    gsap.killTweensOf(textEl)
    gsap.killTweensOf(collectionEl)

    if (isMobile) {
        // Mobile: smaller but readable font sizes
        if (textEl) gsap.set(textEl, { fontSize: '0.75rem', lineHeight: '1.5' })
        if (collectionEl) gsap.set(collectionEl, { fontSize: '0.65rem' })
    } else {
        // Desktop: original sizes
        if (textEl) gsap.set(textEl, { fontSize: '0.95rem' })
        if (collectionEl) gsap.set(collectionEl, { fontSize: '0.8rem' })
    }

    // Animate the flip using GSAP - ensure it works on mobile
    // Reset rotation first to ensure clean flip
    gsap.set(item.inner, { rotateY: 0 })

    // Force a reflow to ensure the reset is applied
    item.inner.offsetHeight

    // Now animate the flip
    gsap.to(item.inner, {
        rotateY: 180,
        duration: 0.4,
        ease: 'power2.inOut',
        force3D: true, // Force hardware acceleration
        transformOrigin: 'center center'
    })

    // Dim other cards
    dimOtherCards(item)
}

function flipBack(item) {
    item.isFlipped = false
    item.isHovered = false
    item.el.classList.remove('is-flipped')

    log('flipBack', { id: item.quote.id })

    // Kill any existing animations
    gsap.killTweensOf(item.el, 'width,height')
    gsap.killTweensOf(item.inner)

    // Animate flip back using GSAP - ensure it works on mobile
    gsap.to(item.inner, {
        rotateY: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        force3D: true, // Force hardware acceleration
        transformOrigin: 'center center'
    })

    // Animate back to original dynamic size
    gsap.to(item.el, {
        width: item.baseWidth,
        height: item.baseHeight,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
            // On mobile, restore card to original position after size animation
            if (isMobile) {
                item.x = item.baseX
                item.y = item.baseY
                updateItemPosition(item)
            }
        }
    })

    // Restore original font sizes
    const textEl = item.back.querySelector('.wearable-card-text')
    const collectionEl = item.back.querySelector('.wearable-card-collection')
    if (textEl) gsap.to(textEl, { fontSize: `${item.textFontSize}rem`, duration: 0.5 })
    if (collectionEl) gsap.to(collectionEl, { fontSize: `${item.collectionFontSize}rem`, duration: 0.5 })

    // Restore other cards
    restoreOtherCards()

    if (flippedCard === item) {
        flippedCard = null
    }
}

// Intro flip animation - invites user to interact
function playIntroFlipAnimation() {
    if (introPlayed) return
    introPlayed = true
    introAnimating = true

    log('intro:start')

    // Calculate total animation time
    const staggerDelay = 0.2
    const flipDuration = 0.6
    const flipStayTime = 0.9
    const totalTime = (gridItems.length - 1) * staggerDelay + flipDuration + flipStayTime + flipDuration

    // Stagger flip each card
    gridItems.forEach((item, index) => {
        const delay = index * staggerDelay

        item.isIntroFlipping = true

        // Flip to show quote
        gsap.to(item.inner, {
            rotateY: 180,
            duration: flipDuration,
            delay: delay,
            ease: 'power2.inOut'
        })

        // Flip back after staying flipped for 1.4s
        gsap.to(item.inner, {
            rotateY: 0,
            duration: flipDuration,
            delay: delay + flipDuration + flipStayTime,
            ease: 'power2.inOut',
            onComplete: () => {
                item.isIntroFlipping = false
            }
        })
    })

    // Mark intro as complete after all animations
    setTimeout(() => {
        introAnimating = false
        log('intro:complete')
    }, totalTime * 1000 + 200)

    log('intro:scheduled')
}

function updateWorldPosition() {
    gsap.set(worldEl, {
        x: worldX + currentMouseOffsetX,
        y: worldY + currentMouseOffsetY
    })
}

function renderWrappedPositions() {
    gridItems.forEach(item => {
        let bestX = item.x
        let bestY = item.y

        const offsets = [-worldWidth, 0, worldWidth]
        const yOffsets = [-worldHeight, 0, worldHeight]

        let minDistToCenter = Infinity
        const centerX = viewportWidth / 2 - worldX - currentMouseOffsetX
        const centerY = viewportHeight / 2 - worldY - currentMouseOffsetY

        for (const ox of offsets) {
            for (const oy of yOffsets) {
                const testX = item.x + ox
                const testY = item.y + oy
                const dist = Math.abs(testX + item.baseWidth / 2 - centerX) + Math.abs(testY + item.baseHeight / 2 - centerY)
                if (dist < minDistToCenter) {
                    minDistToCenter = dist
                    bestX = testX
                    bestY = testY
                }
            }
        }

        item.x = bestX
        item.y = bestY
    })
}

function wrapItems() {
    renderWrappedPositions()

    gridItems.forEach(item => {
        updateItemPosition(item)
    })
}

function animate() {
    applyJitteryFollow()
    applyProximityEffect()

    if (!isDragging) {
        if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
            worldX += velocityX
            worldY += velocityY
            velocityX *= 0.94
            velocityY *= 0.94
        }
    }

    wrapItems()
    updateWorldPosition()

    rafId = requestAnimationFrame(animate)
}

function createScrollDownButton() {
    // Check if button already exists
    if (sectionEl.querySelector('.wearable-scroll-down-btn')) return

    const button = document.createElement('button')
    button.className = 'wearable-scroll-down-btn'
    button.setAttribute('aria-label', 'Scroll to next section')
    button.textContent = 'CLICK TO SCROLL'

    // Find next section and add click handler
    const nextSection = sectionEl.nextElementSibling
    if (nextSection) {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            nextSection.scrollIntoView({ behavior: 'smooth' })
        })
    }

    // Append to wearable-board as an overlay at the bottom of the canvas
    if (boardEl) {
        boardEl.appendChild(button)
    }
}

export function destroyWearableGrid() {
    if (!initialized) return

    log('destroy')

    if (rafId) cancelAnimationFrame(rafId)
    if (sectionObserver) sectionObserver.disconnect()

    initialized = false
    gridItems = []
    flippedCard = null
    hoveredCard = null
    introPlayed = false
    introAnimating = false
}
