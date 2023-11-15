let userData;
let currentIndex = 0;
let articles = [];
let wishlistItems = [];

function fetchAndStoreWishlist() {
  fetch("/wishlist")
    .then(response => response.json())
    .then(data => {
      wishlistItems = data.map(item => item.id); // Stocke seulement les ID des articles
    })
    .catch(error => console.error("Erreur lors de la récupération de la wishlist:", error));
}

// Met à jour la carte avec les informations de l'article courant
function updateCard() {
  // Trouver le prochain article qui n'est pas dans la wishlist
  let foundAvailableArticle = false;
  let originalIndex = currentIndex;
  do {
    if (!wishlistItems.includes(articles[currentIndex].id)) {
      foundAvailableArticle = true;
      break; // Un article disponible a été trouvé
    }
    currentIndex = (currentIndex + 1) % articles.length;
  } while (currentIndex !== originalIndex); // Continue jusqu'à ce que nous ayons fait une boucle complète

  if (foundAvailableArticle) {
    // Afficher l'article trouvé
    const article = articles[currentIndex];
    const card = document.getElementById("card");
    card.querySelector("img").src = `uploads/${article.img}`;
    card.querySelector("img").alt = article.name;
    card.querySelector("h2").textContent = article.name;
    card.querySelector('.price').textContent = `${article.price}€`;
    card.querySelector(".brand").textContent = `Marque: ${article.brand}`;
  } else {
    // Tous les articles sont dans la wishlist, afficher une alerte
    alert("Tous les articles ont été ajoutés à la wishlist.");
    // Vous pouvez également choisir de cacher la carte ou de désactiver les interactions
    const card = document.getElementById("card");
    card.style.display = "none"; // Cache la carte
  }
}

//Configure les événements sur la carte
function setupCardEvents() {
  const card = document.getElementById("card");
  const heartIcon = card.querySelector(".icon.fas.fa-heart");
  heartIcon.onclick = swipeRight;
}


function loadProfileForm() {
  $('.nav-btn').hide();
  $('#sideContainer').hide();
  $('.profil-container').show();
  updateFooterButtonLabel('profil');

  fetchUserData()
    .then(userData => {

      $('#lastName').val(userData.name);
      $('#firstName').val(userData.first_name);
      $('#email').val(userData.mail);
      $('#age').val(userData.age);
      $('#sexe').val(userData.sexe);
      $('#address').val(userData.address);
      $('#ville').val(userData.city);
      $('#codePostal').val(userData.zip);
      $('#pays').val(userData.country);

      $.ajax({
        url: 'profil-formulaire.html',
        method: 'GET',
        success: function (data) {

          $('.profil-container').html(data);

          $('.profil-container #lastName').val(userData.name);
          $('.profil-container #firstName').val(userData.first_name);
          $('.profil-container #email').val(userData.mail);
          $('.profil-container #age').val(userData.age);
          $('.profil-container #sexe').val(userData.sexe);
          $('.profil-container #address').val(userData.address);
          $('.profil-container #ville').val(userData.city);
          $('.profil-container #codePostal').val(userData.zip);
          $('.profil-container #pays').val(userData.country);
        },
        error: function (error) {
          console.error('Erreur lors du chargement du formulaire de profil:', error);
        }
      });
    })
    .catch(error => {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    });
}

function activateAcheteur() {
  $('.profil-container').hide();
  $('.nav-btn').show();
  $('.sellerBoutons').hide();
  $('.buyerBoutons').show();
  $('#sideContainer').show();
  updateFooterButtonLabel('acheteur');
  onWishlistBtnClick();
}

function activateVendeur() {
  $('.profil-container').hide();
  $('.nav-btn').show();
  $('.buyerBoutons').hide();
  $('.sellerBoutons').show();
  $('#sideContainer').show();
  updateFooterButtonLabel('vendeur');
  onOnSaleBtnClick();
}

function onAcheteurBtnClick() {
  activateAcheteur();
  onWishlistBtnClick(); // Afficher la Wishlist par défaut
}

