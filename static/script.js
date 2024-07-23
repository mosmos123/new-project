document.getElementById('reclamation-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche l'envoi du formulaire normal

    const form = event.target;
    const formData = new FormData(form);

    fetch(form.action, {
        method: form.method,
        body: new URLSearchParams(formData)
    })
    .then(response => response.json())
    .then(data => {
        const notification = document.getElementById('notification');
        if (data.error) {
            notification.innerText = data.error;
            notification.className = 'notification error show';
        } else {
            notification.innerText = data.message;
            notification.className = 'notification show';
            form.reset(); // Réinitialise le formulaire après l'envoi réussi
        }
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000); // Cache la notification après 3 secondes
    })
    .catch(error => {
        console.error('Erreur:', error);
        const notification = document.getElementById('notification');
        notification.innerText = 'Une erreur est survenue lors de l\'envoi du formulaire.';
        notification.className = 'notification error show';
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000); // Cache la notification après 3 secondes
    });
});