const video = document.getElementById('video');
const captureButton = document.getElementById('captureButton');
const photosContainer = document.getElementById('photos');
const stageTitle = document.getElementById('stageTitle');
const stageNavigation = document.getElementById('stageNavigation');
const modalBackground = document.getElementById('modalBackground');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalCloseButton = document.getElementById('modalCloseButton');
const modalSaveButton = document.getElementById('modalSaveButton');
const notCoveredCheckbox = document.getElementById('notCoveredCheckbox');
const additionalOptions = document.getElementById('additionalOptions');
const applyPartsCheckbox = document.getElementById('applyPartsCheckbox');
const applyLaborCheckbox = document.getElementById('applyLaborCheckbox');
const damageLevelSelect = document.getElementById('damageLevel');
const loaderContainer = document.getElementById('loaderContainer');
const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
const deleteModalClose = document.getElementById('deleteModalClose');
const cancelDeleteButton = document.getElementById('cancelDeleteButton');
const confirmDeleteButton = document.getElementById('confirmDeleteButton');
let canvas = new fabric.Canvas('fabricCanvas');

let actualPhotoSrc = {
    nombre: '',
    notCovered: false,
    applyParts: false,
    applyLabor: false,
    damageLevel: 'Leve',
    img: new Image()
};

const stagesConfig = [
    { name: 'Patente Trasera', minPhotos: 1 },
    { name: 'Trasera', minPhotos: 2 },
    { name: 'Lateral Trasero', minPhotos: 2 },
    { name: 'Neumatico Trasero', minPhotos: 1 },
    { name: 'Puerta Trasera', minPhotos: 1 },
    { name: 'Puerta Delantera', minPhotos: 1 },
    { name: 'Costado Delantero', minPhotos: 1 },
    { name: 'Patente Delantera', minPhotos: 1 },
    { name: 'Frontal', minPhotos: 1 },
    { name: 'Capot', minPhotos: 1 },
    { name: 'Parabrisas', minPhotos: 1 },
    { name: 'Neumatico Delantero', minPhotos: 1 },
    { name: 'Costado Delantero', minPhotos: 1 },
    { name: 'Puerta Delantera', minPhotos: 1 },
    { name: 'Puerta Trasera', minPhotos: 1 },
    { name: 'Costado Trasero', minPhotos: 1 },
    { name: 'Panel', minPhotos: 1 },
    { name: 'Kilometraje', minPhotos: 1 },
    { name: 'Palanca de Cambios', minPhotos: 1 },
    { name: 'Asientos', minPhotos: 2 },
    { name: 'Techo Interior', minPhotos: 2 },
    { name: 'Extintor', minPhotos: 1 },
    { name: 'Rueda Repuesto', minPhotos: 1 },
    { name: 'Herramientas', minPhotos: 1 }

];

let photoToDeleteIndex = -1;
let cantidadTMP = 0;
const canvasWidth = window.innerWidth * 0.85;
const canvasHeight = window.innerHeight * 0.85;
let photosByStage = {};
const maxStages = stagesConfig.length;
let currentStage = 0;
let currentImage = null;
let debounceTimeout=0;
let contadorCirculo=0;
let originalDataURL = "";
let width = 0;
let height = 0;

stagesConfig.forEach((stage, index) => {
    photosByStage[index] = [];
});

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 2048 }, height: { ideal: 1080 } } })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing the camera', error);
    });

captureButton.addEventListener('click', () => {
    processPhoto();
});

function processPhoto() {
    stageTitle.textContent = stagesConfig[currentStage].name + ` (${cantidadTMP + 1}/${stagesConfig[currentStage].minPhotos})`;
    capturePhoto()
        .then(photoData => {
            if (!photosByStage[currentStage]) {
                photosByStage[currentStage] = [];
            }
            photosByStage[currentStage].push(photoData);

            appendPhotoToContainer(photoData, photosByStage[currentStage].length-1);
            updateButtons();
        });
}

function capturePhoto() {
    cantidadTMP+=1;
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const photoData = {
            nombre: stagesConfig[currentStage].name + (new Date().getTime()),
            notCovered: false,
            applyParts: false,
            applyLabor: false,
            damageLevel: 'Leve',
            img: canvas.toDataURL('image/png')
        };

        resolve(photoData);
    });
}

