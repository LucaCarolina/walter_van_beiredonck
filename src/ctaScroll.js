import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initCtaScroll() {
    const ctaSection = document.querySelector('#ctaSection')
    if (!ctaSection) return

    const lineWrappers = ctaSection.querySelectorAll('.cta-line-wrapper')
    const personItems = ctaSection.querySelectorAll('.cta-media-item.person')
    const bckgrItems = ctaSection.querySelectorAll('.cta-media-item.bckgr')
    const allMediaItems = [...personItems, ...bckgrItems]

    // 1. Set static positions - center images using xPercent/yPercent
    // Position background images with offset for overlap
    gsap.set(allMediaItems, {
        xPercent: -50,
        yPercent: -50,
        x: (i, target) => {
            // Background images get offset for overlap
            if (target.classList.contains('bckgr')) {
                return -15
            }
            return 0
        },
        y: (i, target) => {
            // Background images get offset for overlap
            if (target.classList.contains('bckgr')) {
                return -15
            }
            return 0
        },
        rotation: (i, target) => {
            const r = target.style.getPropertyValue('--rotate') || '0deg'
            return parseFloat(r) || 0
        },
        scale: 1
    })

    // Initial Hide - text starts from below
    gsap.set(lineWrappers, { 
        y: 80, 
        opacity: 0,
        overflow: 'hidden'
    })
    gsap.set(personItems, { opacity: 0, scale: 0.8 })
    gsap.set(bckgrItems, { opacity: 0, scale: 0.8 })

    // Entrance Timeline - text appears first, then images
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ctaSection,
            start: "top 75%",
            toggleActions: "play none none reverse"
        }
    })

    // Text animation: fast but smooth, line by line from below
    tl.to(lineWrappers, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out"
    })
    // Images appear after text - static, no parallax
    .to(allMediaItems, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out"
    }, "-=0.3")

    ScrollTrigger.refresh()
}
