/**
 * Punto de entrada de la aplicación
 * Inicializa el CourseManager cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    // Configuración del CourseManager
    const config = {
        uploadSectionId: 'uploadSection',
        videosContainerId: 'videosContainer',
        finalMessageId: 'finalMessage',
        currentStepId: 'currentStep',
        totalStepsId: 'totalSteps',
        videoTitleId: 'videoTitle',
        prevBtnId: 'prevBtn',
        nextBtnId: 'nextBtn',
        progressFillId: 'progressFill',
        videoInputId: 'videoInput',
        currentVideoId: 'currentVideo'
    };
    
    // Crear instancia del CourseManager
    const courseManager = new CourseManager(config);
    
    // Exponer el courseManager globalmente para debugging (opcional)
    window.courseManager = courseManager;
    
    console.log('Mini Curso Romántico inicializado 💜');
});