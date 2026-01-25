// Import styles
import './style.css'

// Import jQuery
import $ from 'jquery'
window.jQuery = $
window.$ = $

// Import interaction modules
import { initHeroDrag } from './heroDrag.js'
import { initWltScroll } from './wltScroll.js'
import { initWltMobile } from './wltMobile.js'
import { initAesthScroll, destroyAesthScroll } from './aesthScroll.js'
import { initWearableGrid } from './wearableGrid.js'
import { initCtaScroll } from './ctaScroll.js'
import './logger.js'

// Import GSAP
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// Initialize the application when DOM is ready using jQuery
$(document).ready(function() {
    const $ = window.jQuery
    
    // Initialize hero drag interaction
    initHeroDrag()

    // WLT: mobile carousel vs desktop horizontal scroll
    const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches
    if (isMobile) {
        initWltMobile()
    } else {
        initWltScroll()
    }

    // Hero CTA button - smooth scroll to intro section using jQuery
    const $heroCta = $('.hero-content .cta-button')
    const $introTarget = $('#introClapperSection')

    if ($heroCta.length && $introTarget.length) {
        $heroCta.on('click', function(e) {
            e.preventDefault()
            $('html, body').animate({
                scrollTop: $introTarget.offset().top
            }, 800, 'swing')
        })
    }

    // Wearable section black button - smooth scroll to next section (mobile only) using jQuery
    const $wearableSectionBtn = $('.wearable-section-btn')
    const $wearableSection = $('#wearableSection')

    if ($wearableSectionBtn.length && $wearableSection.length) {
        $wearableSectionBtn.on('click', function(e) {
            e.preventDefault()
            const $nextSection = $wearableSection.next()
            if ($nextSection.length) {
                $('html, body').animate({
                    scrollTop: $nextSection.offset().top
                }, 800, 'swing')
            }
        })
    }

    // Custom event listeners using jQuery
    $(document).on('walter:wltUnlocked', function() {
        window.walterLog?.('APP', 'wltUnlocked -> initAesthScroll, initWearableGrid')
        initAesthScroll()
        // Delay wearable grid init slightly to ensure section is visible
        setTimeout(function() {
            initWearableGrid()
        }, 100)
    })
    
    $(document).on('walter:wltLocked', function() {
        window.walterLog?.('APP', 'wltLocked -> destroyAesthScroll')
        destroyAesthScroll()
    })

    // Scroll-based animations using jQuery
    const $introSection = $('#introClapperSection')
    const $bandSection = $('#bandTransition')
    const clamp = function(value, min, max) {
        return Math.min(Math.max(value, min), max)
    }
    let ticking = false

    const updateIntroScroll = function() {
        if (!$introSection.length) return
        const rect = $introSection[0].getBoundingClientRect()
        const viewportHeight = $(window).height()
        const start = viewportHeight * 0.8
        const end = viewportHeight * 0.2
        const progress = clamp((start - rect.top) / (start - end), 0, 1)
        const textProgress = clamp((progress - 0.55) / 0.45, 0, 1)
        const highlightProgress = clamp((progress - 0.75) / 0.25, 0, 1)
        const imageScale = 0.7 + progress * 0.6
        const imageOpacity = clamp((progress - 0.1) / 0.9, 0, 1)

        $introSection.css('--clapper-open', progress.toFixed(3))
        $introSection.css('--clapper-text', textProgress.toFixed(3))
        $introSection.css('--highlight-progress', highlightProgress.toFixed(3))
        $introSection.css('--intro-image-scale', imageScale.toFixed(3))
        $introSection.css('--intro-image-opacity', imageOpacity.toFixed(3))
    }

    const updateBandScroll = function() {
        if (!$bandSection.length) return
        const rect = $bandSection[0].getBoundingClientRect()
        const viewportHeight = $(window).height()
        const scrollDistance = rect.height - viewportHeight
        const startOffset = viewportHeight * 0.8
        const totalDistance = scrollDistance + startOffset
        let progress = 0
        if (totalDistance > 0) {
            progress = (startOffset - rect.top) / totalDistance
            progress = clamp(progress, 0, 1)
        }
        $bandSection.css('--band-progress', progress.toFixed(3))
        $('html').css('--band-progress', progress.toFixed(3))
    }

    const updateAll = function() {
        updateIntroScroll()
        updateBandScroll()
        ticking = false
    }

    const onScroll = function() {
        if (!ticking) {
            ticking = true
            window.requestAnimationFrame(updateAll)
        }
    }

    updateAll()
    $(window).on('scroll', onScroll)
    $(window).on('resize', updateAll)

    console.log('Walter Van Beiredonck site initialized')
    window.walterLog?.('APP', 'initialized', {
        scrollY: $(window).scrollTop(),
        bodyClasses: $('body').attr('class')
    })

    // Puk Puk typing effect using jQuery
    const $chatBox = $('#pukPukChat')
    const $chatText = $('#pukPukText')
    const $typingIndicator = $('#typingIndicator')

    if ($chatBox.length && $chatText.length && $typingIndicator.length) {
        const fullText = $chatText.text().trim()
        const fullHTML = $chatText.html().trim()
        let isTyping = false
        let hasTyped = false

        $chatText.text('')

        $chatBox.on('click', function() {
            if (isTyping || hasTyped) return

            isTyping = true
            hasTyped = true

            $typingIndicator.addClass('hidden')
            $chatText.addClass('visible')
            $chatBox.addClass('typing expanded')

            let i = 0
            const typeSpeed = 30

            const typeWriter = function() {
                if (i < fullText.length) {
                    $chatText.text($chatText.text() + fullText.charAt(i))
                    i++
                    setTimeout(typeWriter, typeSpeed)
                } else {
                    isTyping = false
                    $chatText.html(fullHTML)
                    setTimeout(function() {
                        $chatBox.removeClass('typing').addClass('typing-done')
                    }, 500)
                }
            }

            typeWriter()
        })
    }

    // AESTHETICTERRORISTS chat box typing effect using jQuery
    const $aesthCrowdRight = $('.aesth-crowd-right')
    const $aesthChatbox = $('#aesthChatbox')
    const $aesthChatText = $('#aesthChatText')
    const $aesthTypingIndicator = $('#aesthTypingIndicator')

    if ($aesthCrowdRight.length && $aesthChatbox.length && $aesthChatText.length && $aesthTypingIndicator.length) {
        const fullText = "In a move that would have crushed a lesser artist, Walter lost his financial backing and was legally prohibited from using his own name on his creations. Most designers would have vanished into the archives, but Walter went underground. Stripped of his identity, he launched a ghost label."
        let isTyping = false
        let typewriterTimeout = null

        $aesthCrowdRight.on('mouseenter', function() {
            if (isTyping) return
            isTyping = true
            $aesthChatbox.addClass('expanded')
            $aesthTypingIndicator.addClass('hidden')
            $aesthChatText.addClass('visible').text('')

            let i = 0
            const typeSpeed = 25

            const typeWriter = function() {
                if (i < fullText.length && isTyping) {
                    $aesthChatText.text($aesthChatText.text() + fullText.charAt(i))
                    i++
                    typewriterTimeout = setTimeout(typeWriter, typeSpeed)
                } else {
                    isTyping = false
                }
            }
            typeWriter()
        })

        $aesthCrowdRight.on('mouseleave', function() {
            isTyping = false
            if (typewriterTimeout) {
                clearTimeout(typewriterTimeout)
                typewriterTimeout = null
            }
            $aesthChatbox.removeClass('expanded')
            $aesthTypingIndicator.removeClass('hidden')
            $aesthChatText.removeClass('visible').text('')
        })
    }

    // CTA Section Animation - Handled by dedicated module
    initCtaScroll()
})
