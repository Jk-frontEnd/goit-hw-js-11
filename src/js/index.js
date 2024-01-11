import axios from "axios";
import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.querySelector('form');
const input = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector(".lds-dual-ring");
const loadMoreBtn = document.querySelector('.load-more');

const BASE_URL = 'https://pixabay.com/api/?orientation=horizontal&safesearch=true&image_type=photo';
const KEY = '41687911-62b9e6d772891b12bf67d3c73';

hideLoader();
hideLoadBtn();

form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    clearGallery();
    hideGallery();
    hideLoadBtn();
    showLoader();
    currentPage = 1; 

    try {
        await fetchImages();

        if (totalHits === 0) {
            hideGallery();
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        } else if(totalHits <= 40) { 
            hideLoadBtn();
            showGallery();

        } else {
            showLoadBtn();
            showGallery();
            await Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
    } finally {
        await hideLoader();
    }
});

loadMoreBtn.addEventListener('click', async () => {
    hideLoadBtn();
    await showLoader();
    currentPage++;
    await fetchImages();

    if (currentPage * 40 < totalHits) {
        showLoadBtn();
    } else {
        hideLoadBtn();
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
    await hideLoader();
});

gallery.addEventListener('click', (evt) => {
    const photoCard = evt.target.closest('.photo-card');
    const isImgBoxSet = evt.target.classList.contains('img-box-set');

    if (photoCard || isImgBoxSet) {
        const largeImageURL = photoCard ? photoCard.dataset.largeImage : '';
        const tags = photoCard ? photoCard.querySelector('img').alt : '';

        if (largeImageURL) {
            createModal(largeImageURL, tags);
        } else if (isImgBoxSet) {
            const product = findProduct(evt.target);
            createModal(product);
        }
    }
});

let currentPage = 1;
let totalHits = 0;

async function fetchImages() {
    const searchQuery = input.value;

    const url = `${BASE_URL}&q=${searchQuery}&key=${KEY}&page=${currentPage}&per_page=40`;

    try {
        const response = await axios.get(url);
        const data = response.data.hits;
        totalHits = response.data.totalHits;

        if (data && Array.isArray(data) && data.length > 0) {
            if (currentPage === 1) {
                gallery.innerHTML = createMarkup(data);
            } else {
                gallery.innerHTML += createMarkup(data);
            }

            const lightbox = new SimpleLightbox('.gallery [data-lightbox="gallery"]');
            lightbox.refresh();
        } else {
            hideLoadBtn();
            hideGallery();
        }
    } catch (error) {
        hideLoadBtn();
        console.error('Error fetching images:', error);
    }
}

async function checkTotalHits(totalHits) {
    if (totalHits <= 40) {
        hideLoadBtn(); 
    } else {
        showLoadBtn();
    }
}

function createMarkup(keyword) {
    return keyword
        .map(({ webformatURL, tags, likes, views, comments, downloads, largeImageURL }) => {
            return `
                <div href="${webformatURL}" data-lightbox="gallery" data-title="${tags}">
                    <div class="photo-card">
                        <div class="img-box-set">
                            <a href=${largeImageURL}>
                                <img src="${webformatURL}" alt="${tags}" loading="lazy" width="420px"/>
                            </a>
                        </div>
                        <div class="info">
                            <p class="info-item">
                                <b>Likes</b>
                                ${likes}
                            </p>
                            <p class="info-item">
                                <b>Views</b>
                                ${views}
                            </p>
                            <p class="info-item">
                                <b>Comments</b>
                                ${comments}
                            </p>
                            <p class="info-item">
                                <b>Downloads</b>
                                ${downloads}
                            </p>
                        </div>
                    </div>
                </div>`;
        })
        .join('');
}

function createModal(largeImageURL, tags) {
    try {
        const instance = simpleLightbox.create(`
            <div class="modal">
                <div class="modal-img-box">
                    <img class="modal-img" src="${largeImageURL}" alt="${tags}" />
                </div>
            </div>`);
        instance.show();
    } catch (error) {
        console.error('Error creating modal:', error);
    }
}

function clearGallery() {
    gallery.innerHTML = '';
}

new SimpleLightbox('.gallery a', {
  captions: true,
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

//visibility setting functions

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