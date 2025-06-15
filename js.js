const API_KEY = "c2875c7d3cd43746816e4cd3a19ceb35";
const image_path = "https://image.tmdb.org/t/p/w1280";
const input = document.querySelector(".search input");
const btn = document.querySelector(".search button");
const mainGridTitle = document.querySelector(".favorites h1");
const mainGrid = document.querySelector(".favorites .movies-grid");
const popupContainer = document.querySelector(".popup-container");
const trendingEl = document.querySelector(".trending .movies-grid");
function addClickEffectToCard(cards) {
  cards.forEach((card) => {
    card.addEventListener("click", () => showPopup(card));
  });
}
async function getMoviebySearch(search_term) {
  const resp = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${search_term}`
  );
  const respData = await resp.json();
  return respData.results;
}
btn.addEventListener("click", addSearhedMoviesToDom);
async function addSearhedMoviesToDom() {
  const data = await getMoviebySearch(input.value);
  mainGridTitle.innerHTML = "Search Results...";
  mainGrid.innerHTML = data
    .map((e) => {
      return ` <div class="card" data-id="${e.id}">
            <div class="img">
              <img src="${image_path + e.poster_path}" alt="movie" />
            </div>
            <div class="info">
              <h2>${e.title}</h2>
              <div class="single-info">
                <span>Rate:</span>
                <span>${e.vote_average}</span>
              </div>
              <div class="single-info">
                <span>Release Date:</span>
                <span>${e.release_date}</span>
              </div>
            </div>
          </div>
 `;
    })
    .join("");
  const cards = document.querySelectorAll(".card");
  addClickEffectToCard(cards);
}
async function getMoviebyID(id) {
  const resp = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
  );
  const respData = await resp.json();
  return respData;
}
async function getMovieTrailer(id) {
  const resp = await fetch(
    `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`
  );
  const respData = await resp.json();
  return respData.results[0].key;
}
async function getMovieActors(id) {
  const resp = await fetch(
    `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`
  );
  const respData = await resp.json();
  return respData.cast.slice(0, 5);
}
async function showPopup(card) {
  popupContainer.classList.add("show-popup");
  const movieID = card.getAttribute("data-id");
  const movie = await getMoviebyID(movieID);
  const movieTrailer = await getMovieTrailer(movieID);
  const actors = await getMovieActors(movieID);
  popupContainer.style.background = `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1)),
    url(${image_path + movie.poster_path})`;
  popupContainer.innerHTML = `<span class="x">&#10006;</span>
      <div class="content">
        <div class="left">
          <div class="poster-img">
            <img src="${image_path + movie.poster_path}" alt="movie" />
          </div>
          <div class="single-info">
            <span>Add to favorites:</span>
            <span class="heart-icon">&#9829;</span>
          </div>
        </div>
        <div class="right">
          <h1>${movie.title}</h1>
          <h3>${movie.tagline}</h3>
          <div class="single-info-container">
            <div class="single-info">
              <span>Language:</span>
              <span>${movie.spoken_languages[0].name}</span>
            </div>
            <div class="single-info">
              <span>Lenght:</span>
              <span>${movie.runtime}</span>
            </div>
            <div class="single-info">
              <span>Rate:</span>
              <span>${movie.vote_average}</span>
            </div>
            <div class="single-info">
              <span>Budget:</span>
              <span>${movie.budget} $</span>
            </div>
            <div class="single-info">
              <span>Release Date:</span>
              <span>${movie.release_date}</span>
            </div>
          </div>
          <div class="genres">
            <h2>Genres</h2>
            <ul>
              ${movie.genres.map((e) => `<li>${e.name}</li>`).join("")}
            </ul>
          </div>
           <div class="actors">
            <h2>Actors</h2>
            <ul>
              ${actors.map((e) => `<li>${e.name}</li>`).join("")}
            </ul>
          </div>
          <div class="overview">
            <h2>Overview</h2>
            <p>
            ${movie.overview}
            </p>
          </div>
          <div class="trailer">
            <h2>Trailer</h2>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${movieTrailer}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          </div>
        </div>
      </div>`;
  const XIcon = document.querySelector(".x");
  XIcon.addEventListener("click", () =>
    popupContainer.classList.remove("show-popup")
  );
  const heartIcon = popupContainer.querySelector(".heart-icon");
  heartIcon.addEventListener("click", () => {
    if (heartIcon.classList.contains("change-color")) {
      removeLs(movieID);
      heartIcon.classList.remove("change-color");
    } else {
      addToLs(movieID);
      heartIcon.classList.add("change-color");
    }
    fetchFavoritesMovies();
  });
  const favoriteMovies = getLS();
  if (favoriteMovies.includes(movieID)) {
    heartIcon.classList.add("change-color");
  } else {
    heartIcon.classList.remove("change-color");
  }
}
function getLS() {
  const movieIds = JSON.parse(localStorage.getItem("movie-id"));
  return movieIds === null ? [] : movieIds;
}
function addToLs(id) {
  const movieIds = getLS();
  localStorage.setItem("movie-id", JSON.stringify([...movieIds, id]));
}
function removeLs(id) {
  const movieIds = getLS();
  localStorage.setItem(
    "movie-id",
    JSON.stringify(movieIds.filter((e) => e !== id))
  );
}
fetchFavoritesMovies();
async function fetchFavoritesMovies() {
  mainGrid.innerHTML = "";
  const moviesLS = await getLS();
  const movies = [];
  for (let i = 0; i <= moviesLS.length - 1; i++) {
    const movieId = moviesLS[i];
    let movie = await getMoviebyID(movieId);
    addFavToDomFromLS(movie);
    movies.push(movie);
  }
}
function addFavToDomFromLS(movieData) {
  mainGrid.innerHTML += `<div class="card" data-id="${movieData.id}">
            <div class="img">
              <img src="${image_path + movieData.poster_path}" alt="movie" />
            </div>
            <div class="info">
              <h2>${movieData.title}</h2>
              <div class="single-info">
                <span>Rate:</span>
                <span>${movieData.vote_average}</span>
              </div>
              <div class="single-info">
                <span>Release Date:</span>
                <span>${movieData.release_date}</span>
              </div>
            </div>
          </div>`;
  const cards = document.querySelectorAll(".card");
  addClickEffectToCard(cards);
}
async function getTrendingMovies() {
  const resp = await fetch(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`
  );
  const respData = await resp.json();
  return respData.results;
}

