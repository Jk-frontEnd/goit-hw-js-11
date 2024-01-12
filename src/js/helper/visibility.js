// load btn visibility
async function hideLoadBtn() {
    loadMoreBtn.classList.add('visually-hidden');
}

async function showLoadBtn() {
    loadMoreBtn.classList.remove('visually-hidden');
}

// gallery btn visibility
async function hideGallery() {
    await gallery.classList.add('visually-hidden');
}

async function showGallery() {
    await gallery.classList.remove('visually-hidden');
}

// loader visibility
async function hideLoader() {
    await loader.classList.add('visually-hidden');
}

async function showLoader() {
    await loader.classList.remove('visually-hidden');
}

export { showLoader, showLoadBtn, showGallery, hideGallery, hideLoader, hideLoadBtn };