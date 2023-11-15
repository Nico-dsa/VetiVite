// // Fonction appelée lorsque le bouton du pied de page est cliqué en mode "profil"
// $('#updateProfileBtn').on('click', function () {
//     const formData = new FormData();
//     formData.append('nom', $('#lastName').val());
//     formData.append('prenom', $('#firstName').val());
//     formData.append('email', $('#email').val());
//     formData.append('age', $('#age').val());
//     formData.append('sexe', $('#sexe').val());
//     formData.append('address', $('#address').val());
//     formData.append('ville', $('#ville').val());
//     formData.append('codePostal', $('#codePostal').val());
//     formData.append('pays', $('#pays').val());

//     // Envoie des données au serveur
//     $.ajax({
//         url: '/update-profile',
//         method: 'POST',
//         data: formData,
//         success: function (response) {
//             console.log(response); // Handle success
//         },
//         error: function (error) {
//             console.error('Error updating profile:', error);
//         }
//     });
// });