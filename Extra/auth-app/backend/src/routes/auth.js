const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jsonfile = require('jsonfile');
const router = express.Router();

module.exports = (file) => {
  router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
      const data = await jsonfile.readFile(file);
      const users = data.users || [];
      if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      users.push({ username, password: hashedPassword });
      await jsonfile.writeFile(file, { users }, { spaces: 2 });

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const data = await jsonfile.readFile(file);
      const user = data.users.find(user => user.username === username);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};