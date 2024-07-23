const express = require('express'); // Importation du module Express
const mysql = require('mysql'); // Importation du module MySQL
const nodemailer = require('nodemailer'); // Importation du module Nodemailer pour l'envoi d'emails
require('dotenv').config(); // Chargement des variables d'environnement à partir du fichier .env

const app = express(); // Création d'une instance d'Express
const port = process.env.PORT || 5500; // Définition du port du serveur

app.use(express.urlencoded({ extended: true })); // Middleware pour parser les données URL-encodées (formulaires)
app.use(express.json()); // Middleware pour parser les données JSON
app.use('/static', express.static('static')); // Middleware pour servir les fichiers statiques depuis le dossier 'static'

// Création de la connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connexion à la base de données MySQL
connection.connect(err => {
  if (err) {
    console.error('Erreur de connexion à MySQL : ' + err.stack);
    return;
  }
  console.log('Connecté à MySQL avec l\'ID ' + connection.threadId);
});

// Route pour afficher la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/templates/acceuil.html');
});

// Route pour afficher le formulaire de réclamation
app.get('/reclamations.html', (req, res) => {
  res.sendFile(__dirname + '/templates/reclamations.html');
});

// Route pour récupérer toutes les réclamations depuis la base de données
app.get('/reclamations', (req, res) => {
  connection.query('SELECT * FROM reclamations', (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des réclamations : ' + error.stack);
      res.status(500).json({ error: 'Erreur lors de la récupération des réclamations.' });
      return;
    }
    res.json(results);
  });
});

// Route pour traiter l'ajout d'une réclamation
app.post('/reclamations', (req, res) => {
  const { nom, date, tel, email, type_formulaire, objet, message } = req.body;

  // Vérification que tous les champs sont remplis
  if (!nom || !date || !tel || !email || !type_formulaire || !objet || !message) {
    return res.status(400).json({ error: "Tous les champs doivent être remplis." });
  }

  // Insertion de la réclamation dans la base de données
  const query = 'INSERT INTO reclamations (nom_client, date, tel, email, type_formulaire, objet, message) VALUES (?, ?, ?, ?, ?, ?, ?)';
  connection.query(query, [nom, date, tel, email, type_formulaire, objet, message], (error, results) => {
    if (error) {
      console.error('Erreur lors de l\'insertion de la réclamation : ' + error.stack);
      res.status(500).json({ error: 'Erreur lors de l\'insertion de la réclamation.' });
      return;
    }
    console.log('Réclamation insérée avec ID : ' + results.insertId);

    // Création du transporteur pour l'envoi d'emails
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Service de messagerie utilisé
      auth: {
        user: process.env.EMAIL_USER, // Adresse email de l'expéditeur
        pass: process.env.EMAIL_PASSWORD // Mot de passe de l'expéditeur
      }
    });

    // Configuration de l'email à envoyer à l'administrateur
    const adminMailOptions = {
      from: email,
      replyTo: email,
      to: 'elmehdielibrahymy04@gmail.com',
      subject: `Nouvelle réclamation de ${nom}: ${objet}`,
      text: `Vous avez reçu une nouvelle réclamation de ${nom} le ${date}.\n\nDétails:\nTéléphone: ${tel}\nEmail: ${email}\nMessage: ${message}`
    };

    // Configuration de l'email de confirmation à envoyer au client
    const clientMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmation de votre réclamation',
      text: `Bonjour ${nom},\n\nNous avons bien reçu votre réclamation du ${date}. Voici les détails :\n\nTéléphone: ${tel}\nEmail: ${email}\nObjet: ${objet}\nMessage: ${message}\n\nNous vous contacterons bientôt pour vous informer de la suite.\n\nCordialement,\nL'équipe SAFARELEC`
    };

    // Envoi de l'email à l'administrateur
    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        console.error('Erreur lors de l\'envoi de l\'email à l\'administrateur : ' + error.stack);
        return;
      }
      console.log('Email envoyé à l\'administrateur : ' + info.response);
    });

    // Envoi de l'email de confirmation au client
    transporter.sendMail(clientMailOptions, (error, info) => {
      if (error) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation au client : ' + error.stack);
        res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email de confirmation.' });
        return;
      }
      console.log('Email de confirmation envoyé : ' + info.response);
      res.status(200).json({ message: 'Réclamation ajoutée avec succès ! Email de confirmation envoyé.' });
    });
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
