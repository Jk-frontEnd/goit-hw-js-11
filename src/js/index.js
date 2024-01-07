import axios from "axios";
import Notiflix from "notiflix";
import * as basicLightbox from 'basiclightbox'

const form = document.querySelector('form');
const input = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const BASE_URL = 'https://pixabay.com/api/?orientation=horizontal&safesearch=true&image_type=photo';
const KEY = '41687911-62b9e6d772891b12bf67d3c73';

form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    currentPage = 1; 
    await fetchImages();
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
});

function createMarkup(keyword) {
    return keyword
        //{ webformatURL, largeImageURL, tags, likes, views, comments, downloads } =>
        .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
        `<div class="photo-card">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
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
        </div>`)
        .join('')
}

function createModal(largeImageURL, tags) {
    const instance = basicLightbox.create(`
        <img src="${largeImageURL}" alt="${tags}"/>
    `);
    instance.show();
}

let currentPage = 1;
let totalHits = 0;

loadMoreBtn.addEventListener('click', async () => {
    currentPage++;
    await fetchImages();
});

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
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        } else {
            console.error('Invalid data format:', data);
            Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
        }
    } catch (error) {
        console.error('Error fetching images:', error);
        Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
    }
}

