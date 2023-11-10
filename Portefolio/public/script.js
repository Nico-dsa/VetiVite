document.getElementById('imageUpload').addEventListener('change', function(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('profileImage').src = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
});

// Vous pouvez ajouter ici des fonctions pour gérer les objets à vendre, vendus et achetés.

function editField(fieldId) {
    var field = document.getElementById(fieldId);
    field.disabled = false; // Rendre le champ modifiable
    field.focus(); // Mettre le focus sur le champ
  }
  
  // Optionnel: Vous pouvez également ajouter un écouteur d'événement pour le bouton de mise à jour
  document.getElementById('updateProfile').addEventListener('click', function() {
    // Ici, vous pourriez valider et soumettre les données mises à jour
    var inputs = document.querySelectorAll('.profile-info input');
    inputs.forEach(function(input) {
      input.disabled = true; // Désactiver à nouveau les champs après la mise à jour
    });
  });
