// Fonction pour convertir la date au format YYYY-MM-DD pour l'envoi au serveur
function formatDateForServer(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}

// Fonction pour formater la date pour affichage (jour mois année)
function formatDateForDisplay(date) {
    const d = new Date(date);
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return d.toLocaleDateString('fr-FR', options);
}

// Fonction pour charger les réclamations et les afficher dans la table
function loadReclamations() {
    fetch('/reclamations')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('reclamations-table-body');
            tableBody.innerHTML = '';

            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.id}</td>
                    <td>${row.nom_client}</td>
                    <td>${formatDateForDisplay(row.date)}</td>
                    <td>${row.tel}</td>
                    <td>${row.email}</td>
                    <td>${row.type_formulaire}</td>
                    <td>${row.objet}</td>
                    <td>${row.statut}</td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Erreur:', error));
}

// Charger les réclamations lorsque le DOM est prêt
document.addEventListener('DOMContentLoaded', loadReclamations);

// Formulaire de soumission
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const dateField = document.querySelector('#date');
    const formattedDate = formatDateForServer(dateField.value);

    const formData = new FormData(this);
    formData.set('date', formattedDate);

    fetch('/reclamations', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Réponse du serveur:', data);
        loadReclamations(); // Recharger les réclamations après ajout
    })
    .catch(error => console.error('Erreur:', error));
});
