'use strict';

class VideoGrid {
    constructor(container) {
        this.container = container;
        this.videos = new Map();
        this.aspectRatio = 16/9;
        this.margin = 5;
        this.minVideoSize = 320;
        this.maxVideoSize = 1920;
    }

    addVideo(peerId, videoElement) {
        this.videos.set(peerId, videoElement);
        this.resize();
    }

    removeVideo(peerId) {
        this.videos.delete(peerId);
        this.resize();
    }

    resize() {
        const containerWidth = this.container.offsetWidth - this.margin * 2;
        const containerHeight = this.container.offsetHeight - this.margin * 2;
        const videoCount = this.videos.size;

        if (videoCount === 0) return;

        // Calculate optimal video size
        let videoSize;
        if (videoCount === 1) {
            // Single video - use larger size
            videoSize = Math.min(
                containerWidth * 0.8,
                containerHeight * 0.8,
                this.maxVideoSize
            );
        } else {
            // Multiple videos - calculate grid
            const columns = Math.ceil(Math.sqrt(videoCount));
            const rows = Math.ceil(videoCount / columns);
            
            videoSize = Math.min(
                (containerWidth - (columns + 1) * this.margin) / columns,
                (containerHeight - (rows + 1) * this.margin) / rows,
                this.maxVideoSize
            );
        }

        // Ensure minimum size
        videoSize = Math.max(videoSize, this.minVideoSize);

        // Apply sizes to videos
        this.videos.forEach((videoElement) => {
            const videoContainer = videoElement.parentElement;
            if (videoContainer) {
                videoContainer.style.width = `${videoSize}px`;
                videoContainer.style.height = `${videoSize * this.aspectRatio}px`;
                videoContainer.style.margin = `${this.margin}px`;
                videoContainer.style.transition = 'all 0.3s ease-in-out';
            }
        });
    }

    setAspectRatio(ratio) {
        this.aspectRatio = ratio;
        this.resize();
    }

    setMargin(margin) {
        this.margin = margin;
        this.resize();
    }

    // Video element optimizations
    optimizeVideoElement(videoElement) {
        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('autoplay', '');
        videoElement.setAttribute('muted', '');
        
        // Add error handling
        videoElement.onerror = (err) => {
            console.error('Video element error:', err);
            videoElement.load();
        };

        // Add loading handling
        videoElement.onloadstart = () => {
            videoElement.classList.add('loading');
        };

        videoElement.oncanplay = () => {
            videoElement.classList.remove('loading');
        };
    }
}

// Export VideoGrid class
window.VideoGrid = VideoGrid; 