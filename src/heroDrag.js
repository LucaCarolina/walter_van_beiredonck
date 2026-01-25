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
    // clip-path inset() is relative to the ELEMENT bounds, not rendered image content
    function updateClipPath() {
        const rect = $rectangle[0].getBoundingClientRect();
        const imgRect = $jesterImage[0].getBoundingClientRect(); // element bounds
        
        // Calculate inset values relative to the element's bounding box
        const top = rect.top - imgRect.top;
        const left = rect.left - imgRect.left;
        const right = imgRect.right - rect.right;
        const bottom = imgRect.bottom - rect.bottom;
        
        // Ensure no negative values (would expand instead of clip)
        const clipValue = `inset(${Math.max(0, top)}px ${Math.max(0, right)}px ${Math.max(0, bottom)}px ${Math.max(0, left)}px)`;
        
        $jesterImage.css({
            'clip-path': clipValue,
            '-webkit-clip-path': clipValue
        });
    }

    // Calculate the actual rendered image bounds (accounting for object-fit: contain)
    function getRenderedImageBounds(imgElement) {
        const imgRect = imgElement.getBoundingClientRect();
        const naturalWidth = imgElement.naturalWidth;
        const naturalHeight = imgElement.naturalHeight;
        
        if (!naturalWidth || !naturalHeight) {
            return imgRect; // Fallback to element bounds
        }
        
        const elementWidth = imgRect.width;
        const elementHeight = imgRect.height;
        
        // Calculate the actual rendered size with object-fit: contain
        const elementAspect = elementWidth / elementHeight;
        const imageAspect = naturalWidth / naturalHeight;
        
        let renderedWidth, renderedHeight;
        
        if (imageAspect > elementAspect) {
            // Image is wider - width is constrained
            renderedWidth = elementWidth;
            renderedHeight = elementWidth / imageAspect;
        } else {
            // Image is taller - height is constrained
            renderedHeight = elementHeight;
            renderedWidth = elementHeight * imageAspect;
        }
        
        // Calculate offset (image is centered)
        const offsetX = (elementWidth - renderedWidth) / 2;
        const offsetY = (elementHeight - renderedHeight) / 2;
        
        return {
            left: imgRect.left + offsetX,
            top: imgRect.top + offsetY,
            right: imgRect.left + offsetX + renderedWidth,
            bottom: imgRect.top + offsetY + renderedHeight,
            width: renderedWidth,
            height: renderedHeight
        };
    }

    function updateDragBounds() {
        const containerRect = $container[0].getBoundingClientRect();
        const imgBounds = getRenderedImageBounds($jesterImage[0]);
        const rectWidth = $rectangle.outerWidth();
        const rectHeight = $rectangle.outerHeight();

        // Fallback if image hasn't loaded properly yet
        if (imgBounds.width === 0 || imgBounds.height === 0) {
            // Use container as fallback bounds
            dragBounds.minLeft = 0;
            dragBounds.minTop = 0;
            dragBounds.maxLeft = containerRect.width - rectWidth;
            dragBounds.maxTop = containerRect.height - rectHeight;
            return;
        }

        // Calculate bounds relative to container
        // We want the rectangle to stay INSIDE the actual rendered image
        dragBounds.minLeft = imgBounds.left - containerRect.left;
        dragBounds.minTop = imgBounds.top - containerRect.top;
        dragBounds.maxLeft = dragBounds.minLeft + imgBounds.width - rectWidth;
        dragBounds.maxTop = dragBounds.minTop + imgBounds.height - rectHeight;
        
        // Ensure max is not less than min (in case rectangle is larger than image)
        if (dragBounds.maxLeft < dragBounds.minLeft) {
            dragBounds.maxLeft = dragBounds.minLeft;
        }
        if (dragBounds.maxTop < dragBounds.minTop) {
            dragBounds.maxTop = dragBounds.minTop;
        }
    }

    // Desktop: hover-follow interaction (no drag)
    $container.on('mousemove', function(e) {
        const containerRect = $container[0].getBoundingClientRect();
        const imgBounds = getRenderedImageBounds($jesterImage[0]);
        const rectWidth = $rectangle.outerWidth();
        const rectHeight = $rectangle.outerHeight();

        // Check if cursor is inside the actual rendered image content
        const isInsideImage =
            e.clientX >= imgBounds.left &&
            e.clientX <= imgBounds.left + imgBounds.width &&
            e.clientY >= imgBounds.top &&
            e.clientY <= imgBounds.top + imgBounds.height;

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

    // Touch events for mobile - use native listeners with passive: false
    $rectangle[0].addEventListener('touchstart', function(e) {
        isDragging = true;
        $rectangle.addClass('dragging');
        
        const containerRect = $container[0].getBoundingClientRect();
        const touch = e.touches[0];
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
    }, { passive: false });

    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        // Recalculate bounds on every move to ensure accuracy
        updateDragBounds();
        
        const touch = e.touches[0];
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
    }, { passive: false });

    document.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            $rectangle.removeClass('dragging');
        }
    });

    function setInitialRectanglePosition() {
        const containerRect = $container[0].getBoundingClientRect();
        const imgBounds = getRenderedImageBounds($jesterImage[0]);
        const rectWidth = $rectangle.outerWidth();
        const rectHeight = $rectangle.outerHeight();

        updateDragBounds();

        // Center the rectangle horizontally, position at TOP of the image
        let newLeft = imgBounds.left - containerRect.left + (imgBounds.width - rectWidth) / 2;
        let newTop = imgBounds.top - containerRect.top; // Start at top of image

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

    // Wait for the hero image to actually load before initializing
    function waitForImageLoad() {
        const img = $jesterImage[0];
        const baseImg = $('.hero-image-base')[0];
        
        // Check if images are loaded
        function checkImagesLoaded() {
            const jesterLoaded = img.complete && img.naturalHeight !== 0;
            const baseLoaded = baseImg.complete && baseImg.naturalHeight !== 0;
            return jesterLoaded && baseLoaded;
        }
        
        if (checkImagesLoaded()) {
            // Images already loaded
            init();
        } else {
            // Wait for images to load
            let loadCount = 0;
            const onLoad = () => {
                loadCount++;
                if (loadCount >= 2 || checkImagesLoaded()) {
                    init();
                }
            };
            
            $(img).on('load', onLoad);
            $(baseImg).on('load', onLoad);
            
            // Fallback timeout
            setTimeout(init, 1000);
        }
    }

    $(window).on('load', waitForImageLoad);
    $(window).on('resize', init);
    
    // Also recalculate on orientation change (mobile)
    $(window).on('orientationchange', function() {
        setTimeout(init, 100);
    });
    
    // Initial attempt after short delay
    setTimeout(waitForImageLoad, 100);
}