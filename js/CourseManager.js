/**
 * Clase CourseManager - Gestiona el flujo del curso y la navegación
 */
class CourseManager {
    constructor(config) {
        this.videos = [];
        this.currentIndex = 0;
        this.videoPlayer = null;
        this.supportedFormats = ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov', 'wmv', 'flv'];
        this.browserCompatibleFormats = ['mp4', 'webm', 'ogg'];
        
        // Elementos del DOM
        this.elements = {
            uploadSection: document.getElementById(config.uploadSectionId),
            videosContainer: document.getElementById(config.videosContainerId),
            finalMessage: document.getElementById(config.finalMessageId),
            currentStep: document.getElementById(config.currentStepId),
            totalSteps: document.getElementById(config.totalStepsId),
            videoTitle: document.getElementById(config.videoTitleId),
            prevBtn: document.getElementById(config.prevBtnId),
            nextBtn: document.getElementById(config.nextBtnId),
            progressFill: document.getElementById(config.progressFillId),
            videoInput: document.getElementById(config.videoInputId),
            currentVideo: document.getElementById(config.currentVideoId),
            uploadNote: document.getElementById('uploadNote'),
            compatibilityNote: document.getElementById('compatibilityNote'),
            certificateContainer: document.getElementById('certificateContainer'),
            certificateDate: document.getElementById('certificateDate')
        };
        
        this.init();
    }

    /**
     * Inicializa el CourseManager
     */
    init() {
        this.videoPlayer = new VideoPlayer(this.elements.currentVideo);
        this.setupEventListeners();
        this.checkBrowserSupport();
        this.setCurrentDate();
    }

