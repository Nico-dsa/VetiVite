const express = require('express');
const mysql = require('mysql');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Multer configuration pour stocker les fichiers sur le disque
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: function (req, file, cb) {
    cb(null, 'image-' + Date.now() + path.extname(file.originalname));
  }
});

// Configuration initiale de l'app Express
const app = express();
const upload = multer({ storage: storage });
const saltRounds = 10;
const secret = crypto.randomBytes(64).toString('hex');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'portfolio',
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false,
}));

// Connexion à la base de données
db.connect(err => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to the MySQL database.');
});

// Routes
app.post('/login', handleLogin);
app.post('/process-registration', handleRegistration);
app.get('/user-data', handleUser);
app.get('/articles', handleGetArticles);
app.get('/wishlist', handleGetWishlist);
app.get('/cart', handleGetCart);
app.get('/on-sale', handleOnSale);
app.get('/sold', handleSold);
app.get('/article-details/:id', handleDetail);
app.post('/add-to-wishlist', handleAddToWishlist);
app.post('/add-to-cart', handleAddToCart);
app.post('/remove-from-wishlist', handleRemoveFromWishlist);
app.post('/remove-from-cart', handleRemoveFromCart);
app.post('/add-article', upload.single('product-image'), handleAddArticle),
  app.get('/ajout-article', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });


// Démarrage du serveur
const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));

//Code pour afficher le détail
function handleDetail(req, res) {
  const articleId = req.params.id;
  const query = 'SELECT * FROM articles WHERE id = ?';
  db.query(query, [articleId], (err, results) => {
    if (err) {
      console.error('Error fetching article details:', err);
      return res.status(500).json({ error: 'Error fetching article details' });
    }
    const article = results[0];
    article.date = new Date(article.date).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    res.json(article);
  });
}

// Code pour le login
function handleLogin(req, res) {
  const email = req.body.mail;
  const pass = req.body.password;
  const query = 'SELECT * FROM user WHERE mail = ?';
  db.query(query, [email], async (error, results, fields) => {
    if (error) {
      res.status(500).json({ error: 'Database connection error' });
      return;
    }
    if (results.length > 0) {
      const match = await bcrypt.compare(pass, results[0].pass);
      if (match) {
        req.session.userId = results[0].id;
        res.json({ success: true });
      } else {
        res.json({ success: false, message: 'Email or password is incorrect' });
      }
    } else {
      res.json({ success: false, message: 'Email does not exist' });
    }
  });
}

