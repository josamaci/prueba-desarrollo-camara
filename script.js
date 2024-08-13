const video = document.getElementById('video');
const captureButton = document.getElementById('captureButton');
const photosContainer = document.getElementById('photos');
const stageTitle = document.getElementById('stageTitle');
const stageNavigation = document.getElementById('stageNavigation');

const modalBackground = document.getElementById('modalBackground');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
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
let photoToDeleteIndex = -1;

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

let photosByStage = {};
const maxStages = stagesConfig.length;
let currentStage = 0;

stagesConfig.forEach((stage, index) => {
    photosByStage[index] = [];
});

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 4096 }, height: { ideal: 2160 } } })
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
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.classList.add('photo');
    const tmpFile = {
        nombre: photosByStage[currentStage].name + (new Date().getTime()),
        notCovered: false,
        applyParts: false,
        applyLabor: false,
        damageLevel: 'Leve',
        img: img.src
    };

    if (!photosByStage[currentStage]) {
        photosByStage[currentStage] = [];
    }
    photosByStage[currentStage].push(tmpFile);

    updatePhotosContainer();
    updateButtons();
    //saveToLocalStorage();
}

function updatePhotosContainer() {
    stageTitle.textContent = stagesConfig[currentStage].name + ` (${photosByStage[currentStage].length}/${stagesConfig[currentStage].minPhotos})`;
    photosContainer.innerHTML = '';
    photosByStage[currentStage].forEach((photoSrc, index) => {
        const photoContainer = document.createElement('div');
        photoContainer.classList.add('photoContainer');
        const img = document.createElement('img');
        img.src = photoSrc.img;
        img.classList.add('photo');
        img.addEventListener('click', () => {
            openModal(photoSrc);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('deleteButton');
        deleteButton.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M3 6h18v2H3V6zm3 3h12v12c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V9zm3 0v12h6V9H9zm1 0v10h2V9h-2zm4 0v10h2V9h-2zm1-5h-6l-1-1H5v2h14V3h-3l-1 1z"/>
            </svg>`;
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePhoto(index);
        });

        photoContainer.appendChild(img);
        photoContainer.appendChild(deleteButton);
        photosContainer.appendChild(photoContainer);
    });
}

// Función para mostrar el modal de confirmación de eliminación
function showDeleteConfirmationModal(index) {
    photoToDeleteIndex = index;
    modalBackground.style.display = 'block';
    deleteConfirmationModal.style.display = 'block';
}

// Función para ocultar el modal de confirmación de eliminación
function hideDeleteConfirmationModal() {
    modalBackground.style.display = 'none';
    deleteConfirmationModal.style.display = 'none';
    photoToDeleteIndex = -1;
}

cancelDeleteButton.addEventListener('click', hideDeleteConfirmationModal);

confirmDeleteButton.addEventListener('click', () => {
    if (photoToDeleteIndex !== -1) {
        photosByStage[currentStage].splice(photoToDeleteIndex, 1);
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
    modalImage.src = photoSrc.img;
    const photoNumber = photosByStage[currentStage].indexOf(photoSrc);
    notCoveredCheckbox.checked = photosByStage[currentStage][photoNumber].notCovered;
    additionalOptions.style.display = notCoveredCheckbox.checked ? 'block':'none';
    applyPartsCheckbox.checked = photosByStage[currentStage][photoNumber].applyParts;
    applyLaborCheckbox.checked = photosByStage[currentStage][photoNumber].applyLabor;
    damageLevelSelect.value = photosByStage[currentStage][photoNumber].damageLevel; // Default value
    
}

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
    modalBackground.style.display = 'none';
    modal.style.display = 'none';
});

modalCloseButton.addEventListener('click', () => {
    modalBackground.style.display = 'none';
    modal.style.display = 'none';
});

modalSaveButton.addEventListener('click', () => {
    let photoNumber = photosByStage[currentStage].indexOf(actualPhotoSrc)
    photosByStage[currentStage][photoNumber].notCovered = notCoveredCheckbox.checked;
    photosByStage[currentStage][photoNumber].applyParts = applyPartsCheckbox.checked;
    photosByStage[currentStage][photoNumber].applyLabor = applyLaborCheckbox.checked;
    photosByStage[currentStage][photoNumber].damageLevel = damageLevelSelect.value;
    modalBackground.style.display = 'none';
    modal.style.display = 'none';
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
        stageButton.disabled = currentStage < stage && photosByStage[currentStage].length < stagesConfig[currentStage].minPhotos;
        stageButton.addEventListener('click', () => {
            currentStage = stage;
            stageTitle.textContent = stagesConfig[currentStage].name + ` (${photosByStage[currentStage].length}/${stagesConfig[currentStage].minPhotos})`;
            updatePhotosContainer();
            highlightCurrentStageButton();
        });
        stageNavigation.appendChild(stageButton);
    }

    highlightCurrentStageButton();
}

// Highlight the current stage button
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

// Initialize stage navigation
stagesConfig.forEach((stage, index) => {
    if (index === 0) {
        stageTitle.textContent = stagesConfig[index].name + ` (${photosByStage[index].length}/${stagesConfig[index].minPhotos})`;
    }
    createStageButton(index);
});

/*function saveToLocalStorage() {
    localStorage.setItem('photosByStage', JSON.stringify(photosByStage));
    localStorage.setItem('currentStage', currentStage);
}*/

/*function loadStateFromLocalStorage() {
    const savedState = localStorage.getItem('photoAppState');
    if (savedState) {
        const state = JSON.parse(savedState);
        photosByStage = state.photosByStage || {};
        currentStage = state.currentStage || 0;
        stageTitle.textContent = stagesConfig[currentStage].name;
        updatePhotosContainer();
        highlightCurrentStageButton();
    }
}

function loadFromLocalStorage() {
    const storedPhotosByStage = localStorage.getItem('photosByStage');
    const storedCurrentStage = localStorage.getItem('currentStage');

    if (storedPhotosByStage) {
        photosByStage = JSON.parse(storedPhotosByStage);
    } else {
        photosByStage = {};
        stagesConfig.forEach((stage, index) => {
            photosByStage[index] = [];
        });
    }

    if (storedCurrentStage) {
        currentStage = parseInt(storedCurrentStage, 10);
    }
}*/

//loadFromLocalStorage();