function onVendeurBtnClick() {
  activateVendeur();
  onOnSaleBtnClick(); // Afficher les articles "En vente..." par défaut
}

function onOnSaleBtnClick() {
  $('#onsaleContainer').show();
  $('#soldContainer').hide();
  $('#wishlistContainer').hide();
  $('#cartContainer').hide();
  fetchOnSale();
  $('#onsaleBtn').addClass('active-btn');
  $('#soldBtn').removeClass('active-btn');
}

function onSoldBtnClick() {
  $('#soldContainer').show();
  $('#onsaleContainer').hide();
  $('#wishlistContainer').hide();
  $('#cartContainer').hide();
  fetchSold();
  $('#soldBtn').addClass('active-btn');
  $('#onsaleBtn').removeClass('active-btn');
}

// Gestionnaires d'événements pour les boutons Wishlist et Panier
function onWishlistBtnClick() {
  $('#wishlistContainer').show();
  $('#cartContainer').hide();
  $('#soldContainer').hide();
  $('#onsaleContainer').hide();
  fetchWishlist();
  $('#wishlistBtn').addClass('active-btn');
  $('#panierBtn').removeClass('active-btn');
}

function onPanierBtnClick() {
  $('#cartContainer').show();
  $('#wishlistContainer').hide();
  $('#soldContainer').hide();
  $('#onsaleContainer').hide();
  fetchCart();
  $('#panierBtn').addClass('active-btn');
  $('#wishlistBtn').removeClass('active-btn');
}

// Fonction pour récupérer les données utilisateur
function fetchUserData() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/user-data',
      method: 'GET',
      success: function (data) {
        resolve(data);
      },
      error: function (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        reject(error);
      }
    });
  });
}

// Récupération des données des articles, wishlist et panier
function fetchArticles() {
  fetch("/articles")
    .then(response => response.json())
    .then(data => {
      articles = data;
      updateCard();
      setupCardEvents();
    })
    .catch(error => console.error("Erreur lors de la récupération des articles:", error));
}

function fetchOnSale() {
  console.log("Fetching on sale articles...");
  fetch("/on-sale")
    .then(response => response.json())
    .then(data => {
      console.log("Data received for on sale articles:", data);
      const onsaleContainer = $("#onsaleContainer").empty();
      data.forEach(article => onsaleContainer.append(createArticleHtml(article)));
    })
    .catch(error => console.error("Error fetching on sale articles:", error));
}

function fetchSold() {
  console.log("Fetching sold articles...");
  fetch("/sold")
    .then(response => response.json())
    .then(data => {
      console.log("Data received for sold articles:", data);
      const soldContainer = $("#soldContainer").empty();
      data.forEach(article => soldContainer.append(createArticleHtml(article)));
    })
    .catch(error => console.error("Error fetching sold articles:", error));
}

function fetchWishlist() {
  fetch("/wishlist")
    .then(response => response.json())
    .then(data => {
      const wishlistContainer = $("#wishlistContainer").empty();
      data.forEach(article => wishlistContainer.append(createArticleHtml(article)));
    })
    .catch(error => console.error("Erreur lors de la récupération de la wishlist:", error));
}

function fetchCart() {
  fetch("/cart")
    .then(response => response.json())
    .then(data => {
      const cartContainer = $("#cartContainer").empty();
      data.forEach(article => cartContainer.append(createArticleHtml(article)));
    })
    .catch(error => console.error("Erreur lors de la récupération du panier:", error));
}

// Crée le HTML pour un article
function createArticleHtml(article) {
  return `
  <div class="article" data-id="${article.id}">
        <img src='/uploads/${article.img}' alt='${article.name}'>
    </div>
  `;
}

// Fonction pour récupérer et afficher les détails de l'article
function fetchArticleDetails(articleId) {
  fetch(`/article-details/${articleId}`)
    .then(response => response.json())
    .then(article => {
      showArticleDetails(article);
    })
    .catch(error => console.error('Error fetching article details:', error));
}

