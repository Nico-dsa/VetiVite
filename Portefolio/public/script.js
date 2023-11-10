document.getElementById('imageUpload').addEventListener('change', function(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('profileImage').src = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
});


function editField(fieldId) {
    var field = document.getElementById(fieldId);
    field.disabled = false; // Rendre le champ modifiable
    field.focus(); // Mettre le focus sur le champ
  }
  
  document.getElementById('updateProfile').addEventListener('click', function() {
    var inputs = document.querySelectorAll('.profile-info input');
    inputs.forEach(function(input) {
      input.disabled = true; // Désactiver à nouveau les champs après la mise à jour
    });
  });
