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
    
    console.log('Walter Van Beiredonck site initialized')
})