function updateFooterButtonLabel(mode) {
  const footerButton = $('#footerButton');

  switch (mode) {
    case 'profil':
      footerButton.text('Mettre à jour');
      break;
    case 'acheteur':
      footerButton.text('Accéder au panier');
      footerButton.off('click').on('click', onFooterButtonAcheteurClick);
      break;
    case 'vendeur':
      footerButton.text('Vendre un article');
      footerButton.off('click').on('click', onFooterButtonVendeurClick);
      break;
    default:
      footerButton.text('Action par défaut');
  }
}

function onFooterButtonAcheteurClick() {
  onPanierBtnClick();
}

function onFooterButtonVendeurClick() {
  $('#main').load('newarticle.html', function (response, status, xhr) {
    if (status === "error") {
      console.error("Erreur lors du chargement du formulaire de vente:", xhr.statusText);
    }
  });
}

function showArticleDetails(article) {
  $('#articleDetailsModal #detailImage').attr('src', `uploads/${article.img}`);
  $('#articleDetailsModal #detailName').text(article.name);
  $('#articleDetailsModal #detailPrice').text(`${article.price}€`);
  $('#articleDetailsModal #detailDescription').text(article.descr);
  $('#articleDetailsModal #detailCondition').text(article.cond);
  $('#articleDetailsModal #detailColor').text(article.color);
  $('#articleDetailsModal #detailSize').text(article.size);
  const formattedDate = new Date(article.date).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  $('#articleDetailsModal #detailDate').text(formattedDate);
  $('#articleDetailsModal #detailCategorie').text(article.cat);
  $('#articleDetailsModal #detailBrand').text(article.brand);
  $('#articleDetailsModal #addToWishlistButton').off('click').on('click', () => addToWishlist(article.id));
  $('#articleDetailsModal #addToCartButton').off('click').on('click', () => addToCart(article.id));
  $('#articleDetailsModal').show();

  checkIfArticleInCart(article.id, isInCart => {
    const addToCartButton = $('#addToCartButton');
    if (isInCart) {
      addToCartButton.text('Supprimer du Panier');
      addToCartButton.off('click').on('click', () => removeFromCart(article.id));
    } else {
      addToCartButton.text('Ajouter au Panier');
      addToCartButton.off('click').on('click', () => addToCart(article.id));
    }
  });
  checkIfArticleInWishlist(article.id, isInWishlist => {
    const addToWishlistButton = $('#addToWishlistButton');
    if (isInWishlist) {
      addToWishlistButton.text('Supprimer de la wishlist');
      addToWishlistButton.off('click').on('click', () => removeFromWishlist(article.id));
    } else {
      addToWishlistButton.text('Ajouter à la wishlist');
      addToWishlistButton.off('click').on('click', () => addToWishlist(article.id));
    }
  });

  $('#articleDetailsModal').show();
}

// Fonction pour vérifier si l'article est dans le panier
function checkIfArticleInCart(articleId, callback) {
  fetch("/cart")
    .then(response => response.json())
    .then(cartArticles => {
      const isInCart = cartArticles.some(article => article.id === articleId);
      callback(isInCart);
    })
    .catch(error => {
      console.error("Erreur lors de la vérification du panier:", error);
      callback(false);
    });
}

// Fonction pour mettre à jour le boutton wishlist
function updateWishlistButton(articleId) {
  const isInWishlist = wishlistItems.includes(articleId);
  const wishlistButton = $('#addToWishlistButton');

  if (isInWishlist) {
    wishlistButton.text('Supprimer de la Wishlist');
    wishlistButton.off('click').on('click', () => removeFromWishlist(articleId));
  } else {
    wishlistButton.text('Ajouter à la Wishlist');
    wishlistButton.off('click').on('click', () => addToWishlist(articleId));
  }
}

