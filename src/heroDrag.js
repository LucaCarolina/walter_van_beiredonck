// Hero section draggable rectangle reveal interaction
// Uses jQuery as per project requirements

export function initHeroDrag() {
    const $ = window.jQuery;
    
    if (!$) {
        console.error('jQuery is required for hero drag interaction');
        return;
    }

    const $rectangle = $('#revealRectangle');
    const $jesterWrapper = $('#jesterImageWrapper');
    const $walterImage = $('.hero-image-base');
    const $container = $('.hero-image-container');
    
    if (!$rectangle.length || !$jesterWrapper.length || !$container.length) {
        return;
    }

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let containerRect = null;

    // Get initial position from CSS or set default
    function getRectanglePosition() {
        const rect = $rectangle[0].getBoundingClientRect();
        const containerRect = $container[0].getBoundingClientRect();
        return {
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top
        };
    }

    // Update clip-path on Walter image to exclude rectangle area, revealing jester
    function updateClipPath() {
        const rect = $rectangle[0].getBoundingClientRect();
        const containerRect = $container[0].getBoundingClientRect();
        
        const left = rect.left - containerRect.left;
        const top = rect.top - containerRect.top;
        const right = left + rect.width;
        const bottom = top + rect.height;
        
        // Convert to percentage for clip-path
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        const leftPercent = Math.max(0, Math.min(100, (left / containerWidth) * 100));
        const topPercent = Math.max(0, Math.min(100, (top / containerHeight) * 100));
        const rightPercent = Math.max(0, Math.min(100, (right / containerWidth) * 100));
        const bottomPercent = Math.max(0, Math.min(100, (bottom / containerHeight) * 100));
        
        // Create a clip-path that excludes the rectangle area
        // We'll create a polygon that goes around the rectangle
        // Top area: 0,0 to 100,0, but skip the rectangle
        // Left area: 0,0 to 0,100, but skip the rectangle
        // Right area: 100,0 to 100,100, but skip the rectangle  
        // Bottom area: 0,100 to 100,100, but skip the rectangle
        
        // Create a complex polygon that covers everything except the rectangle
        const clipPath = `polygon(
            0% 0%, 
            ${leftPercent}% 0%, 
            ${leftPercent}% ${topPercent}%, 
            ${rightPercent}% ${topPercent}%, 
            ${rightPercent}% 0%, 
            100% 0%, 
            100% ${topPercent}%, 
            100% ${bottomPercent}%, 
            ${rightPercent}% ${bottomPercent}%, 
            ${rightPercent}% 100%, 
            ${leftPercent}% 100%, 
            ${leftPercent}% ${bottomPercent}%, 
            0% ${bottomPercent}%, 
            0% 0%
        )`;
        
        $walterImage.css({
            'clip-path': clipPath,
            '-webkit-clip-path': clipPath
        });
    }

    // Handle mouse down
    $rectangle.on('mousedown', function(e) {
        isDragging = true;
        $rectangle.addClass('dragging');
        containerRect = $container[0].getBoundingClientRect();
        
        const rect = $rectangle[0].getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = rect.left - containerRect.left;
        initialTop = rect.top - containerRect.top;
        
        e.preventDefault();
    });

    // Handle mouse move
    $(document).on('mousemove', function(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;
        
        // Constrain rectangle within container bounds
        const rect = $rectangle[0].getBoundingClientRect();
        const maxLeft = containerRect.width - rect.width;
        const maxTop = containerRect.height - rect.height;
        
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        
        $rectangle.css({
            left: newLeft + 'px',
            top: newTop + 'px'
        });
        
        updateClipPath();
    });

    // Handle mouse up
    $(document).on('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            $rectangle.removeClass('dragging');
        }
    });

    // Touch events for mobile
    $rectangle.on('touchstart', function(e) {
        isDragging = true;
        $rectangle.addClass('dragging');
        containerRect = $container[0].getBoundingClientRect();
        
        const touch = e.originalEvent.touches[0];
        const rect = $rectangle[0].getBoundingClientRect();
        startX = touch.clientX;
        startY = touch.clientY;
        initialLeft = rect.left - containerRect.left;
        initialTop = rect.top - containerRect.top;
        
        e.preventDefault();
    });

    $(document).on('touchmove', function(e) {
        if (!isDragging) return;
        
        const touch = e.originalEvent.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;
        
        const rect = $rectangle[0].getBoundingClientRect();
        const maxLeft = containerRect.width - rect.width;
        const maxTop = containerRect.height - rect.height;
        
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        
        $rectangle.css({
            left: newLeft + 'px',
            top: newTop + 'px'
        });
        
        updateClipPath();
        e.preventDefault();
    });

    $(document).on('touchend', function() {
        if (isDragging) {
            isDragging = false;
            $rectangle.removeClass('dragging');
        }
    });

    // Initial clip-path update
    // Wait for images to load
    $(window).on('load', function() {
        updateClipPath();
    });
    
    // Also update immediately in case images are already loaded
    setTimeout(updateClipPath, 100);
    
    // Update on window resize
    $(window).on('resize', function() {
        updateClipPath();
    });
}
