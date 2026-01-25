import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { makeLogger } from './logger.js'

gsap.registerPlugin(ScrollTrigger)

const log = makeLogger('AESTH')

let aesthTimeline = null
let cleanupListeners = []

function on(el, type, handler, options) {
    if (!el) return
    el.addEventListener(type, handler, options)
    cleanupListeners.push(() => el.removeEventListener(type, handler, options))
}

export function initAesthScroll() {
    if (aesthTimeline) {
        log('init:skipped (already initialized)')
        ScrollTrigger.refresh()
        return
    }

    const section = document.querySelector('.aesth-section')
    if (!section) return

    const runway = section.querySelector('.aesth-runway')
    const crowdLeft = section.querySelector('.aesth-crowd-left')
    const crowdRight = section.querySelector('.aesth-crowd-right')
    const protest = section.querySelector('.aesth-protest')
    const textOverlay = section.querySelector('.aesth-text-overlay')
    const model = section.querySelector('.aesth-model')
    const modelImg = model?.querySelector('img')
    const modelChatbox = section.querySelector('.model-chatbox')
    const modelTypingIndicator = section.querySelector('.model-typing-indicator')
    const modelChatText = section.querySelector('.model-chat-text')
    const walter = section.querySelector('.aesth-walter')
    const walterImg = walter?.querySelector('img')
    const walterChatbox = section.querySelector('.walter-chatbox')
    const walterTypingIndicator = section.querySelector('.walter-typing-indicator')
    const walterChatText = section.querySelector('.walter-chat-text')

    if (!runway || !crowdLeft || !crowdRight || !protest) return
    log('init:start', { sectionDisplay: getComputedStyle(section).display })

    // Model chat text content
    const modelChatMessage = "This period marked a fundamental shift in the Walter System. This wasn't just about fashion anymore; it was about the right to exist outside the corporate grid."

    // Walter chat text content (you can customize this)
    const walterChatMessage = "Fashion is a weapon. Clothes are a statement. Every stitch is a rebellion against the mundane, a declaration that we refuse to be invisible."

    // Track typing state for model
    let modelTypingStarted = false
    let modelTypingComplete = false

    // Track typing state for walter
    let walterTypingStarted = false
    let walterTypingComplete = false
    let walterClickable = false

    // Check if mobile
    const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches
    const mobileYOffset = isMobile ? 80 : 0
    
    // Set initial states with GSAP for proper transform handling
    // Left crowd: flipped horizontally, rotated to lean towards center
    gsap.set(crowdLeft, { scaleX: -1, rotation: -15, opacity: 0 })
    // Right crowd: rotated to lean towards center (mirroring left)
    gsap.set(crowdRight, { rotation: 15, opacity: 0 })
    if (textOverlay) gsap.set(textOverlay, { opacity: 0 })
    // Model initial position - 150px lower on mobile using y offset
    if (model) {
        gsap.set(model, { 
            opacity: 0, 
            top: '60%', 
            left: '50%', 
            xPercent: -50, 
            yPercent: -50,
            y: mobileYOffset 
        })
    }
    if (modelChatbox) gsap.set(modelChatbox, { opacity: 0 })
    // Walter initial position - 150px lower on mobile using y offset
    if (walter) {
        gsap.set(walter, { 
            opacity: 0, 
            top: '50%', 
            left: '50%', 
            xPercent: -50, 
            yPercent: -50,
            y: mobileYOffset 
        })
    }
    if (walterChatbox) gsap.set(walterChatbox, { opacity: 0 })

    // Model typing animation function (auto-triggered)
    function startModelTyping() {
        if (modelTypingStarted) return
        modelTypingStarted = true

        // Show typing indicator briefly, then start typing
        setTimeout(() => {
            if (modelTypingIndicator) modelTypingIndicator.classList.add('hidden')
            if (modelChatText) {
                modelChatText.classList.add('visible')
                typeText(modelChatMessage, modelChatText, 0, () => {
                    modelTypingComplete = true
                })
            }
        }, 800)
    }

    // Walter typing animation function (click-triggered)
    function startWalterTyping() {
        if (walterTypingStarted || !walterClickable) return
        walterTypingStarted = true

        // Show typing indicator briefly, then start typing
        setTimeout(() => {
            if (walterTypingIndicator) walterTypingIndicator.classList.add('hidden')
            if (walterChatText) {
                walterChatText.classList.add('visible')
                typeText(walterChatMessage, walterChatText, 0, () => {
                    walterTypingComplete = true
                    // After typing completes, continue walter's animation
                    continueWalterAnimation()
                })
            }
        }, 800)
    }

    // Character-by-character typing
    function typeText(text, element, index, callback) {
        if (index < text.length) {
            element.textContent = text.substring(0, index + 1)
            setTimeout(() => {
                typeText(text, element, index + 1, callback)
            }, 35) // Typing speed
        } else {
            if (callback) callback()
        }
    }

    // Walter's continuation animation after typing
    function continueWalterAnimation() {
        // Wait a moment for reading, then fade out chatbox only - walter stays on screen
        setTimeout(() => {
            // Fade out chatbox
            gsap.to(walterChatbox, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.in"
            })
            // Walter remains visible on screen
        }, 1500) // Wait 1.5s for user to read
    }

    // Click handlers for walter
    if (walter) {
        on(walter, 'click', startWalterTyping)
    }
    if (walterChatbox) {
        on(walterChatbox, 'click', (e) => {
            e.stopPropagation()
            startWalterTyping()
        })
    }

    // Create the main timeline
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=600%", // Extended for model + walter animation
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onEnter: (self) => log('ScrollTrigger:onEnter', { start: self.start, end: self.end }),
            onLeave: () => log('ScrollTrigger:onLeave'),
            onEnterBack: () => log('ScrollTrigger:onEnterBack'),
            onLeaveBack: () => log('ScrollTrigger:onLeaveBack'),
        }
    })
    aesthTimeline = tl

    // Phase 1: Runway fades in (0% - 15%)
    tl.to(runway, {
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    }, 0)

    // Phase 2: Crowd fades in (15% - 30%)
    tl.to(crowdLeft, {
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    }, 0.8)

    tl.to(crowdRight, {
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    }, 0.8)

    // Phase 2.5: Chat box appears from right crowd
    const chatbox = section.querySelector('.aesth-chatbox')
    if (chatbox) {
        tl.to(chatbox, {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        }, 1.4)
    }

    // Phase 3: Protest banner drops in from top (30% - 45%)
    tl.to(protest, {
        opacity: 1,
        y: 0,
        rotation: -5, // Keep the 5deg rotation
        duration: 1,
        ease: "power2.out"
    }, 1.6)

    // Phase 4: Text overlay fades in (after protest)
    if (textOverlay) {
        tl.to(textOverlay, {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        }, 2.2)
    }

    // Phase 5: Model fades in at center
    if (model) {
        tl.to(model, {
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        }, 3)

        // Phase 6: Model moves down slightly on the runway (lower on mobile)
        const modelStopY = isMobile ? mobileYOffset + 50 : 0
        tl.to(model, {
            top: '75%',
            y: modelStopY,
            duration: 1,
            ease: "power2.inOut"
        }, 4)

        // Phase 7: Model chatbox appears - trigger typing
        if (modelChatbox) {
            tl.to(modelChatbox, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
                onStart: startModelTyping
            }, 5)

            // Phase 7.5: Hold for typing animation (give user time to read)
            tl.to(modelChatbox, {
                opacity: 1,
                duration: 2.5 // Extended duration for typing
            }, 5.5)

            // Phase 8: Chatbox fades out
            tl.to(modelChatbox, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.in"
            }, 8)
        }

        // Phase 9: Model continues moving down and fades out (lower on mobile)
        const modelExitY = isMobile ? mobileYOffset + 100 : 0
        tl.to(model, {
            top: '130%',
            y: modelExitY,
            duration: 1.5,
            ease: "power2.in"
        }, 8.5)

        // Fade out model as it exits
        if (modelImg) {
            tl.to(modelImg, {
                opacity: 0,
                duration: 1,
                ease: "power2.in"
            }, 9.2)
        }
    }

    // Phase 10: Walter fades in at the same position
    if (walter) {
        tl.to(walter, {
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        }, 10)

        // Phase 11: Walter moves down slightly (like model, lower on mobile)
        const walterStopY = isMobile ? mobileYOffset + 50 : 0
        tl.to(walter, {
            top: '75%',
            y: walterStopY,
            duration: 1,
            ease: "power2.inOut"
        }, 11)

        // Phase 12: Walter chatbox appears - waiting for click
        if (walterChatbox) {
            tl.to(walterChatbox, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out",
                onStart: () => {
                    walterClickable = true
                }
            }, 12)

            // Phase 12.5: Hold - waiting for user to click
            // The animation will continue via continueWalterAnimation() after typing
            tl.to(walterChatbox, {
                opacity: 1,
                duration: 3 // Extended hold for user to click and read
            }, 12.5)
        }
    }

    ScrollTrigger.refresh()
    log('init:done', {
        stStart: tl.scrollTrigger?.start,
        stEnd: tl.scrollTrigger?.end
    })
}

export function destroyAesthScroll() {
    if (!aesthTimeline) return

    log('destroy:start')
    try {
        cleanupListeners.forEach(fn => fn())
    } finally {
        cleanupListeners = []
    }

    // Kill timeline + its ScrollTrigger and revert pin changes if possible.
    const st = aesthTimeline.scrollTrigger
    if (st) st.kill(true)
    aesthTimeline.kill()
    aesthTimeline = null

    // Safety: kill any remaining ScrollTriggers that reference elements in this section.
    const section = document.querySelector('.aesth-section')
    if (section) {
        ScrollTrigger.getAll().forEach(t => {
            if (t?.trigger && section.contains(t.trigger)) t.kill(true)
        })
    }

    ScrollTrigger.refresh()
    log('destroy:done')
}
