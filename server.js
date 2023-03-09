const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  age: Number,
});

// Define user model
const User = mongoose.model('User', userSchema);

// Set up middleware
app.use(bodyParser.json());

// Define API routes
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id }, 'mysecretkey');

  res.json({ token });
});

app.post('/users', async (req, res) => {
  const { email, password, name, age } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ email, password: hashedPassword, name, age });

  await user.save();

  res.json({ message: 'User created successfully' });
});

app.get('/users', async (req, res) => {
  const users = await User.find();

  res.json(users);
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = name;
  user.age = age;

  await user.save();

  res.json({ message: 'User updated successfully' });
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