function appendPhotoToContainer(photoData, index) {
    requestIdleCallback(() => {
        const photoContainer = document.createElement('div');
        photoContainer.classList.add('photoContainer');

        const img = document.createElement('img');
        img.src = photoData.img;
        img.classList.add('photo');
        img.addEventListener('click', () => {
            openModal(photoData);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('deleteButton');
        deleteButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm3 3h12v12c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V9zm3 0v12h6V9H9zm1 0v10h2V9h-2zm4 0v10h2V9h-2zm1-5h-6l-1-1H5v2h14V3h-3l-1 1z"/></svg>';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePhoto(index);
        });

        photoContainer.appendChild(img);
        photoContainer.appendChild(deleteButton);
        photosContainer.appendChild(photoContainer);
    });
}

function updatePhotosContainer() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        photosContainer.innerHTML = '';
        photosByStage[currentStage].forEach((photoData, index) => {
            appendPhotoToContainer(photoData, index);
        });
    }, 50);  
}

function showDeleteConfirmationModal(index) {
    photoToDeleteIndex = index;
    modalBackground.style.display = 'block';
    deleteConfirmationModal.style.display = 'block';
}

function hideDeleteConfirmationModal() {
    modalBackground.style.display = 'none';
    deleteConfirmationModal.style.display = 'none';
    photoToDeleteIndex = -1;
}

cancelDeleteButton.addEventListener('click', hideDeleteConfirmationModal);

confirmDeleteButton.addEventListener('click', () => {
    if (photoToDeleteIndex !== -1) {
        photosByStage[currentStage].splice(photoToDeleteIndex, 1);
        stageTitle.textContent = stagesConfig[currentStage].name + ` (${photosByStage[currentStage].length}/${stagesConfig[currentStage].minPhotos})`;
        updatePhotosContainer();
        updateButtons();
    }
    hideDeleteConfirmationModal();
});

function deletePhoto(index) {
    showDeleteConfirmationModal(index);
}

function openModal(photoSrc) {
    console.log(photoSrc)
    actualPhotoSrc = photoSrc;
    modalBackground.style.display = 'block';
    modal.style.display = 'block';
    const currentImage = new Image();
    currentImage.src = photoSrc.img;

    currentImage.onload = () => {
        originalDataURL = photoSrc.img;
        width = currentImage.width;
        height = currentImage.height;
        contadorCirculo = 0;
        const imgInstance = new fabric.Image(currentImage, {
            left: 0,
            top: 0,
            scaleX: canvasWidth / width,
            scaleY: canvasHeight / height,
            selectable: false
        });
        canvas.clear();
        canvas.setWidth(canvasWidth);
        canvas.setHeight((canvasHeight));
        canvas.add(imgInstance);
        canvas.renderAll();
        const photoNumber = photosByStage[currentStage].indexOf(photoSrc);
        notCoveredCheckbox.checked = photosByStage[currentStage][photoNumber].notCovered;
        additionalOptions.style.display = notCoveredCheckbox.checked ? 'block' : 'none';
        applyPartsCheckbox.checked = photosByStage[currentStage][photoNumber].applyParts;
        applyLaborCheckbox.checked = photosByStage[currentStage][photoNumber].applyLabor;
        damageLevelSelect.value = photosByStage[currentStage][photoNumber].damageLevel;
    }
}