// Code pour l'inscription
function handleRegistration(req, res) {
  const { nom, prenom, age, sexe, adresse, ville, codePostal, pays, mail, password } = req.body;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      res.status(500).send('Error hashing password');
      return;
    }
    const query = `
      INSERT INTO user (first_name, name, sexe, age, address, city, zip, country, mail, pass)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [nom, prenom, sexe, age, adresse, ville, codePostal, pays, mail, hash], (error, results) => {
      if (error) {
        console.error('Error during user registration:', error);
        res.status(500).send('An error occurred during registration');
        return;
      }
      req.session.userId = results.insertId;
      res.redirect('/');
    });
  });
}

// Code pour récupérer les articles
function handleUser(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  const userId = req.session.userId;
  const query = 'SELECT * FROM user WHERE id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ error: 'Error fetching user profile' });
    }

    const userData = results[0];
    res.json(userData);
  });
}

// Code pour récupérer les articles
function handleGetArticles(req, res) {
  const query = 'SELECT * FROM articles';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching articles' });
    }
    res.json(results);
  });
}

// Code pour la route des articles en vente
function handleOnSale(req, res) {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized: No session available');
  }
  const query = `
    SELECT * FROM articles 
    WHERE id_user = ? 
    AND status = "disponible"`;
  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching on sale' });
    }
    res.json(results);
  });
}

// Code pour la route des articles vendus
function handleSold(req, res) {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized: No session available');
  }
  const query = `
    SELECT * FROM articles 
    WHERE id_user = ? 
    AND status = "vendu"`;
  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching sold' });
    }
    res.json(results);
  });
}

// Code pour récupérer la wishlist
function handleGetWishlist(req, res) {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized: No session available');
  }
  const query = `
    SELECT articles.*
    FROM wishlist
    JOIN articles ON wishlist.article_id = articles.id
    WHERE wishlist.user_id = ?`;
  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching wishlist' });
    }
    res.json(results);
  });
}

// Code pour récupérer le panier
function handleGetCart(req, res) {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized: No session available');
  }
  const query = `
    SELECT articles.*
    FROM cart
    JOIN articles ON cart.article_id = articles.id
    WHERE cart.user_id = ?`;
  db.query(query, [req.session.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching cart' });
    }
    res.json(results);
  });
}

// Code pour ajouter à la wishlist
function handleAddToWishlist(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "User not logged in" });
  }
  const { articleId } = req.body;
  const query = `
    INSERT INTO wishlist (user_id, article_id)
    VALUES (?, ?)`;
  db.query(query, [req.session.userId, articleId], (error, results) => {
    if (error) {
      return res.status(500).json({ success: false, message: "Error adding to wishlist" });
    }
    res.json({ success: true, message: "Article added to wishlist" });
  });
}

// Code pour ajouter au panier
function handleAddToCart(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "User not logged in" });
  }
  const { articleId } = req.body;
  const query = `
    INSERT INTO cart (user_id, article_id)
    VALUES (?, ?)`;
  db.query(query, [req.session.userId, articleId], (error, results) => {
    if (error) {
      return res.status(500).json({ success: false, message: "Error adding to cart" });
    }
    res.json({ success: true, message: "Article added to cart" });
  });
}

// Code pour supprimer un article du panier
function handleRemoveFromCart(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "User not logged in" });
  }
  const { articleId } = req.body;
  const query = `
    DELETE FROM cart
    WHERE user_id = ? AND article_id = ?`;
  db.query(query, [req.session.userId, articleId], (error, results) => {
    if (error) {
      console.error('Error removing article from cart:', error);
      return res.status(500).json({ success: false, message: "Error removing article from cart" });
    }
    // Vous pouvez vérifier combien de lignes ont été affectées si nécessaire avec results.affectedRows
    res.json({ success: true, message: "Article removed from cart" });
  });
}

// Code pour supprimer un article de la wishlist
function handleRemoveFromWishlist(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "User not logged in" });
  }
  const { articleId } = req.body;
  const query = `
    DELETE FROM wishlist
    WHERE user_id = ? AND article_id = ?`;
  db.query(query, [req.session.userId, articleId], (error, results) => {
    if (error) {
      console.error('Error removing article from wishlist:', error);
      return res.status(500).json({ success: false, message: "Error removing article from wishlist" });
    }
    // Vous pouvez vérifier combien de lignes ont été affectées si nécessaire avec results.affectedRows
    res.json({ success: true, message: "Article removed from wishlist" });
  });
}

function handleAddArticle(req, res) {
  if (!req.file) {
    return res.status(400).send('No file was uploaded.');
  }
  const userId = req.session.userId;
  const { name, brand, descr, size, cond, price, cat, color } = req.body;
  const status = 'disponible';
  const date = new Date(); // La date actuelle pour la mise en vente
  const img = req.file.filename;

  const query = `
    INSERT INTO articles (id_user, name, descr, price, date, status, cat, brand, img, size, cond, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(query, [userId, name, descr, price, date, status, cat, brand, img, size, cond, color], (error, results) => {
    if (error) {
      console.error('Erreur lors de l\'ajout de l\'article:', error);
      return res.status(500).json({ success: false, message: "Erreur lors de l'ajout de l'article" });
    }
    res.json({ success: true, message: "Article ajouté avec succès", articleId: results.insertId });
  });
}
