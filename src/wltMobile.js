import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { makeLogger } from './logger.js'

gsap.registerPlugin(ScrollTrigger)

const log = makeLogger('WLT-MOBILE')

export function initWltMobile() {
    const section = document.querySelector('.wlt-section')
    if (!section) return

    const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches
    if (!isMobile) return

    log('init:mobile carousel')

    const container = section.querySelector('.wlt-container') || section
    if (!container) return
    if (container.querySelector('.wlt-carousel')) return

    // Create mobile-specific 1990s background with proper z-index
    const existingMobileBg = container.querySelector('.wlt-background-mobile')
    if (!existingMobileBg) {
        const mobileBg = document.createElement('div')
        mobileBg.className = 'wlt-background-mobile'
        mobileBg.innerHTML = `
            <div class="wlt-bg-text-row-mobile top">
                <span>1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s</span>
            </div>
            <div class="wlt-bg-text-row-mobile mid">
                <span>1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s</span>
            </div>
            <div class="wlt-bg-text-row-mobile bot">
                <span>1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s 1990s</span>
            </div>
        `
        container.insertBefore(mobileBg, container.firstChild)
    }

    let isCrushed = false
    let mainScrollTrigger = null

    // Reset termination only
    const resetTerminationOnly = () => {
        log('resetTerminationOnly:called')
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

        gsap.set(wrapper, { display: 'block', opacity: 1, visibility: 'visible' })
        gsap.set('.term-overlay', { opacity: 1 })
        gsap.set([pieces.top, pieces.mid, pieces.bot], {
            x: 0, y: 0, rotation: 0, opacity: 1, clearProps: "transform"
        })
        gsap.set(progressBar, { width: "0%" })

        document.body.classList.add('wlt-locked')
        document.dispatchEvent(new CustomEvent('walter:wltLocked'))
    }

    // Build carousel
    const introCard = section.querySelector('.wlt-card.intro-card')
    const flipCards = Array.from(section.querySelectorAll('.wlt-card.flip-card'))
    const terminationCard = section.querySelector('.wlt-card.termination-card')

    const carousel = document.createElement('div')
    carousel.className = 'wlt-carousel'

    const viewport = document.createElement('div')
    viewport.className = 'wlt-carousel-viewport'

    const track = document.createElement('div')
    track.className = 'wlt-carousel-track'

    const prevBtn = document.createElement('button')
    prevBtn.className = 'wlt-carousel-arrow wlt-carousel-prev'
    prevBtn.type = 'button'
    prevBtn.setAttribute('aria-label', 'Previous')
    prevBtn.textContent = '‹'

    const nextBtn = document.createElement('button')
    nextBtn.className = 'wlt-carousel-arrow wlt-carousel-next'
    nextBtn.type = 'button'
    nextBtn.setAttribute('aria-label', 'Next')
    nextBtn.textContent = '›'

    viewport.appendChild(track)
    carousel.appendChild(prevBtn)
    carousel.appendChild(viewport)
    carousel.appendChild(nextBtn)
    container.appendChild(carousel)

    const slideEls = []

    const makeSlide = ({ src, alt, title, subtitle, desc, isTermination = false, mountEl = null }) => {
        const slide = document.createElement('div')
        slide.className = 'wlt-slide'
        slide.tabIndex = 0

        const inner = document.createElement('div')
        inner.className = 'wlt-slide-inner'

        if (mountEl) {
            // For termination, mount the existing wrapper
            inner.appendChild(mountEl)
        } else if (src) {
            // Create flip card structure for non-termination slides
            const flipInner = document.createElement('div')
            flipInner.className = 'wlt-flip-inner'
            
            // Front side (image)
            const front = document.createElement('div')
            front.className = 'wlt-flip-front'
            const img = document.createElement('img')
            img.src = src
            img.alt = alt || ''
            img.className = 'wlt-slide-image'
            front.appendChild(img)
            
            // Back side (info)
            const back = document.createElement('div')
            back.className = 'wlt-flip-back'
            if (title) {
                const titleEl = document.createElement('h3')
                titleEl.className = 'wlt-flip-title'
                titleEl.textContent = title
                back.appendChild(titleEl)
            }
            if (subtitle) {
                const subtitleEl = document.createElement('p')
                subtitleEl.className = 'wlt-flip-subtitle'
                subtitleEl.textContent = subtitle
                back.appendChild(subtitleEl)
            }
            if (desc) {
                const descEl = document.createElement('p')
                descEl.className = 'wlt-flip-desc'
                descEl.textContent = desc
                back.appendChild(descEl)
            }
            
            flipInner.appendChild(front)
            flipInner.appendChild(back)
            inner.appendChild(flipInner)
        }

        slide.appendChild(inner)

        slide.dataset.title = title || ''
        slide.dataset.subtitle = subtitle || ''
        slide.dataset.desc = desc || ''
        if (isTermination) slide.dataset.termination = '1'

        track.appendChild(slide)
        slideEls.push(slide)
        return slide
    }

    // Intro card
    if (introCard) {
        const img = introCard.querySelector('img')
        makeSlide({
            src: img?.getAttribute('src') || '',
            alt: img?.getAttribute('alt') || 'W.&L.T.',
            title: 'W.&L.T.',
            subtitle: 'Wild & Lethal Trash',
            desc: 'Tap a card to focus it. Tap again to read more.'
        })
    }

    // Collection cards
    flipCards.forEach((card) => {
        const frontImg = card.querySelector('.flip-card-front img')
        const title = card.querySelector('.flip-card-back h3')?.textContent?.trim() || ''
        const subtitle = card.querySelector('.flip-card-back p')?.textContent?.trim() || ''
        const desc = card.querySelector('.flip-card-back .card-desc')?.textContent?.trim() || ''

        makeSlide({
            src: frontImg?.getAttribute('src') || '',
            alt: frontImg?.getAttribute('alt') || title,
            title,
            subtitle,
            desc
        })
    })

    // Termination card as LAST slide in carousel
    if (terminationCard) {
        const wrapper = terminationCard.querySelector('.termination-wrapper')
        if (wrapper) {
            wrapper.classList.add('wlt-slide-termination')
            
            // Create the slide with wrapper
            const terminationSlide = makeSlide({
                title: 'IDENTITY TERMINATION',
                subtitle: 'Hold to crush the system',
                desc: '',
                isTermination: true,
                mountEl: wrapper
            })
            
            // Move overlay OUTSIDE of slide-inner so it's not clipped
            // Do this AFTER the slide is created and added to DOM
            if (terminationSlide) {
                const slideInner = terminationSlide.querySelector('.wlt-slide-inner')
                const overlay = slideInner?.querySelector('.term-overlay')
                
                if (overlay && slideInner) {
                    // Remove overlay from wrapper
                    overlay.remove()
                    // Append to slide (outside slide-inner, so it's visible)
                    terminationSlide.appendChild(overlay)
                    overlay.classList.add('wlt-overlay-external')
                }
            }
            
            terminationCard.style.display = 'none'
        }
    }

    // Modal for "read more"
    let modal = null
    const ensureModal = () => {
        if (modal) return modal
        modal = document.createElement('div')
        modal.className = 'wlt-modal'
        modal.innerHTML = `
            <div class="wlt-modal-backdrop" data-close="1"></div>
            <div class="wlt-modal-card" role="dialog" aria-modal="true" aria-label="WLT details">
                <button class="wlt-modal-close" type="button" aria-label="Close">×</button>
                <div class="wlt-modal-body"></div>
            </div>
        `
        modal.hidden = true
        document.body.appendChild(modal)

        const close = () => {
            modal.hidden = true
            document.body.classList.remove('wlt-modal-open')
        }
        modal.addEventListener('click', (e) => {
            const target = e.target
            if (target?.dataset?.close) close()
        })
        modal.querySelector('.wlt-modal-close')?.addEventListener('click', close)
        window.addEventListener('keydown', (e) => {
            if (!modal.hidden && e.key === 'Escape') close()
        })
        return modal
    }

    const openDetails = (slide) => {
        // Don't open modal for termination slide
        if (slide.dataset.termination === '1') return
        
        const title = slide.dataset.title || ''
        const subtitle = slide.dataset.subtitle || ''
        const desc = slide.dataset.desc || ''
        if (!title && !subtitle && !desc) return

        const m = ensureModal()
        const body = m.querySelector('.wlt-modal-body')
        if (body) {
            body.innerHTML = `
                <h3 class="wlt-modal-title">${escapeHtml(title)}</h3>
                ${subtitle ? `<p class="wlt-modal-subtitle">${escapeHtml(subtitle)}</p>` : ''}
                ${desc ? `<p class="wlt-modal-desc">${escapeHtml(desc)}</p>` : ''}
            `
        }
        m.hidden = false
        document.body.classList.add('wlt-modal-open')
    }

    let index = 0
    const clampIndex = (v) => Math.max(0, Math.min(v, slideEls.length - 1))

    const update = () => {
        slideEls.forEach((s, i) => {
            const isTermination = s.dataset.termination === '1'
            s.classList.toggle('is-active', i === index)
            s.classList.toggle('is-prev', i === index - 1)
            s.classList.toggle('is-next', i === index + 1)
            // Termination slide should always be clear when active
            if (isTermination && i === index) {
                s.style.filter = 'none'
                s.style.opacity = '1'
                s.style.transform = 'scale(1)'
            }
        })

        const active = slideEls[index]
        if (!active) return
        const viewportWidth = viewport.clientWidth
        const slideWidth = active.offsetWidth
        const offset = (viewportWidth - slideWidth) / 2 - active.offsetLeft
        track.style.transform = `translateX(${offset}px)`

        prevBtn.disabled = index === 0
        nextBtn.disabled = index === slideEls.length - 1
    }

    const setIndex = (next) => {
        index = clampIndex(next)
        update()
    }

    prevBtn.addEventListener('click', () => setIndex(index - 1))
    nextBtn.addEventListener('click', () => setIndex(index + 1))

    slideEls.forEach((slide, i) => {
        slide.addEventListener('click', () => {
            // Termination slide: just focus it, don't flip
            if (slide.dataset.termination === '1') {
                if (i !== index) setIndex(i)
                return
            }
            // If not active, focus it first
            if (i !== index) {
                setIndex(i)
                return
            }
            // If active, flip it
            slide.classList.toggle('is-flipped')
        })
        slide.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                if (slide.dataset.termination === '1') {
                    if (i !== index) setIndex(i)
                    return
                }
                if (i !== index) {
                    setIndex(i)
                    return
                }
                slide.classList.toggle('is-flipped')
            }
        })
    })

    // Swipe support
    let touchStartX = null
    let touchStartY = null
    viewport.addEventListener('touchstart', (e) => {
        const t = e.touches?.[0]
        if (!t) return
        touchStartX = t.clientX
        touchStartY = t.clientY
    }, { passive: true })
    viewport.addEventListener('touchend', (e) => {
        const t = e.changedTouches?.[0]
        if (!t || touchStartX == null || touchStartY == null) return
        const dx = t.clientX - touchStartX
        const dy = t.clientY - touchStartY
        touchStartX = null
        touchStartY = null

        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) setIndex(index + 1)
            else setIndex(index - 1)
        }
    }, { passive: true })

    window.addEventListener('resize', () => update())

    // Calculate actual content height (including background rows and carousel)
    // Let the section be its natural height, but pin it until crushed
    const vh = window.innerHeight
    
    // Don't force height - let it be natural based on content
    // But ensure it's at least 100vh
    section.style.minHeight = `${vh}px`
    container.style.minHeight = `${vh}px`
    container.style.overflow = 'hidden'
    
    // Force a refresh to measure actual height
    ScrollTrigger.refresh()
    
    // Get the actual scroll height needed (section's natural height)
    // Measure only the carousel, not including fixed overlay or extra space
    const carouselEl = container.querySelector('.wlt-carousel')
    let sectionHeight = vh // Default to viewport height
    
    if (carouselEl) {
        // Force a layout recalculation
        ScrollTrigger.refresh()
        
        // Measure carousel's actual content height (not including fixed overlay)
        // The overlay is position: fixed, so it doesn't affect layout
        const carouselRect = carouselEl.getBoundingClientRect()
        const sectionRect = section.getBoundingClientRect()
        const carouselBottom = carouselRect.bottom - sectionRect.top
        
        // Use carousel bottom exactly - no extra buffer
        sectionHeight = Math.max(carouselBottom, vh)
    } else {
        sectionHeight = section.offsetHeight
    }
    
    // Don't add extra scroll distance - just pin for the exact content height
    const scrollDistance = Math.max(sectionHeight - vh, 0) // Can be 0 if content fits in viewport
    
    // Use pinSpacing: false to prevent extra space, but allow natural height
    const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${scrollDistance}px`, // Scroll until section bottom reaches viewport top
        pin: true,
        pinSpacing: false, // CRITICAL: Prevents pin-spacer from adding extra height
        scrub: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
            // Prevent scrolling past if not crushed (same as desktop)
            if (!isCrushed && document.body.classList.contains('wlt-locked')) {
                if (self.progress >= 0.999 && self.direction > 0) {
                    if (typeof self.scroll === 'function') {
                        self.scroll(self.end - 2)
                    } else {
                        window.scrollTo({ top: self.end - 2, behavior: 'auto' })
                    }
                }
            }
            // Prevent scrolling back down if crushed but user is still in section
            if (isCrushed && self.direction < 0 && self.progress < 0.5) {
                // User trying to scroll back down - block it
                if (typeof self.scroll === 'function') {
                    self.scroll(self.end + 10)
                } else {
                    window.scrollTo({ top: self.end + 10, behavior: 'auto' })
                }
            }
        },
        onEnterBack: () => {
            log('ScrollTrigger:onEnterBack (mobile)')
            // When scrolling back up from next section, snap to termination slide
            if (isCrushed) {
                resetTerminationOnly()
                // Snap carousel to last slide (termination)
                const terminationIndex = slideEls.length - 1
                setIndex(terminationIndex)
                // Snap scroll to just before end of pin
                const buffer = Math.min(200, Math.round(window.innerHeight * 0.25))
                const scrollTarget = st.end - buffer
                log('onEnterBack:scrollTo termination', { scrollTarget, stEnd: st.end, buffer })
                window.scrollTo({ top: scrollTarget, behavior: 'auto' })
            }
        },
        onLeave: () => {
            // If user somehow leaves without crushing, block them
            if (!isCrushed && document.body.classList.contains('wlt-locked')) {
                log('onLeave:blocked - not crushed')
                const buffer = Math.min(200, Math.round(window.innerHeight * 0.25))
                const scrollTarget = st.end - buffer
                window.scrollTo({ top: scrollTarget, behavior: 'auto' })
            }
        }
    })
    mainScrollTrigger = st

    // Termination interaction (hold on image itself)
    // Find the termination wrapper inside the carousel slide
    const terminationSlide = slideEls.find(s => s.dataset.termination === '1')
    const terminationWrapper = terminationSlide?.querySelector('.termination-wrapper')
    const externalOverlay = terminationSlide?.querySelector('.wlt-overlay-external')
    
    if (terminationWrapper) {
        // Make sure overlay is visible and accessible
        if (externalOverlay) {
            externalOverlay.style.pointerEvents = 'none' // Overlay itself not interactive
            // Progress bar fill should still be visible
            const progressFill = externalOverlay.querySelector('#termProgressFill')
            if (progressFill) {
                progressFill.style.display = 'block'
                progressFill.style.visibility = 'visible'
            }
        }
        
        initTermination(
            resetTerminationOnly,
            () => isCrushed,
            (val) => isCrushed = val,
            () => mainScrollTrigger,
            terminationWrapper
        )
    }

    // Scroll listener to detect scrolling back UP from next section
    let lastScrollY = 0
    let scrollBackListener = null

    function setupScrollBackDetection() {
        log('setupScrollBackDetection:setup (mobile)')
        lastScrollY = window.scrollY

        scrollBackListener = () => {
            const currentY = window.scrollY
            const st = mainScrollTrigger

            // If scrolling UP and we're in the "gap zone" (between st.end and where we landed)
            if (st && currentY < lastScrollY && currentY > st.end && currentY < st.end + window.innerHeight) {
                log('scrollBackListener:GAP zone detected (mobile)', {
                    currentY,
                    lastScrollY,
                    stEnd: st.end,
                    gapEnd: st.end + window.innerHeight
                })

                // Remove listener immediately to prevent multiple fires
                window.removeEventListener('scroll', scrollBackListener)
                scrollBackListener = null

                // Reset termination only and snap to termination slide
                log('scrollBackListener:resetTerminationOnly (mobile)')
                resetTerminationOnly()

                // Snap carousel to last slide (termination)
                const terminationIndex = slideEls.length - 1
                setIndex(terminationIndex)

                const buffer = Math.min(200, Math.round(window.innerHeight * 0.25))
                const scrollTarget = st.end - buffer
                log('scrollBackListener:scrollTo', { scrollTarget, stEnd: st.end, buffer })
                window.scrollTo({ top: scrollTarget, behavior: 'auto' })
            }

            lastScrollY = currentY
        }

        // Add listener after a short delay
        setTimeout(() => {
            log('scrollBackListener:active (mobile)')
            window.addEventListener('scroll', scrollBackListener, { passive: true })
        }, 500)
    }

    document.body.classList.add('wlt-locked')
    update()
    ScrollTrigger.refresh()
}

function initTermination(resetTerminationOnly, getIsCrushed, setIsCrushed, getScrollTrigger, wrapperEl = null) {
    const wrapper = wrapperEl || document.querySelector('.termination-wrapper')
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

    // Hold on the image wrapper itself (not a button)
    wrapper.addEventListener('mousedown', startPress)
    wrapper.addEventListener('touchstart', startPress, { passive: false })
    window.addEventListener('mouseup', endPress, { passive: true })
    window.addEventListener('touchend', endPress, { passive: true })
    wrapper.addEventListener('mouseleave', endPress)

    function crushSystem() {
        log('crushSystem:called')

        gsap.killTweensOf(progressBar)

        setIsCrushed(true)
        wrapper.classList.add('crushed')

        gsap.set(wrapper, { display: 'block', opacity: 1, visibility: 'visible' })
        gsap.set('.term-overlay', { opacity: 1 })

        const breakTl = gsap.timeline({
            defaults: { ease: 'power3.inOut' },
            onComplete: () => {
                gsap.set(wrapper, { display: 'none' })
                gsap.set('.term-overlay', { opacity: 0 })

                document.body.classList.remove('wlt-locked')
                document.dispatchEvent(new CustomEvent('walter:wltUnlocked'))
                log('crushSystem:body unlocked (post-break)')

                const nextSection = wltSection.nextElementSibling
                if (nextSection) {
                    log('crushSystem: Next section found:', nextSection.className)
                    gsap.set(nextSection, { opacity: 0, visibility: 'visible', display: '' })

                    let sibling = nextSection.nextElementSibling
                    while (sibling) {
                        gsap.set(sibling, { opacity: 1, visibility: 'visible', display: '' })
                        sibling = sibling.nextElementSibling
                    }
                }

                wltSection.classList.add('crushed')

                const st = getScrollTrigger()
                const OFFSET = window.innerHeight - 100
                const scrollTarget = st ? st.end + OFFSET : 5000

                log('crushSystem:scrollTo', { scrollTarget, stEnd: st?.end, offset: OFFSET })
                window.scrollTo({ top: scrollTarget, behavior: 'auto' })
                
                // Set up listener to detect scrolling back up
                setupScrollBackDetection()

                log('crushSystem:ScrollTrigger.refresh()')
                ScrollTrigger.refresh()

                if (nextSection) {
                    gsap.to(nextSection, { opacity: 1, duration: 1.2, ease: "power2.out" })
                }
            }
        })

        breakTl.to('.term-overlay', { opacity: 0, duration: 0.25 }, 0)
        breakTl.to(pieces.top, { y: -140, x: -40, rotation: -14, duration: 0.55 }, 0.05)
        breakTl.to(pieces.mid, { y: 10, x: 0, rotation: 2, duration: 0.55 }, 0.08)
        breakTl.to(pieces.bot, { y: 160, x: 45, rotation: 16, duration: 0.55 }, 0.06)
        breakTl.to([pieces.top, pieces.mid, pieces.bot], { opacity: 0, duration: 0.25, ease: 'power2.out' }, 0.55)
    }
}

function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;')
}
