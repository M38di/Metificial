let selectedModel = '';
let selectedAspectRatio = '';
let randomSeed = false;

function toggleDropdown(dropdownId, element) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.classList.toggle('show');
    const icon = element.querySelector('.icon');
    icon.style.transform = dropdown.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}


function selectModel(modelUrl, modelName) {
    selectedModel = modelUrl;
    document.getElementById('selectedModel').innerText = modelName;
    toggleDropdown('modelDropdown');
}

function selectAspectRatio(aspectRatio) {
    selectedAspectRatio = aspectRatio;
    document.getElementById('selectedAspectRatio').innerText = aspectRatio;
    toggleDropdown('aspectRatioDropdown');
}

let useRandomSeed = false;

function toggleRandomSeed() {
    const randomSeedIcon = document.getElementById('randomSeedIcon');
    const seedInput = document.getElementById('seedInput');
    
    useRandomSeed = !useRandomSeed; // Toggle the state

    if (useRandomSeed) {
        randomSeedIcon.classList.remove('fa-square');
        randomSeedIcon.classList.add('fa-check-square');

        const randomSeed = Math.floor(Math.random() * (2 ** 32));
        seedInput.value = randomSeed; // Set the input field to the random seed
        seedInput.disabled = true; // Disable input if random seed is checked
    } else {
        randomSeedIcon.classList.remove('fa-check-square');
        randomSeedIcon.classList.add('fa-square');
        seedInput.disabled = false; // Enable the seed input if random seed is unchecked
    }
}

async function generateImage() {
    const prompt = document.getElementById('promptInput').value;
    const seedInput = document.getElementById('seedInput').value;
    const loadingIcon = document.getElementById('loadingIcon');
    const generatedImage = document.getElementById('generatedImage');
    const downloadButton = document.getElementById('downloadButton'); // Reference to download button

    if (!prompt) {
        alert("Please enter a prompt!");
        return;
    }

    loadingIcon.style.display = 'block';
    generatedImage.style.display = 'none';

    let width, height;
    switch (selectedAspectRatio) {
        case '16:9':
            width = 1920;
            height = 1080;
            break;
        case '9:16':
            width = 1080;
            height = 1920;
            break;
        case '4:3':
            width = 1024;
            height = 768;
            break;
        case '3:4':
            width = 768;
            height = 1024;
            break;
        default: // Default to 1:1
            width = 512;
            height = 512;
    }

    const response = await fetch(selectedModel, { 
        method: 'POST',
        headers: {
            'Authorization': 'Bearer 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', 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            "inputs": prompt, 
            "parameters": { "width": width, "height": height },
            "options": { "seed": randomSeed ? null : seedInput }
        })
    });

    if (!response.ok) {
        alert("Failed to generate image. Response status: " + response.status);
        loadingIcon.style.display = 'none'; // Hide loading icon
        downloadButton.disabled = true; // Disable download button on error
        return;
    }

    const blob = await response.blob(); // Convert response to a Blob
    const url = URL.createObjectURL(blob); // Create a URL for the Blob
    loadingIcon.style.display = 'none'; // Hide loading icon
    generatedImage.src = url; // Set image source to the Blob URL
    generatedImage.style.display = 'block'; // Show generated image
    downloadButton.disabled = false; // Enable download button after image generation
}

function downloadImage() {
    const generatedImage = document.getElementById('generatedImage');
    const imageUrl = generatedImage.src; // Get the source URL of the generated image

    if (!imageUrl) {
        alert("No image to download!");
        return;
    }

    const link = document.createElement('a');
    link.href = imageUrl; // Set the href to the image URL
    link.download = 'generated-image.png'; // Set the desired file name for the download

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
}


window.onclick = function(event) {
    if (!event.target.matches('.dropdown-toggle')) {
        const dropdowns = document.getElementsByClassName('dropdown-menu');
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}