async function addToDomTrending() {
  const data = await getTrendingMovies();
  trendingEl.innerHTML = data
    .slice(0, 5)
    .map((e) => {
      return `<div class="card" data-id="${e.id}">
            <div class="img">
              <img src="${image_path + e.poster_path}" alt="movie" />
            </div>
            <div class="info">
              <h2>${e.title}</h2>
              <div class="single-info">
                <span>Rate:</span>
                <span>${e.vote_average}</span>
              </div>
              <div class="single-info">
                <span>Release Date:</span>
                <span>${e.release_date}</span>
              </div>
            </div>
          </div>`;
    })
    .join("");
  const cards = document.querySelectorAll(".card");
  addClickEffectToCard(cards);
}
addToDomTrending();
async function getGenres() {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      renderGenres(data.genres);
    } else {
      console.error("Greška pri učitavanju žanrova:", data);
    }
  } catch (error) {
    console.error("Greška pri fetchovanju žanrova:", error);
  }
}
function renderGenres(genres) {
  const genresContainer = document.getElementById("genres-container");
  genresContainer.innerHTML = "";
  genres.forEach((genre) => {
    const button = document.createElement("button");
    button.textContent = genre.name;
    button.onclick = () => fetchMoviesByGenre(genre.id);
    genresContainer.appendChild(button);
  });
}
async function fetchMoviesByGenre(genreId) {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      renderMovies(data.results);
    } else {
      console.error("Greška pri učitavanju filmova:", data);
    }
  } catch (error) {
    console.error("Greška pri fetchovanju filmova:", error);
  }
}
function renderMovies(movies) {
  const moviesContainer = document.getElementById("movies-container");
  moviesContainer.innerHTML = "";
  if (movies.length === 0) {
    moviesContainer.innerHTML = "<p>Nema filmova za ovaj žanr.</p>";
    return;
  }
  mainGrid.innerHTML = movies
    .map((e) => {
      return `
    <div class="card" data-id="${e.id}">
    <div class="img">
      <img src="${image_path + e.poster_path}" alt="movie" />
    </div>
    <div class="info">
      <h2>${e.title}</h2>
      <div class="single-info">
        <span>Rate:</span>
        <span>${e.vote_average}</span>
      </div>
      <div class="single-info">
        <span>Release Date:</span>
        <span>${e.release_date}</span>
      </div>
    </div>
  </div>`;
    })
    .join("");
  const cards = document.querySelectorAll(".card");
  addClickEffectToCard(cards);
  document.querySelector(".favorites h1").innerHTML = "";
}
window.onload = () => {
  getGenres();
};
