import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ScrollToPlugin from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// DEBUG LOGGING
const DEBUG = true
const log = (...args) => DEBUG && console.log('[WLT]', ...args)
const logState = (label, extras = {}) => {
    if (!DEBUG) return
    const section = document.querySelector('.wlt-section')
    const track = document.querySelector('.wlt-track')
    const wrapper = document.querySelector('.termination-wrapper')
    console.log(`[WLT] === ${label} ===`, {
        scrollY: window.scrollY,
        sectionDisplay: section?.style.display,
        sectionVisibility: section?.style.visibility,
        sectionOpacity: section?.style.opacity,
        sectionClasses: section?.className,
        trackX: track ? gsap.getProperty(track, 'x') : 'N/A',
        wrapperDisplay: wrapper?.style.display,
        wrapperVisibility: wrapper?.style.visibility,
        bodyClasses: document.body.className,
        ...extras
    })
}

export function initWltScroll() {
    const section = document.querySelector('.wlt-section')
    const track = document.querySelector('.wlt-track')
    const bgRows = document.querySelectorAll('.wlt-bg-text-row')
    if (!section || !track) return

    log('initWltScroll started')

    // Shared State
    let isCrushed = false
    let mainScrollTrigger = null // Store reference to kill later

    // PARTIAL reset - only restore termination card, keep track at end position
    // Used when scrolling back from AESTHETICTERRORISTS
    const resetTerminationOnly = () => {
        log('resetTerminationOnly CALLED')
        logState('BEFORE resetTerminationOnly', { isCrushed })

        const wrapper = document.querySelector('.termination-wrapper')
        const progressBar = document.getElementById('termProgressFill')
        const pieces = {
            top: document.getElementById('termPieceTop'),
            mid: document.getElementById('termPieceMid'),
            bot: document.getElementById('termPieceBot')
        }

        isCrushed = false
        if (wrapper) wrapper.classList.remove('crushed')
        section.classList.remove('crushed')

        // Restore wrapper visibility
        gsap.set(wrapper, { display: 'block', opacity: 1, visibility: 'visible' })

        // Restore overlay
        gsap.set('.term-overlay', { opacity: 1 })

        // Restore pieces positions
        gsap.set([pieces.top, pieces.mid, pieces.bot], {
            x: 0, y: 0, rotation: 0, opacity: 1, clearProps: "transform"
        })

        // Reset progress bar
        gsap.set(progressBar, { width: "0%" })

        // Re-lock the scroll to hide sections after wlt
        document.body.classList.add('wlt-locked')

        logState('AFTER resetTerminationOnly', { isCrushed })
    }

    // FULL reset - reset everything to beginning (used when scrolling back through entire section)
    const resetSystem = () => {
        log('resetSystem CALLED (full reset)')
        logState('BEFORE resetSystem', { isCrushed })

        // First do the termination reset
        resetTerminationOnly()

        // Reset the horizontal track position to start
        gsap.set(track, { x: 0 })

        // Reset parallax background rows
        bgRows.forEach((row, i) => {
            const direction = i % 2 === 0 ? 1 : -1
            if (direction === -1) {
                gsap.set(row, { x: 0, xPercent: -25 })
            } else {
                gsap.set(row, { x: 0 })
            }
        })

        // Reset flip cards to initial hidden state (they animate in on scroll)
        const flipCards = document.querySelectorAll('.flip-card')
        flipCards.forEach(card => {
            card.classList.remove('flipped')
            gsap.set(card, { opacity: 0, x: 100, rotationY: 30 })
        })

        // Reset all card scales
        const allCards = document.querySelectorAll('.wlt-card:not(.termination-card)')
        allCards.forEach(card => {
            gsap.set(card, { scale: 1 })
        })

        logState('AFTER resetSystem')
    }

    // Calculate total width to scroll
    const getScrollAmount = () => {
        let trackWidth = track.scrollWidth
        return -(trackWidth - window.innerWidth)
    }

    const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getScrollAmount() * -1}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onEnter: () => {
                log('ScrollTrigger onEnter')
                logState('onEnter', { isCrushed })
            },
            onLeave: () => {
                log('ScrollTrigger onLeave')
                logState('onLeave', { isCrushed })
            },
            onLeaveBack: () => {
                log('ScrollTrigger onLeaveBack')
                logState('onLeaveBack', { isCrushed })
            },
            // Reset when scrolling back up into the section from below
            onEnterBack: () => {
                log('ScrollTrigger onEnterBack')
                const wrapper = document.querySelector('.termination-wrapper')
                logState('onEnterBack START', {
                    isCrushed,
                    wrapperDisplay: wrapper?.style.display,
                    willReset: isCrushed || (wrapper && wrapper.style.display === 'none')
                })

                // Only reset if it was crushed (wrapper is hidden)
                if (isCrushed || (wrapper && wrapper.style.display === 'none')) {
                    log('onEnterBack: Condition MET - calling resetTerminationOnly')
                    // Use partial reset - only restore termination card, keep track at end
                    resetTerminationOnly()

                    // HARDCODED SCROLL: Snap to the termination card (end of horizontal scroll)
                    const st = mainScrollTrigger
                    if (st) {
                        const scrollTarget = st.end - 50
                        log('onEnterBack: Scrolling to', scrollTarget, 'st.end:', st.end)
                        window.scrollTo({ top: scrollTarget, behavior: 'instant' })
                        gsap.set(track, { x: getScrollAmount() })
                        log('onEnterBack: Track set to', getScrollAmount())
                    }
                    logState('onEnterBack AFTER reset')
                } else {
                    log('onEnterBack: Condition NOT met - no reset needed')
                }
            }
        }
    })

    // Store reference to the ScrollTrigger
    mainScrollTrigger = tween.scrollTrigger

    // Parallax Background
    bgRows.forEach((row, i) => {
        const direction = i % 2 === 0 ? 1 : -1
        const speed = 0.2 + (i * 0.1)

        // For rows moving right (direction -1), start shifted left so we don't run out of text
        if (direction === -1) {
            gsap.set(row, { xPercent: -25 })
        }

        gsap.to(row, {
            x: () => (getScrollAmount() * speed * direction),
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => `+=${getScrollAmount() * -1}`,
                scrub: 1
            }
        })
    })

    // Center Card Scaling Effect
    const scaleCards = document.querySelectorAll('.wlt-card:not(.termination-card)')
    scaleCards.forEach(card => {
        gsap.fromTo(card,
            { scale: 1 },
            {
                scale: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: card,
                    containerAnimation: tween,
                    start: "center right",
                    end: "center left",
                    scrub: true,
                },
                keyframes: {
                    "0%": { scale: 1 },
                    "50%": { scale: 1.35, ease: "power1.inOut" },
                    "100%": { scale: 1, ease: "power1.inOut" }
                }
            }
        )
    })

    // Card Fade In Animation
    const cards = document.querySelectorAll('.flip-card')
    cards.forEach((card, i) => {
        gsap.fromTo(card,
            { opacity: 0, x: 100, rotationY: 30 },
            {
                opacity: 1, x: 0, rotationY: 0, duration: 1, ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    containerAnimation: tween,
                    start: "left center+=200",
                    toggleActions: "play none none reverse"
                }
            }
        )
        card.addEventListener('click', () => card.classList.toggle('flipped'))
    })

    // Termination Interaction
    // Pass the state setter/getter, ScrollTrigger reference, and track references
    initTermination(resetTerminationOnly, () => isCrushed, (val) => isCrushed = val, () => mainScrollTrigger, track, getScrollAmount)

    // Initially lock the page (hides sections after wlt via CSS)
    document.body.classList.add('wlt-locked')

    ScrollTrigger.refresh()
}

