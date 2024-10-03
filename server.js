const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, full_name TEXT, email TEXT, phone TEXT, employment_history TEXT, document_paths TEXT)");
});

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
app.post('/api/register', (req, res) => {
  const { username, password, role } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role || 'user'], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Error creating user' });
      }
      res.status(201).json({ message: 'User created successfully' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching user' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error comparing passwords' });
      }
      if (!result) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ token });
    });
  });
});

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token.split(' ')[1], 'your_jwt_secret', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Failed to authenticate token' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
}

app.post('/api/submit-form', verifyToken, upload.array('documents'), (req, res) => {
  const { fullName, email, phone, employmentHistory } = req.body;
  const documentPaths = req.files.map(file => file.path).join(',');

  db.run('INSERT INTO submissions (user_id, full_name, email, phone, employment_history, document_paths) VALUES (?, ?, ?, ?, ?, ?)',
    [req.userId, fullName, email, phone, JSON.stringify(employmentHistory), documentPaths],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error saving submission' });
      }
      res.status(201).json({ message: 'Submission successful' });
    }
  );
});

app.get('/api/user-submissions', verifyToken, (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.all('SELECT * FROM submissions', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching submissions' });
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});