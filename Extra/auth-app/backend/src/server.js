const express = require('express');
const cors = require('cors');
const jsonfile = require('jsonfile');
const authRoutes = require('./routes/auth');

const app = express();
const file = 'data/users.json';

// Initialize users.json if it doesn't exist
jsonfile.readFile(file, (err, data) => {
  if (err && err.code === 'ENOENT') {
    jsonfile.writeFile(file, { users: [] }, { spaces: 2 }, (err) => {
      if (err) console.error('Error initializing users.json:', err);
    });
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes(file));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));