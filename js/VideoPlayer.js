/**
 * Clase VideoPlayer - Maneja la reproducción de videos individuales
 */
class VideoPlayer {
    constructor(videoElement) {
        this.videoElement = videoElement;
        this.currentVideoData = null;
    }

    /**
     * Carga un video en el reproductor
     * @param {Object} videoData - Datos del video (url, title)
     */
    loadVideo(videoData) {
        if (!videoData || !videoData.url) {
            throw new Error('Datos de video inválidos');
        }
        
        this.currentVideoData = videoData;
        this.videoElement.src = videoData.url;
        this.videoElement.load();
    }

    /**
     * Reproduce el video actual
     */
    play() {
        return this.videoElement.play();
    }

    /**
     * Pausa el video actual
     */
    pause() {
        this.videoElement.pause();
    }

    /**
     * Detiene el video y resetea el tiempo
     */
    stop() {
        this.pause();
        this.videoElement.currentTime = 0;
    }

    /**
     * Obtiene información del video actual
     * @returns {Object} Información del video
     */
    getCurrentVideoInfo() {
        return {
            ...this.currentVideoData,
            duration: this.videoElement.duration,
            currentTime: this.videoElement.currentTime,
            paused: this.videoElement.paused
        };
    }

    /**
     * Libera recursos del video actual
     */
    dispose() {
        if (this.currentVideoData && this.currentVideoData.url) {
            URL.revokeObjectURL(this.currentVideoData.url);
        }
        this.videoElement.src = '';
        this.currentVideoData = null;
    }
}