    /**
     * Establece la fecha actual en el certificado
     */
    setCurrentDate() {
        if (this.elements.certificateDate) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const today = new Date().toLocaleDateString('es-ES', options);
            this.elements.certificateDate.textContent = today;
        }
    }

    /**
     * Verifica el soporte del navegador para formatos de video
     */
    checkBrowserSupport() {
        const video = document.createElement('video');
        const supportInfo = [];
        
        if (video.canPlayType('video/mp4').replace(/no/, '')) {
            supportInfo.push('MP4');
        }
        if (video.canPlayType('video/webm').replace(/no/, '')) {
            supportInfo.push('WebM');
        }
        if (video.canPlayType('video/ogg').replace(/no/, '')) {
            supportInfo.push('Ogg');
        }
        
        // Nota sobre MKV
        if (this.elements.uploadNote) {
            this.elements.uploadNote.textContent = `Tu navegador soporta nativamente: ${supportInfo.join(', ')}. ` +
                `Los archivos MKV pueden funcionar en algunos navegadores modernos.`;
        }
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        this.elements.videoInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.elements.prevBtn.addEventListener('click', () => this.previousStep());
        this.elements.nextBtn.addEventListener('click', () => this.nextStep());
        
        // Limpiar recursos al cerrar la página
        window.addEventListener('beforeunload', () => this.dispose());
    }

    /**
     * Obtiene la extensión del archivo
     * @param {string} filename - Nombre del archivo
     * @returns {string} Extensión del archivo
     */
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    /**
     * Verifica si el formato es compatible
     * @param {string} extension - Extensión del archivo
     * @returns {boolean} Si es compatible o no
     */
    isFormatSupported(extension) {
        return this.supportedFormats.includes(extension);
    }

    /**
     * Maneja la carga de archivos
     * @param {Event} event - Evento de cambio del input
     */
    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;
        
        let incompatibleFiles = [];
        let warningFiles = [];
        
        this.videos = files.filter(file => {
            const extension = this.getFileExtension(file.name);
            
            if (!this.isFormatSupported(extension)) {
                incompatibleFiles.push(file.name);
                return false;
            }
            
            if (!this.browserCompatibleFormats.includes(extension)) {
                warningFiles.push(file.name);
            }
            
            return true;
        }).map((file, index) => ({
            file: file,
            url: URL.createObjectURL(file),
            title: `Momento ${index + 1}`,
            name: file.name,
            extension: this.getFileExtension(file.name)
        }));
        
        // Mostrar advertencias
        if (incompatibleFiles.length > 0) {
            alert(`Los siguientes archivos no son compatibles y fueron omitidos:\n${incompatibleFiles.join('\n')}`);
        }
        
        if (warningFiles.length > 0) {
            this.showCompatibilityWarning(warningFiles);
        }
        
        if (this.videos.length > 0) {
            this.startCourse();
        } else {
            alert('No se seleccionaron archivos de video válidos.');
        }
    }

    /**
     * Muestra una advertencia de compatibilidad
     * @param {Array} files - Archivos con posibles problemas de compatibilidad
     */
    showCompatibilityWarning(files) {
        if (this.elements.compatibilityNote) {
            this.elements.compatibilityNote.innerHTML = `
                <strong>Nota:</strong> Los siguientes archivos podrían no reproducirse correctamente en todos los navegadores: 
                ${files.join(', ')}. Se recomienda usar Chrome o Edge para mejor compatibilidad con MKV.
            `;
            this.elements.compatibilityNote.classList.add('show');
        }
    }

    /**
     * Inicia el curso
     */
    startCourse() {
        this.elements.totalSteps.textContent = this.videos.length;
        this.showSection('videos');
        this.loadVideo(0);
    }

    /**
     * Carga un video por índice
     * @param {number} index - Índice del video
     */
    loadVideo(index) {
        if (index < 0 || index >= this.videos.length) {
            throw new Error('Índice de video fuera de rango');
        }
        
        this.currentIndex = index;
        const video = this.videos[index];
        
        // Cargar video
        this.videoPlayer.loadVideo(video);
        
        // Actualizar UI
        this.updateUI();
        
        // Manejar errores de carga
        this.elements.currentVideo.onerror = () => {
            alert(`No se pudo cargar el video: ${video.name}. ` +
                  `Intenta con un formato diferente o usa Chrome/Edge para archivos MKV.`);
        };
    }

    /**
     * Actualiza la interfaz de usuario
     */
    updateUI() {
        // Actualizar indicadores
        this.elements.currentStep.textContent = this.currentIndex + 1;
        this.elements.videoTitle.textContent = this.videos[this.currentIndex].title;
        
        // Actualizar botones
        this.elements.prevBtn.disabled = this.currentIndex === 0;
        
        if (this.currentIndex === this.videos.length - 1) {
            this.elements.nextBtn.textContent = 'Finalizar 💜';
        } else {
            this.elements.nextBtn.textContent = 'Siguiente →';
        }
        
        // Actualizar barra de progreso
        this.updateProgress();
    }

    /**
     * Actualiza la barra de progreso
     */
    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.videos.length) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
    }

    /**
     * Navega al siguiente paso
     */
    nextStep() {
        if (this.currentIndex < this.videos.length - 1) {
            this.loadVideo(this.currentIndex + 1);
        } else {
            this.finishCourse();
        }
    }

    /**
     * Navega al paso anterior
     */
    previousStep() {
        if (this.currentIndex > 0) {
            this.loadVideo(this.currentIndex - 1);
        }
    }

    /**
     * Finaliza el curso y muestra el mensaje final
     */
    finishCourse() {
        this.showSection('final');
        this.videoPlayer.stop();
    }

    /**
     * Muestra el certificado
     */
    showCertificate() {
        if (this.elements.certificateContainer) {
            this.elements.certificateContainer.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Oculta el certificado
     */
    hideCertificate() {
        if (this.elements.certificateContainer) {
            this.elements.certificateContainer.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Descarga el certificado como imagen
     */
    async downloadCertificate() {
        try {
            const certificate = document.getElementById('certificate');
            
            // Usar html2canvas para capturar el certificado
            const canvas = await html2canvas(certificate, {
                scale: 2,
                backgroundColor: '#ffffff'
            });
            
            // Convertir a imagen y descargar
            const link = document.createElement('a');
            link.download = 'Certificado_de_Amor_Leticia_Diaz.png';
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Error al descargar el certificado:', error);
            alert('Hubo un error al descargar el certificado. Por favor, toma una captura de pantalla.');
        }
    }

    /**
     * Muestra una sección específica
     * @param {string} section - Sección a mostrar ('upload', 'videos', 'final')
     */
    showSection(section) {
        // Ocultar todas las secciones
        this.elements.uploadSection.style.display = 'none';
        this.elements.videosContainer.style.display = 'none';
        this.elements.finalMessage.style.display = 'none';
        
        // Mostrar la sección solicitada
        switch (section) {
            case 'upload':
                this.elements.uploadSection.style.display = 'block';
                break;
            case 'videos':
                this.elements.videosContainer.style.display = 'block';
                break;
            case 'final':
                this.elements.finalMessage.style.display = 'block';
                break;
        }
    }

    /**
     * Libera todos los recursos
     */
    dispose() {
        // Liberar URLs de videos
        this.videos.forEach(video => {
            if (video.url) {
                URL.revokeObjectURL(video.url);
            }
        });
        
        // Limpiar reproductor
        if (this.videoPlayer) {
            this.videoPlayer.dispose();
        }
        
        this.videos = [];
        this.currentIndex = 0;
    }

    /**
     * Obtiene estadísticas del curso
     * @returns {Object} Estadísticas del curso
     */
    getStats() {
        return {
            totalVideos: this.videos.length,
            currentVideo: this.currentIndex + 1,
            progress: ((this.currentIndex + 1) / this.videos.length) * 100,
            isCompleted: this.currentIndex === this.videos.length - 1
        };
    }
}