function initTermination(resetTerminationOnly, getIsCrushed, setIsCrushed, getScrollTrigger, track, getScrollAmount) {
    const wrapper = document.querySelector('.termination-wrapper')
    const progressBar = document.getElementById('termProgressFill')
    const wltSection = document.querySelector('.wlt-section')
    const pieces = {
        top: document.getElementById('termPieceTop'),
        mid: document.getElementById('termPieceMid'),
        bot: document.getElementById('termPieceBot')
    }

    if (!wrapper || !progressBar) return

    log('initTermination started')

    const startPress = (e) => {
        if (getIsCrushed()) return
        e.preventDefault()
        log('startPress - beginning hold')

        gsap.to(progressBar, {
            width: "100%",
            duration: 2,
            ease: "linear",
            onComplete: crushSystem
        })
    }

    const endPress = () => {
        if (getIsCrushed()) return
        log('endPress - released early')
        gsap.killTweensOf(progressBar)
        gsap.to(progressBar, {
            width: "0%",
            duration: 0.5,
            ease: "power2.out"
        })
    }

    wrapper.addEventListener('mousedown', startPress)
    wrapper.addEventListener('touchstart', startPress)
    wrapper.addEventListener('mouseup', endPress)
    wrapper.addEventListener('mouseleave', endPress)
    wrapper.addEventListener('touchend', endPress)

    // Scroll listener to detect scrolling back UP from AESTHETICTERRORISTS
    let lastScrollY = 0
    let scrollBackListener = null

    function setupScrollBackDetection() {
        log('setupScrollBackDetection: Setting up listener')
        lastScrollY = window.scrollY

        scrollBackListener = () => {
            const currentY = window.scrollY
            const st = getScrollTrigger()

            // If scrolling UP and we're in the "gap zone" (between st.end and where we landed)
            if (st && currentY < lastScrollY && currentY > st.end && currentY < st.end + window.innerHeight) {
                log('scrollBackListener: GAP ZONE DETECTED!', {
                    currentY,
                    lastScrollY,
                    stEnd: st.end,
                    gapEnd: st.end + window.innerHeight
                })

                // Remove listener immediately to prevent multiple fires
                window.removeEventListener('scroll', scrollBackListener)
                scrollBackListener = null

                // Reset termination only and snap
                log('scrollBackListener: Calling resetTerminationOnly')
                resetTerminationOnly()

                const scrollTarget = st.end - 50
                log('scrollBackListener: Scrolling to', scrollTarget)
                window.scrollTo({ top: scrollTarget, behavior: 'instant' })
                gsap.set(track, { x: getScrollAmount() })
                log('scrollBackListener: Track set to', getScrollAmount())
                logState('scrollBackListener COMPLETE')
            }

            lastScrollY = currentY
        }

        // Add listener after a short delay
        setTimeout(() => {
            log('scrollBackListener: Now active')
            window.addEventListener('scroll', scrollBackListener, { passive: true })
        }, 500)
    }

    function crushSystem() {
        log('crushSystem CALLED')
        logState('crushSystem START', { isCrushed: getIsCrushed() })

        setIsCrushed(true)
        wrapper.classList.add('crushed')
        wltSection.classList.add('crushed')

        // Hide termination UI immediately
        gsap.set(wrapper, { display: 'none' })
        gsap.set('.term-overlay', { opacity: 0 })

        // Unlock body to show following sections
        document.body.classList.remove('wlt-locked')
        log('crushSystem: Body unlocked')

        // Make all sections after wlt visible (start at 0 opacity for fade)
        const nextSection = wltSection.nextElementSibling
        if (nextSection) {
            log('crushSystem: Next section found:', nextSection.className)
            // First section starts invisible, rest are instant
            gsap.set(nextSection, { opacity: 0, visibility: 'visible', display: '' })

            let sibling = nextSection.nextElementSibling
            while (sibling) {
                gsap.set(sibling, { opacity: 1, visibility: 'visible', display: '' })
                sibling = sibling.nextElementSibling
            }
        }

        // HARDCODED SCROLL: Jump past the ScrollTrigger end point
        // After pin releases, wlt-section has ~100vh natural height, need to scroll past it
        const st = getScrollTrigger()
        const OFFSET = window.innerHeight - 100 // Slightly less than full viewport
        const scrollTarget = st ? st.end + OFFSET : 5000

        log('crushSystem: Scrolling to', scrollTarget, 'st.end:', st?.end, 'OFFSET:', OFFSET)
        window.scrollTo({ top: scrollTarget, behavior: 'instant' })

        // Refresh ScrollTrigger after the jump
        log('crushSystem: Refreshing ScrollTrigger')
        ScrollTrigger.refresh()

        // NOW fade in the section (after scroll has happened)
        if (nextSection) {
            gsap.to(nextSection, { opacity: 1, duration: 3, ease: "power2.out" })
        }

        logState('crushSystem COMPLETE', { isCrushed: getIsCrushed() })

        // Set up listener to detect scrolling back up
        setupScrollBackDetection()
    }
}
