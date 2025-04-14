'use strict';

// WebRTC Configuration
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceTransportPolicy: 'all'
};

// Media Constraints
const defaultVideoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
    facingMode: { ideal: 'user' },
    aspectRatio: { ideal: 16/9 }
};

const defaultAudioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,
    sampleRate: 48000
};

// WebRTC Utilities
class WebRTCUtils {
    static async createPeerConnection(peerId, onTrack, onConnectionStateChange, onIceConnectionStateChange) {
        const peerConnection = new RTCPeerConnection(rtcConfig);

        // Set up event handlers
        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state for peer ${peerId}:`, peerConnection.connectionState);
            if (onConnectionStateChange) {
                onConnectionStateChange(peerConnection.connectionState);
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            console.log(`ICE connection state for peer ${peerId}:`, peerConnection.iceConnectionState);
            if (onIceConnectionStateChange) {
                onIceConnectionStateChange(peerConnection.iceConnectionState);
            }
        };

        peerConnection.ontrack = (event) => {
            if (onTrack) {
                onTrack(event);
            }
        };

        return peerConnection;
    }

    static async getMediaStream(video = true, audio = true, constraints = {}) {
        const mediaConstraints = {
            video: video ? { ...defaultVideoConstraints, ...constraints.video } : false,
            audio: audio ? { ...defaultAudioConstraints, ...constraints.audio } : false
        };

        try {
            return await navigator.mediaDevices.getUserMedia(mediaConstraints);
        } catch (err) {
            console.warn('Failed to get media with specified constraints, trying fallback:', err);
            // Try fallback with basic constraints
            return await navigator.mediaDevices.getUserMedia({
                video: video ? { width: 640, height: 480 } : false,
                audio: audio ? { echoCancellation: true } : false
            });
        }
    }

    static async createOffer(peerConnection) {
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            return offer;
        } catch (err) {
            console.error('Error creating offer:', err);
            throw err;
        }
    }

    static async createAnswer(peerConnection) {
        try {
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            return answer;
        } catch (err) {
            console.error('Error creating answer:', err);
            throw err;
        }
    }

    static async setRemoteDescription(peerConnection, description) {
        try {
            await peerConnection.setRemoteDescription(description);
        } catch (err) {
            console.error('Error setting remote description:', err);
            throw err;
        }
    }

    static async addIceCandidate(peerConnection, candidate) {
        try {
            await peerConnection.addIceCandidate(candidate);
        } catch (err) {
            console.error('Error adding ICE candidate:', err);
            throw err;
        }
    }

    static async recoverConnection(peerConnection, peerId, onTrack) {
        try {
            console.log(`Attempting to recover connection for peer ${peerId}`);
            
            // Close existing connection
            peerConnection.close();
            
            // Create new connection
            const newConnection = await this.createPeerConnection(peerId, onTrack);
            
            // Re-establish media streams
            if (localVideoMediaStream) {
                localVideoMediaStream.getTracks().forEach(track => {
                    newConnection.addTrack(track, localVideoMediaStream);
                });
            }
            
            return newConnection;
        } catch (err) {
            console.error('Error recovering connection:', err);
            throw err;
        }
    }

    static async recoverIceConnection(peerConnection) {
        try {
            console.log('Attempting to recover ICE connection');
            
            // Restart ICE
            await peerConnection.restartIce();
            
            // Create and send new offer
            return await this.createOffer(peerConnection);
        } catch (err) {
            console.error('Error recovering ICE connection:', err);
            throw err;
        }
    }
}

// Export utilities
window.WebRTCUtils = WebRTCUtils;
window.rtcConfig = rtcConfig;
window.defaultVideoConstraints = defaultVideoConstraints;
window.defaultAudioConstraints = defaultAudioConstraints; 