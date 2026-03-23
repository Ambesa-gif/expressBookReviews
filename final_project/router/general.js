const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


let users = []; // existing users array

public_users.post('/register', function (req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }

  const userExists = users.some(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/books'); // local endpoint
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/books/${isbn}`)
    .then(response => {
      if (response.data) res.send(response.data);
      else res.status(404).json({ message: "Book not found" });
    })
    .catch(error => res.status(500).json({ message: "Error fetching book", error: error.message }));
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  axios.get('http://localhost:5000/books')
    .then(response => {
      const booksByAuthor = Object.values(response.data).filter(b => b.author.toLowerCase() === author);
      if (booksByAuthor.length > 0) res.send(booksByAuthor);
      else res.status(404).json({ message: "No books found by this author" });
    })
    .catch(error => res.status(500).json({ message: "Error fetching books", error: error.message }));
});

public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  axios.get('http://localhost:5000/books')
    .then(response => {
      const booksByTitle = Object.values(response.data).filter(b => b.title.toLowerCase() === title);
      if (booksByTitle.length > 0) res.send(booksByTitle);
      else res.status(404).json({ message: "No books found with this title" });
    })
    .catch(error => res.status(500).json({ message: "Error fetching books", error: error.message }));
});

module.exports.general = public_users;
