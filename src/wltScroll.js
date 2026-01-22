import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import ScrollToPlugin from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export function initWltScroll() {
    const section = document.querySelector('.wlt-section')
    const track = document.querySelector('.wlt-track')
    const bgRows = document.querySelectorAll('.wlt-bg-text-row')
    if (!section || !track) return

    // Shared State
    let isCrushed = false
    let mainScrollTrigger = null // Store reference to kill later

    // Define resetSystem here so it's accessible to ScrollTrigger
    const resetSystem = () => {
        const wrapper = document.querySelector('.termination-wrapper')
        const progressBar = document.getElementById('termProgressFill')
        const pieces = {
            top: document.getElementById('termPieceTop'),
            mid: document.getElementById('termPieceMid'),
            bot: document.getElementById('termPieceBot')
        }

        isCrushed = false
        if (wrapper) wrapper.classList.remove('crushed')
        section.classList.remove('crushed') // Restore the 1990s background

        // Restore wrapper visibility immediately
        gsap.set(wrapper, { display: 'block', opacity: 1, visibility: 'visible' })

        // Restore overlay
        gsap.set('.term-overlay', { opacity: 1 })

        // Restore pieces positions immediately (no animation for snappy reset)
        gsap.set([pieces.top, pieces.mid, pieces.bot], {
            x: 0, y: 0, rotation: 0, opacity: 1, clearProps: "transform"
        })

        // Reset progress bar
        gsap.set(progressBar, { width: "0%" })

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

        // Re-lock the scroll to hide sections after wlt (CSS handles hiding)
        document.body.classList.add('wlt-locked')
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
            // Reset when scrolling back up into the section from below
            onEnterBack: () => {
                const wrapper = document.querySelector('.termination-wrapper')

                // Only reset if it was crushed (wrapper is hidden)
                if (isCrushed || (wrapper && wrapper.style.display === 'none')) {
                    resetSystem()

                    // HARDCODED SCROLL: Snap to the termination card (end of horizontal scroll)
                    const st = mainScrollTrigger
                    if (st) {
                        const scrollTarget = st.end - 50
                        window.scrollTo({ top: scrollTarget, behavior: 'instant' })
                        gsap.set(track, { x: getScrollAmount() })
                    }
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
    // Pass the state setter/getter and ScrollTrigger reference
    initTermination(resetSystem, () => isCrushed, (val) => isCrushed = val, () => mainScrollTrigger)

    // Initially lock the page (hides sections after wlt via CSS)
    document.body.classList.add('wlt-locked')

    ScrollTrigger.refresh()
}

function initTermination(resetSystem, getIsCrushed, setIsCrushed, getScrollTrigger) {
    const wrapper = document.querySelector('.termination-wrapper')
    const progressBar = document.getElementById('termProgressFill')
    const wltSection = document.querySelector('.wlt-section')
    const pieces = {
        top: document.getElementById('termPieceTop'),
        mid: document.getElementById('termPieceMid'),
        bot: document.getElementById('termPieceBot')
    }

    if (!wrapper || !progressBar) return

    const startPress = (e) => {
        if (getIsCrushed()) return
        e.preventDefault()

        gsap.to(progressBar, {
            width: "100%",
            duration: 2,
            ease: "linear",
            onComplete: crushSystem
        })
    }

    const endPress = () => {
        if (getIsCrushed()) return
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
        lastScrollY = window.scrollY

        scrollBackListener = () => {
            const currentY = window.scrollY
            const st = getScrollTrigger()

            // If scrolling UP and we're in the "gap zone" (between st.end and where we landed)
            if (st && currentY < lastScrollY && currentY > st.end && currentY < st.end + window.innerHeight) {

                // Remove listener immediately to prevent multiple fires
                window.removeEventListener('scroll', scrollBackListener)
                scrollBackListener = null

                // Reset and snap
                resetSystem()

                const scrollTarget = st.end - 50
                window.scrollTo({ top: scrollTarget, behavior: 'instant' })
                gsap.set(track, { x: getScrollAmount() })
            }

            lastScrollY = currentY
        }

        // Add listener after a short delay
        setTimeout(() => {
            window.addEventListener('scroll', scrollBackListener, { passive: true })
        }, 500)
    }

    function crushSystem() {

        setIsCrushed(true)
        wrapper.classList.add('crushed')
        wltSection.classList.add('crushed')

        // Hide termination UI immediately
        gsap.set(wrapper, { display: 'none' })
        gsap.set('.term-overlay', { opacity: 0 })

        // Unlock body to show following sections
        document.body.classList.remove('wlt-locked')

        // Make all sections after wlt visible (start at 0 opacity for fade)
        const nextSection = wltSection.nextElementSibling
        if (nextSection) {
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

        window.scrollTo({ top: scrollTarget, behavior: 'instant' })

        // Refresh ScrollTrigger after the jump
        ScrollTrigger.refresh()

        // NOW fade in the section (after scroll has happened)
        if (nextSection) {
            gsap.to(nextSection, { opacity: 1, duration: 3, ease: "power2.out" })
        }

        // Set up listener to detect scrolling back up
        setupScrollBackDetection()
    }
}
