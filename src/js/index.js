import axios from "axios";
import Notiflix from "notiflix";
import * as basicLightbox from 'basiclightbox';
import 'basiclightbox/dist/basiclightbox.min.css';


const form = document.querySelector('form');
const input = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector(".lds-dual-ring");
const loadMoreBtn = document.querySelector('.load-more');

const BASE_URL = 'https://pixabay.com/api/?orientation=horizontal&safesearch=true&image_type=photo';
const KEY = '41687911-62b9e6d772891b12bf67d3c73';

hideLoader();
form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    hideGallery();
    hideLoadBtn();
    await showLoader();
    currentPage = 1; 
    await fetchImages();
    showGallery();
    showLoadBtn();
    await Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`)
    await hideLoader();
});

loadMoreBtn.addEventListener('click', async () => {
    currentPage++;
    showLoader();
    await fetchImages();
    showLoadBtn();
    await hideLoader()
});

gallery.addEventListener('click', (evt) => {
    const photoCard = evt.target.closest('.photo-card');
    if (photoCard) {
        const largeImageURL = photoCard.dataset.largeImage;
        const tags = photoCard.querySelector('img').alt;

        if (largeImageURL) {
            createModal(largeImageURL, tags);
        }
    }
    
    if (evt.target.classList.contains('photo-card') || evt.target.classList.contains('img-box-set')) {
      const product = findProduct(evt.target);
      createModal(product);
    }
});

function createMarkup(keyword) {
    return keyword
        .map(({ webformatURL, tags, likes, views, comments, downloads }) => {
            return `
                <div class="photo-card">
                    <div class="img-box-set">
                        <img src="${webformatURL}" alt="${tags}" loading="lazy" width="420px"/>
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
                </div>`;
        })
        .join('');
}

function createModal(largeImageURL, tags) {
    const instance = basicLightbox.create(`
        <div class="modal">
            <div class="modal-img-box">
                <img class="modal-img" src="${largeImageURL}" alt="${tags}" />
            </div>
        </div>`);
    instance.show();
}

//load btn visibility
async function hideLoadBtn() {
    await loadMoreBtn.classList.add('visually-hidden');
}

async function showLoadBtn() {
    await loadMoreBtn.classList.remove('visually-hidden');
}

//gallery btn visibility
async function hideGallery() {
    await gallery.classList.add('visually-hidden');
}

async function showGallery() {
    await gallery.classList.remove('visually-hidden');
}


//loader visibility
async function hideLoader() {
    await loader.classList.add('visually-hidden');
}

async function showLoader() {
    await loader.classList.remove('visually-hidden');
}

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

            if (currentPage * 40 < totalHits) {
               loadMoreBtn.style.display = 'flex';
            } else {
                hideLoadBtn();;
                //loadMoreBtn.style.display = 'none';
            }
        } else {
            hideLoadBtn();;
            console.error('Invalid data format:', data);
            Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
        }

    } catch (error) {
        console.error('Error fetching images:', error);
        Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
    }
}
