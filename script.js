// Cursor animation implementation
document.addEventListener('DOMContentLoaded', function() {
    // Ensure all images are visible
    const images = document.querySelectorAll('.power-feature-image, .early-access-image, .team-member img, .power-feature-image-holder img');
    images.forEach(img => {
        // Remove any inline styles that might be hiding the image
        img.removeAttribute('style');
        // Set visibility properties
        img.style.opacity = '1';
        img.style.visibility = 'visible';
        img.style.transform = 'none';
        img.style.animation = 'none';
        // Add a class to ensure visibility persists
        img.classList.add('force-visible');
        
        // Ensure parent containers are also visible
        const holder = img.closest('.power-feature-image-holder');
        if (holder) {
            holder.style.opacity = '1';
            holder.style.visibility = 'visible';
            holder.style.overflow = 'visible';
        }
        
        const container = img.closest('.power-feature-card-container');
        if (container) {
            container.style.opacity = '1';
            container.style.visibility = 'visible';
        }
    });

    // Run again after a short delay to ensure styles are applied
    setTimeout(() => {
        images.forEach(img => {
            img.style.opacity = '1';
            img.style.visibility = 'visible';
            img.style.transform = 'none';
            img.style.animation = 'none';
            img.classList.add('force-visible');
        });
    }, 100);

    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    // Create canvas for cursor trail
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99997';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Cursor trail settings
    const settings = {
        friction: 0.5,
        trails: 20,
        size: 40,
        dampening: 0.2,
        tension: 0.98
    };
    
    let cursorPosition = { x: 0, y: 0 };
    let running = true;
    
    // Create cursor arrow icon
    const cursorIcon = document.createElement('div');
    cursorIcon.style.position = 'fixed';
    cursorIcon.style.pointerEvents = 'none';
    cursorIcon.style.zIndex = '10001';
    cursorIcon.style.width = '20px';
    cursorIcon.style.height = '20px';
    cursorIcon.style.backgroundImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23394AFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"></path><path d=\"M12 5l7 7-7 7\"></path></svg>')";
    cursorIcon.style.backgroundSize = 'contain';
    cursorIcon.style.backgroundRepeat = 'no-repeat';
    cursorIcon.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(cursorIcon);
    
    class Node {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.vy = 0;
            this.vx = 0;
        }
    }
    
    class Line {
        constructor(spring) {
            this.spring = spring + 0.1 * Math.random() - 0.05;
            this.friction = settings.friction + 0.01 * Math.random() - 0.005;
            this.nodes = [];
            
            for (let i = 0; i < settings.size; i++) {
                const node = new Node();
                node.x = cursorPosition.x;
                node.y = cursorPosition.y;
                this.nodes.push(node);
            }
        }
        
        update() {
            let spring = this.spring;
            let node = this.nodes[0];
            
            node.vx += (cursorPosition.x - node.x) * spring;
            node.vy += (cursorPosition.y - node.y) * spring;
            
            for (let i = 0; i < this.nodes.length; i++) {
                node = this.nodes[i];
                
                if (i > 0) {
                    const prevNode = this.nodes[i - 1];
                    node.vx += (prevNode.x - node.x) * spring;
                    node.vy += (prevNode.y - node.y) * spring;
                    node.vx += prevNode.vx * settings.dampening;
                    node.vy += prevNode.vy * settings.dampening;
                }
                
                node.vx *= this.friction;
                node.vy *= this.friction;
                node.x += node.vx;
                node.y += node.vy;
                spring *= settings.tension;
            }
        }
        
        draw() {
            let x, y;
            let startX = this.nodes[0].x;
            let startY = this.nodes[0].y;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            for (let i = 1; i < this.nodes.length - 2; i++) {
                const node = this.nodes[i];
                const nextNode = this.nodes[i + 1];
                x = 0.5 * (node.x + nextNode.x);
                y = 0.5 * (node.y + nextNode.y);
                ctx.quadraticCurveTo(node.x, node.y, x, y);
            }
            
            const lastNode = this.nodes[this.nodes.length - 2];
            const endNode = this.nodes[this.nodes.length - 1];
            ctx.quadraticCurveTo(lastNode.x, lastNode.y, endNode.x, endNode.y);
            ctx.stroke();
            ctx.closePath();
        }
    }
    
    let lines = [];
    
    function render() {
        if (running) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = '#394AFF';
            ctx.lineWidth = 1;
            
            for (let i = 0; i < settings.trails; i++) {
                if (lines[i]) {
                    lines[i].update();
                    lines[i].draw();
                }
            }
            
            requestAnimationFrame(render);
        }
    }
    
    function onMouseMove(e) {
        cursorPosition.x = e.clientX;
        cursorPosition.y = e.clientY;
        
        // Update cursor position
        if (cursor) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        }
        if (cursorFollower) {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }
        
        // Hide the default cursor
        document.body.style.cursor = 'none';
    }
    
    function init() {
        // Create lines
        lines = [];
        for (let i = 0; i < settings.trails; i++) {
            lines.push(new Line(0.45 + (i / settings.trails) * 0.025));
        }
        
        // Add event listeners
        document.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onResize);
        window.addEventListener('focus', startAnimation);
        window.addEventListener('blur', stopAnimation);
        
        // Start animation
        render();
        
        // Make sure cursor elements don't block clicks
        if (cursor) {
            cursor.style.display = 'none';
            cursor.style.pointerEvents = 'none';
        }
        if (cursorFollower) {
            cursorFollower.style.display = 'none';
            cursorFollower.style.pointerEvents = 'none';
        }
        
        // Ensure all links and buttons are clickable
        const clickableElements = document.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"]');
        clickableElements.forEach(element => {
            element.style.position = 'relative';
            element.style.zIndex = '10000';
            
            // Change cursor icon on hover for better UX
            element.addEventListener('mouseenter', () => {
                cursorIcon.style.backgroundImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23394AFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 3h6v6\"></path><path d=\"M10 14L21 3\"></path><path d=\"M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6\"></path></svg>')";
            });
            
            element.addEventListener('mouseleave', () => {
                cursorIcon.style.backgroundImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23394AFF\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"></path><path d=\"M12 5l7 7-7 7\"></path></svg>')";
            });
        });
    }
    
    function onResize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    
    function startAnimation() {
        if (!running) {
            running = true;
            render();
        }
    }
    
    function stopAnimation() {
        running = false;
    }
    
    // Mobile menu toggle
    const menuButton = document.querySelector('.menu-button');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuButton && navMenu) {
        menuButton.addEventListener('click', function() {
            navMenu.classList.toggle('w--open');
            menuButton.classList.toggle('w--open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !menuButton.contains(event.target)) {
                navMenu.classList.remove('w--open');
                menuButton.classList.remove('w--open');
            }
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('w--open');
                menuButton.classList.remove('w--open');
            });
        });
    }
    
    // Initialize
    init();

    // Run on resize
    window.addEventListener('resize', function() {
        const teamImages = document.querySelectorAll('.power-feature-image');
        teamImages.forEach(img => {
            img.style.opacity = '1';
            img.style.visibility = 'visible';
            img.style.transform = 'none';
            img.classList.add('force-visible');
            
            // Ensure parent containers are also visible
            const holder = img.closest('.power-feature-image-holder');
            if (holder) {
                holder.style.opacity = '1';
                holder.style.visibility = 'visible';
                holder.style.overflow = 'visible';
            }
            
            const container = img.closest('.power-feature-card-container');
            if (container) {
                container.style.opacity = '1';
                container.style.visibility = 'visible';
            }
        });
    });

    // Run on orientation change (for mobile)
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            const teamImages = document.querySelectorAll('.power-feature-image');
            teamImages.forEach(img => {
                img.style.opacity = '1';
                img.style.visibility = 'visible';
                img.style.transform = 'none';
                img.classList.add('force-visible');
                
                // Ensure parent containers are also visible
                const holder = img.closest('.power-feature-image-holder');
                if (holder) {
                    holder.style.opacity = '1';
                    holder.style.visibility = 'visible';
                    holder.style.overflow = 'visible';
                }
                
                const container = img.closest('.power-feature-card-container');
                if (container) {
                    container.style.opacity = '1';
                    container.style.visibility = 'visible';
                }
            });
        }, 100);
    });
});
