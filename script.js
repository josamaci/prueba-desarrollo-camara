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

let actualPhotoSrc = {
    nombre: '',
    notCovered: false,
    applyParts: false,
    applyLabor: false,
    damageLevel: 'Leve',
    img: new Image()
};

const stagesConfig = [
    { name: 'Zona trasera', minPhotos: 2 },
    { name: 'Parte delantera superior derecha', minPhotos: 3 },
    { name: 'otro ejemplo medio largo para prueba', minPhotos: 1 },
    { name: 'Zona trasera', minPhotos: 2 }
];

const photosByStage = {};
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

    function showLoader() {
        loaderContainer.style.display = 'flex';
        console.log(loaderContainer.style.display+" MOSTRAR "+ new Date().getTime())
        captureButton.disabled = true;
    }
    
    function hideLoader() {
        loaderContainer.style.display = 'none';
        console.log(loaderContainer.style.display+" ESCONDER "+ new Date().getTime())
        captureButton.disabled = false;
    }
    
    captureButton.addEventListener('click', async () => {
        try {
            await processPhoto();
        } catch {
            console.error('Error processing photo', error);
        }
    });
    
    //onclick="showLoader()";

    async function processPhoto() {
        return new Promise((resolve, reject) => {
            try {
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
                //setTimeout(() => {hideLoader(); }, 1500);
                resolve();
            } catch (error) {
                //setTimeout(() => {hideLoader(); }, 1500);
                console.error('Error processing photo', error);
                reject(error);
            }
        });
    }

function updatePhotosContainer() {
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

function deletePhoto(index) {
    photosByStage[currentStage].splice(index, 1);
    updatePhotosContainer();
    updateButtons();
}

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
        //stageTitle.textContent = stage.name;
    }
    createStageButton(index);
});