// Fonction pour supprimer un article du panier
function removeFromCart(articleId) {
  console.log(`Tentative de suppression de l'article ID: ${articleId} du panier`);
  fetch("/remove-from-cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId })
  })
    .then(response => response.json())
    .then(data => {
      if (!data.success) throw new Error("Erreur lors de la suppression du panier.");
      fetchCart();
      fetchArticleDetails(articleId);
      // Changez le bouton pour permettre l'ajout après la suppression
      $('#addToCartButton').text('Ajouter au Panier').off('click').on('click', () => addToCart(articleId));
    })
    .catch(error => {
      console.error("Erreur lors de la suppression du panier:", error);
      throw error;
    });
}
// Fonction pour vérifier si l'article est dans la wishlist
function checkIfArticleInWishlist(articleId, callback) {
  fetch("/wishlist")
    .then(response => response.json())
    .then(wishlistArticles => {
      const isInWishlist = wishlistArticles.some(article => article.id === articleId);
      callback(isInWishlist);
    })
    .catch(error => {
      console.error("Erreur lors de la vérification de la wishlist:", error);
      callback(false);
    });
}

// Fonction pour supprimer un article de la wishlist
function removeFromWishlist(articleId) {
  console.log(`Tentative de suppression de l'article ID: ${articleId} de la wishlist`);
  fetch("/remove-from-wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId })
  })
    .then(response => response.json())
    .then(data => {
      if (!data.success) throw new Error("Erreur lors de la suppression de la wishlist.");
      fetchWishlist();
      fetchArticleDetails(articleId);
      updateWishlistButton(articleId);
    })
    .catch(error => {
      console.error("Erreur lors de la suppression de la wishlist:", error);
      throw error;
    });
}

// Ferme le modal de détails de l'article
function closeModal() {
  $('#articleDetailsModal').hide();
}

// Ajoute un article au panier
function addToCart(articleId) {
  console.log(`Tentative d'ajout au panier de l'article ID: ${articleId}`);
  return fetch("/add-to-cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId })
  })
    .then(response => response.json())
    .then(data => {
      if (!data.success) throw new Error("Erreur lors de l'ajout au panier.");
      fetchCart();
      fetchArticleDetails(articleId);
    })
    .catch(error => {
      console.error("Erreur lors de l'ajout au panier:", error);
      throw error;
    });
}

// Ajoute un article à la wishlist
function addToWishlist(articleId) {
  console.log(`Tentative d'ajout à la wishlist de l'article ID: ${articleId}`);
  return fetch("/add-to-wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId })
  })
    .then(response => response.json())
    .then(data => {
      if (!data.success) throw new Error("Erreur lors de l'ajout à la wishlist.");
      wishlistItems.push(articleId);
      fetchWishlist();
      updateWishlistButton(articleId);
    })
    .catch(error => {
      console.error("Erreur lors de l'ajout à la wishlist:", error);
      throw error;
    });
}

// Gère le swipe left
function swipeLeft() {
  const card = document.getElementById("card");
  card.style.transform = "translateX(-100%)";
  setTimeout(() => {
    currentIndex = (currentIndex + 1) % articles.length;
    card.style.transform = "translateX(0)";
    updateCard();
  }, 300);
}

// Gère le swipe right
function swipeRight() {
  const card = document.getElementById("card");
  addToWishlist(articles[currentIndex].id)
    .then(() => {
      card.style.transform = "translateX(100%)";
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % articles.length;
        updateCard();
        card.style.transform = "translateX(0)";
      }, 300);
    })
    .catch(error => console.error('Erreur après addToWishlist dans swipeRight:', error));
}

// Initialise l'application
$(document).ready(() => {
  activateAcheteur();
  fetchAndStoreWishlist();
  fetchUserData();
  fetchArticles();
  fetchWishlist();
  $('#wishlistBtn').click(onWishlistBtnClick);
  $('#panierBtn').click(onPanierBtnClick);
  $('#onsaleBtn').click(onOnSaleBtnClick);
  $('#soldBtn').click(onSoldBtnClick);
});

// Gestionnaire de clic pour les articles de la wishlist
$(document).on('click', '.article', function () {
  const articleId = $(this).data('id');
  fetchArticleDetails(articleId);
});

// Gestionnaire de clic pour fermer le modal
$(document).on('click', '.close', closeModal);