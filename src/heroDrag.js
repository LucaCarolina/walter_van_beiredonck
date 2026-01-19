// Hero section draggable rectangle reveal interaction
// Uses jQuery as per project requirements

export function initHeroDrag() {
    const $ = window.jQuery;
    
    if (!$) {
        console.error('jQuery is required for hero drag interaction');
        return;
    }

    const $rectangle = $('#revealRectangle');
    const $jesterImage = $('.jester-image'); 
    const $container = $('.hero-image-container');
    
    if (!$rectangle.length || !$jesterImage.length || !$container.length) {
        return;
    }

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    
    // Bounds for constraining the drag
    let dragBounds = {
        minLeft: 0,
        maxLeft: 0,
        minTop: 0,
        maxTop: 0
    };
    
    // Update clip-path on Jester image to MATCH rectangle area
    // The calculation must be relative to the IMAGE, not the container
    function updateClipPath() {
        const rect = $rectangle[0].getBoundingClientRect();
        const imgRect = $jesterImage[0].getBoundingClientRect();
        
        // Calculate the rectangle's position relative to the image
        const top = rect.top - imgRect.top;
        const left = rect.left - imgRect.left;
        const right = imgRect.width - (left + rect.width);
        const bottom = imgRect.height - (top + rect.height);
        
        const clipValue = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
        
        $jesterImage.css({
            'clip-path': clipValue,
            '-webkit-clip-path': clipValue
        });
    }

    function updateDragBounds() {
        const containerRect = $container[0].getBoundingClientRect();
        const imgRect = $jesterImage[0].getBoundingClientRect();
        const rectWidth = $rectangle.outerWidth();
        const rectHeight = $rectangle.outerHeight();

        // Calculate bounds relative to container
        // We want the rectangle to stay INSIDE the image
        dragBounds.minLeft = imgRect.left - containerRect.left;
        dragBounds.minTop = imgRect.top - containerRect.top;
        dragBounds.maxLeft = dragBounds.minLeft + imgRect.width - rectWidth;
        dragBounds.maxTop = dragBounds.minTop + imgRect.height - rectHeight;
    }

    // Desktop: hover-follow interaction (no drag)
    $container.on('mousemove', function(e) {
        const containerRect = $container[0].getBoundingClientRect();
        const imgRect = $jesterImage[0].getBoundingClientRect();
        const rectWidth = $rectangle.outerWidth();
        const rectHeight = $rectangle.outerHeight();

        const isInsideImage =
            e.clientX >= imgRect.left &&
            e.clientX <= imgRect.right &&
            e.clientY >= imgRect.top &&
            e.clientY <= imgRect.bottom;

        if (!isInsideImage) {
            return;
        }

        // Ensure transform is disabled once we start controlling position
        if ($rectangle.css('transform') !== 'none') {
            $rectangle.css('transform', 'none');
        }

        updateDragBounds();

        let newLeft = e.clientX - containerRect.left - rectWidth / 2;
        let newTop = e.clientY - containerRect.top - rectHeight / 2;

        // Constrain to image bounds
        newLeft = Math.max(dragBounds.minLeft, Math.min(newLeft, dragBounds.maxLeft));
        newTop = Math.max(dragBounds.minTop, Math.min(newTop, dragBounds.maxTop));

        $rectangle.css({
            left: newLeft + 'px',
            top: newTop + 'px'
        });

        updateClipPath();
    });

    // Touch events for mobile
    $rectangle.on('touchstart', function(e) {
        isDragging = true;
        $rectangle.addClass('dragging');
        
        const containerRect = $container[0].getBoundingClientRect();
        const touch = e.originalEvent.touches[0];
        const rect = $rectangle[0].getBoundingClientRect();
        
        const currentLeft = rect.left - containerRect.left;
        const currentTop = rect.top - containerRect.top;
        
        $rectangle.css({
            'transform': 'none',
            'left': currentLeft + 'px',
            'top': currentTop + 'px'
        });
        
        updateDragBounds(); // Calculate bounds on start

        startX = touch.clientX;
        startY = touch.clientY;
        initialLeft = currentLeft;
        initialTop = currentTop;
        
        e.preventDefault();
    });

    $(document).on('touchmove', function(e) {
        if (!isDragging) return;
        
        const touch = e.originalEvent.touches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;
        
        // Constrain to image bounds
        newLeft = Math.max(dragBounds.minLeft, Math.min(newLeft, dragBounds.maxLeft));
        newTop = Math.max(dragBounds.minTop, Math.min(newTop, dragBounds.maxTop));
        
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

    function setInitialRectanglePosition() {
        const containerRect = $container[0].getBoundingClientRect();
        const imgRect = $jesterImage[0].getBoundingClientRect();
        const rectWidth = $rectangle.outerWidth();

        updateDragBounds();

        let newLeft = imgRect.left - containerRect.left + (imgRect.width - rectWidth) / 2;
        let newTop = imgRect.top - containerRect.top;

        // Constrain to image bounds to avoid overflow
        newLeft = Math.max(dragBounds.minLeft, Math.min(newLeft, dragBounds.maxLeft));
        newTop = Math.max(dragBounds.minTop, Math.min(newTop, dragBounds.maxTop));

        $rectangle.css({
            left: newLeft + 'px',
            top: newTop + 'px',
            transform: 'none'
        });
    }

    // Initial clip-path update
    function init() {
        setInitialRectanglePosition();
        updateClipPath();
    }

    $(window).on('load resize', init);
    setTimeout(init, 100);
    setTimeout(init, 500);
}