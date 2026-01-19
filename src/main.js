// Import styles
import './style.css'

// Import jQuery
import $ from 'jquery'
window.jQuery = $
window.$ = $

// Import interaction modules
import { initHeroDrag } from './heroDrag.js'

// This file serves as the entry point for Vite
// All JavaScript functionality will be organized into separate modules
// and imported here as needed

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize hero drag interaction
    initHeroDrag()
    
    const introSection = document.querySelector('#introClapperSection')

    if (introSection) {
        const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
        let ticking = false

        const updateIntroScroll = () => {
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

            ticking = false
        }

        const onScroll = () => {
            if (!ticking) {
                ticking = true
                window.requestAnimationFrame(updateIntroScroll)
            }
        }

        updateIntroScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', updateIntroScroll)
    }

    console.log('Walter Van Beiredonck site initialized')
})