modalSaveButton.addEventListener('click', () => {
    const photoNumber = photosByStage[currentStage].indexOf(actualPhotoSrc);

    photosByStage[currentStage][photoNumber].notCovered = notCoveredCheckbox.checked;
    photosByStage[currentStage][photoNumber].applyParts = applyPartsCheckbox.checked;
    photosByStage[currentStage][photoNumber].applyLabor = applyLaborCheckbox.checked;
    photosByStage[currentStage][photoNumber].damageLevel = damageLevelSelect.value;
    const photoTMP = photosByStage[currentStage][photoNumber];

    if (contadorCirculo > 0) {
        const canvasImage = new Image();
        canvasImage.src = canvas.toDataURL('image/png');

        canvasImage.onload = () => {
            const originalCanvas = document.createElement('canvas');
            originalCanvas.width = width;
            originalCanvas.height = height;
            const originalContext = originalCanvas.getContext('2d');
            originalContext.drawImage(canvasImage, 0, 0, canvas.width, canvas.height, 0, 0, originalCanvas.width, originalCanvas.height);
            const editedImageDataURL = originalCanvas.toDataURL('image/png');

            const photoDataTMP = {
                nombre: photoTMP.nombre + "_edited",
                notCovered: photoTMP.notCovered,
                applyParts: photoTMP.applyParts,
                applyLabor: photoTMP.applyLabor,
                damageLevel: photoTMP.damageLevel,
                img: editedImageDataURL
            };

            photosByStage[currentStage].push(photoDataTMP);
            stageTitle.textContent = stagesConfig[currentStage].name + ` (${photosByStage[currentStage].length}/${stagesConfig[currentStage].minPhotos})`;
            appendPhotoToContainer(photoDataTMP, photosByStage[currentStage].length - 1);
            updateButtons();
            updatePhotosContainer();
        };

        canvasImage.onerror = (error) => {
            console.error("Error al cargar la imagen del canvas:", error);
        };
    }

    modalBackground.style.display = 'none';
    modal.style.display = 'none';
    canvas.clear();
});

notCoveredCheckbox.addEventListener('change', () => {
    if (notCoveredCheckbox.checked) {
        additionalOptions.style.display = 'block';
    } else {
        additionalOptions.style.display = 'none';
        applyPartsCheckbox.checked=false;
        applyLaborCheckbox.checked=false;
        damageLevelSelect.value='Leve';
    }
});

modalClose.addEventListener('click', () => {
    canvas.clear();
    modalBackground.style.display = 'none';
    modal.style.display = 'none';
});

modalCloseButton.addEventListener('click', () => {
    canvas.clear();
    modalBackground.style.display = 'none';
    modal.style.display = 'none';
});

document.getElementById('addCircleButton').addEventListener('click', function() {
    const circle = new fabric.Circle({
        radius: 50,
        stroke: 'red',
        strokeWidth: 2,
        fill: "#00000000",
        left: 100,
        top: 100,
        selectable: true
    });
    contadorCirculo++;
    canvas.add(circle);
});

function updateButtons() {
    const currentStageConfig = stagesConfig[currentStage];
    const hasEnoughPhotos = photosByStage[currentStage].length >= currentStageConfig.minPhotos;

    if (currentStage < maxStages - 1) {
        const nextStageButton = document.getElementById(`stageButton${currentStage + 1}`);
        if (nextStageButton) {
            nextStageButton.disabled = !hasEnoughPhotos;
        }
    }

    if (hasEnoughPhotos && currentStage < maxStages - 1) {
        createStageButton(currentStage + 1);
    }
}

function createStageButton(stage) {
    if (!photosByStage[stage]) {
        photosByStage[stage] = [];
    }

    if (!document.getElementById(`stageButton${stage}`)) {
        const stageButton = document.createElement('button');
        stageButton.id = `stageButton${stage}`;
        stageButton.textContent = stagesConfig[stage].name;
        stageButton.classList.add('stageButton');
        stageButton.classList.add('btn');
        stageButton.disabled = currentStage < stage && photosByStage[currentStage].length < stagesConfig[currentStage].minPhotos;
        stageButton.addEventListener('click', () => {
            currentStage = stage;
            cantidadTMP = photosByStage[currentStage].length;
            stageTitle.textContent = stagesConfig[currentStage].name + ` (${photosByStage[currentStage].length}/${stagesConfig[currentStage].minPhotos})`;
            updatePhotosContainer();
            highlightCurrentStageButton();
        });
        stageNavigation.appendChild(stageButton);
    }

    highlightCurrentStageButton();
}

function highlightCurrentStageButton() {
    const buttons = document.querySelectorAll('.stageButton');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    const currentButton = document.getElementById(`stageButton${currentStage}`);
    if (currentButton) {
        currentButton.classList.add('active');
    }
}

stagesConfig.forEach((stage, index) => {
    if (index === 0) {
        stageTitle.textContent = stagesConfig[index].name + ` (${photosByStage[index].length}/${stagesConfig[index].minPhotos})`;
    }
    createStageButton(index);
});

document.getElementById('deleteObjectButton').addEventListener('click', () => {
    deleteSelectedObject();
});

function deleteSelectedObject() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        contadorCirculo--;
        canvas.remove(activeObject);
        canvas.renderAll();
    }
}
