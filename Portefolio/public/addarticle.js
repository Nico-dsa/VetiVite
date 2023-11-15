document.addEventListener('DOMContentLoaded', function () {
  const submitButton = document.querySelector('.submit-button');
  if (submitButton) {
    submitButton.addEventListener('click', function (event) {
      event.preventDefault(); // Empêche l'envoi classique du formulaire
      const formData = new FormData();
      formData.append('product-image', document.querySelector('#product-image').files[0]);
      formData.append('name', document.querySelector('#product-name').value);
      formData.append('brand', document.querySelector('#product-brand').value);
      formData.append('descr', document.querySelector('#product-description').value);
      formData.append('cat', document.querySelector('#product-categorie').value);
      formData.append('size', document.querySelector('#product-size').value);
      formData.append('cond', document.querySelector('#product-condition').value);
      formData.append('price', document.querySelector('#product-price').value);
      formData.append('color', document.querySelector('#product-color').value);
      formData.append('status', 'disponible');

      console.log(formData);
      fetch('/add-article', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
        })
        .catch(error => {
          console.error('Erreur lors de l\'ajout de l\'article:', error);
        });
    });
  } else {
    console.error("Le bouton de soumission n'a pas été trouvé dans le DOM.");
  }
});
