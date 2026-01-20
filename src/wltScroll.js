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
        
        // Restore wrapper visibility
        gsap.set(wrapper, { display: 'block', opacity: 1 })
        
        // Restore overlay
        gsap.to('.term-overlay', { opacity: 1, duration: 0.5 })
        
        // Restore pieces positions
        gsap.to([pieces.top, pieces.mid, pieces.bot], {
            x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: "power2.out"
        })
        
        // Reset progress bar
        gsap.set(progressBar, { width: "0%" })
        
        // Hide next section again
        const nextSection = document.querySelector('.wlt-section').nextElementSibling
        if (nextSection) {
            gsap.to(nextSection, { opacity: 0, duration: 0.5 })
        }
        
        // Re-lock the scroll
        document.body.classList.add('wlt-locked')
        ScrollTrigger.refresh()
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
            // Reset when scrolling back up into the section
            onEnterBack: () => {
                const wrapper = document.querySelector('.termination-wrapper')
                // Only reset if it was actually crushed/hidden
                if (wrapper && wrapper.style.display === 'none') {
                    resetSystem()
                }
            }
        }
    })

    // Parallax Background
    bgRows.forEach((row, i) => {
        const direction = i % 2 === 0 ? 1 : -1
        const speed = 0.2 + (i * 0.1)
        
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
    // Pass the state setter/getter or handle logic here
    initTermination(resetSystem, () => isCrushed, (val) => isCrushed = val)
    
    // Initially lock the page
    document.body.classList.add('wlt-locked')
    
    const nextSection = document.querySelector('.wlt-section').nextElementSibling
    if (nextSection) {
        gsap.set(nextSection, { opacity: 0 })
    }
    
    ScrollTrigger.refresh()
}

function initTermination(resetSystem, getIsCrushed, setIsCrushed) {
    const wrapper = document.querySelector('.termination-wrapper')
    const progressBar = document.getElementById('termProgressFill')
    const pieces = {
        top: document.getElementById('termPieceTop'),
        mid: document.getElementById('termPieceMid'),
        bot: document.getElementById('termPieceBot')
    }
    
    if (!wrapper || !progressBar) return
    
    let pressTimer
    
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

    function crushSystem() {
        setIsCrushed(true)
        wrapper.classList.add('crushed')
        
        // Hide UI
        gsap.to('.term-overlay', { opacity: 0, duration: 0.3 })

        // Explode pieces animations
        gsap.to(pieces.top, { y: -100, x: -50, rotation: -15, opacity: 0, duration: 1, ease: "power2.in" })
        gsap.to(pieces.mid, { y: 300, rotation: 5, opacity: 0, duration: 0.8, delay: 0.1, ease: "power2.in" })
        
        // IMMEDIATE TRANSITION LOGIC
        setTimeout(() => {
            // 1. Kill the ScrollTrigger for the horizontal section to release the pin
            // Finding the ScrollTrigger instance associated with the track/section is tricky without a reference.
            // But we can just rely on unlocking the body and jumping.
            
            document.body.classList.remove('wlt-locked')
            
            const nextSection = document.querySelector('.wlt-section').nextElementSibling
            
            if (nextSection) {
                // Ensure visibility
                nextSection.style.display = 'block'
                nextSection.style.opacity = '1'
                gsap.set(nextSection, { opacity: 1, display: 'block' })

                // Force layout update check
                const _ = nextSection.offsetHeight 
                
                // Jump immediately using multiple methods to guarantee one works
                const targetY = nextSection.getBoundingClientRect().top + window.scrollY
                
                // Method A: Window Scroll
                window.scrollTo(0, targetY)
                
                // Method B: GSAP ScrollTo (redundancy)
                gsap.to(window, { scrollTo: targetY, duration: 0, overwrite: true })
                
                // Method C: Element ScrollIntoView
                nextSection.scrollIntoView()
            }
            
            // Refresh ScrollTrigger AFTER the jump to correct calculations for future scrolls
            setTimeout(() => ScrollTrigger.refresh(), 100)
            
            // Hide wrapper later
            setTimeout(() => {
                 gsap.set(wrapper, { display: 'none' })
            }, 1000)

        }, 500) // 0.5s delay to let pieces move a bit

        // Bot animation
        gsap.to(pieces.bot, {
            y: 400, x: 50, rotation: 20, opacity: 0, duration: 1, delay: 0.2, ease: "power2.in"
        })
    }
}
