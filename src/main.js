// Import styles
import './style.css'

// Import jQuery
import $ from 'jquery'
window.jQuery = $
window.$ = $

// Import interaction modules
import { initHeroDrag } from './heroDrag.js'
import { initWltScroll } from './wltScroll.js'
import { initAesthScroll, destroyAesthScroll } from './aesthScroll.js'
import { initWearableGrid } from './wearableGrid.js'
import './logger.js'

// This file serves as the entry point for Vite
// All JavaScript functionality will be organized into separate modules
// and imported here as needed

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize hero drag interaction
    initHeroDrag()
    initWltScroll()
    // AESTHETICTERRORISTS is hidden behind `.wlt-locked` initially,
    // so we initialize it only when WLT unlocks. This avoids ScrollTrigger
    // measuring a `display:none` section and leaving stale pin-spacers.
    document.addEventListener('walter:wltUnlocked', () => {
        window.walterLog?.('APP', 'wltUnlocked -> initAesthScroll, initWearableGrid')
        initAesthScroll()
        // Delay wearable grid init slightly to ensure section is visible
        setTimeout(() => initWearableGrid(), 100)
    })
    document.addEventListener('walter:wltLocked', () => {
        window.walterLog?.('APP', 'wltLocked -> destroyAesthScroll')
        destroyAesthScroll()
    })

    const introSection = document.querySelector('#introClapperSection')
    const bandSection = document.querySelector('#bandTransition')
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
    let ticking = false

    const updateIntroScroll = () => {
        if (!introSection) return

        const rect = introSection.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const start = viewportHeight * 0.8
        const end = viewportHeight * 0.2
        const progress = clamp((start - rect.top) / (start - end), 0, 1)

        const textProgress = clamp((progress - 0.1) / 0.9, 0, 1)
        const highlightProgress = clamp((progress - 0.45) / 0.55, 0, 1)
        const imageScale = 0.7 + progress * 0.6
        const imageOpacity = clamp((progress - 0.1) / 0.9, 0, 1)

        introSection.style.setProperty('--clapper-open', progress.toFixed(3))
        introSection.style.setProperty('--clapper-text', textProgress.toFixed(3))
        introSection.style.setProperty('--highlight-progress', highlightProgress.toFixed(3))
        introSection.style.setProperty('--intro-image-scale', imageScale.toFixed(3))
        introSection.style.setProperty('--intro-image-opacity', imageOpacity.toFixed(3))
    }

    const updateBandScroll = () => {
        if (!bandSection) return

        const rect = bandSection.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const scrollDistance = rect.height - viewportHeight

        // Start animation earlier: when the section top is 80% into the viewport
        const startOffset = viewportHeight * 0.8
        const totalDistance = scrollDistance + startOffset

        let progress = 0

        if (totalDistance > 0) {
            progress = (startOffset - rect.top) / totalDistance
            progress = clamp(progress, 0, 1)
        }

        bandSection.style.setProperty('--band-progress', progress.toFixed(3))
        document.documentElement.style.setProperty('--band-progress', progress.toFixed(3))
    }

    const updateAll = () => {
        updateIntroScroll()
        updateBandScroll()
        ticking = false
    }

    const onScroll = () => {
        if (!ticking) {
            ticking = true
            window.requestAnimationFrame(updateAll)
        }
    }

    updateAll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateAll)

    console.log('Walter Van Beiredonck site initialized')
    window.walterLog?.('APP', 'initialized', {
        scrollY: window.scrollY,
        bodyClasses: document.body.className
    })

    // Puk Puk typing effect
    const chatBox = document.getElementById('pukPukChat')
    const chatText = document.getElementById('pukPukText')
    const typingIndicator = document.getElementById('typingIndicator')

    if (chatBox && chatText && typingIndicator) {
        const fullText = chatText.textContent.trim()
        const fullHTML = chatText.innerHTML.trim()
        let isTyping = false
        let hasTyped = false

        // Initially hide the text, show typing indicator
        chatText.textContent = ''

        chatBox.addEventListener('click', () => {
            if (isTyping || hasTyped) return

            isTyping = true
            hasTyped = true

            // Hide typing indicator, show text container, expand box
            typingIndicator.classList.add('hidden')
            chatText.classList.add('visible')
            chatBox.classList.add('typing')
            chatBox.classList.add('expanded')

            let i = 0
            const typeSpeed = 30 // milliseconds per character

            const typeWriter = () => {
                if (i < fullText.length) {
                    chatText.textContent += fullText.charAt(i)
                    i++
                    setTimeout(typeWriter, typeSpeed)
                } else {
                    // Typing complete - restore HTML with span for underline
                    isTyping = false
                    chatText.innerHTML = fullHTML
                    setTimeout(() => {
                        chatBox.classList.remove('typing')
                        chatBox.classList.add('typing-done')
                    }, 500)
                }
            }

            typeWriter()
        })
    }

    // AESTHETICTERRORISTS chat box typing effect (on hover over RIGHT crowd)
    const aesthCrowdRight = document.querySelector('.aesth-crowd-right')
    const aesthChatbox = document.getElementById('aesthChatbox')
    const aesthChatText = document.getElementById('aesthChatText')
    const aesthTypingIndicator = document.getElementById('aesthTypingIndicator')

    if (aesthCrowdRight && aesthChatbox && aesthChatText && aesthTypingIndicator) {
        const fullText = "In a move that would have crushed a lesser artist, Walter lost his financial backing and was legally prohibited from using his own name on his creations. Most designers would have vanished into the archives, but Walter went underground. Stripped of his identity, he launched a ghost label."
        let isTyping = false
        let typewriterTimeout = null

        // Trigger on hover over the right crowd
        aesthCrowdRight.addEventListener('mouseenter', () => {
            if (isTyping) return

            isTyping = true

            // Expand box, hide typing indicator, show text container
            aesthChatbox.classList.add('expanded')
            aesthTypingIndicator.classList.add('hidden')
            aesthChatText.classList.add('visible')
            aesthChatText.textContent = ''

            let i = 0
            const typeSpeed = 25 // milliseconds per character

            const typeWriter = () => {
                if (i < fullText.length && isTyping) {
                    aesthChatText.textContent += fullText.charAt(i)
                    i++
                    typewriterTimeout = setTimeout(typeWriter, typeSpeed)
                } else {
                    isTyping = false
                }
            }

            typeWriter()
        })

        // Reset on mouse leave
        aesthCrowdRight.addEventListener('mouseleave', () => {
            isTyping = false
            if (typewriterTimeout) {
                clearTimeout(typewriterTimeout)
                typewriterTimeout = null
            }

            // Collapse box, show typing indicator, hide text
            aesthChatbox.classList.remove('expanded')
            aesthTypingIndicator.classList.remove('hidden')
            aesthChatText.classList.remove('visible')
            aesthChatText.textContent = ''
        })
    }
})
