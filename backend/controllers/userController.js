const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4, stringify } = require("uuid");
const { getDb } = require("../db/db");

// @desc    register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  //   const { error } = validateRegister(req.body);
  //   if (error) {
  //     console.log("Validation error:", error.details[0].message);
  //     res.status(400);
  //     throw new Error(error.details[0].message);
  //   }
  const { name, email, password } = req.body;

  const id = uuidv4();

  if (!name || !email || !password) {
    res.status(400);
    throw new Error(
      "Please provide all required fields: ",
      name,
      email,
      password
    );
  }
  const userExists = await getDb().query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (userExists.length !== 0) {
    res.status(400);
    throw new Error("User already exists");
  }

  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const userResult = await getDb().query(
      "INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)",
      [id, name, email, hashedPassword]
    );

    console.log(`User created: `, email, name);

    const user = {
      _id: id,
      name: name,
      email: email,
      token: generateToken(id),
    };

    res.status(201).json(user);
  } catch (err) {
    console.error("ERROR: ", err);

    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
});

// @desc   Get current user data
// @route   GET /api/users/current
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Assuming you have middleware to attach the user to the request
  try {
    const user = await getDb().query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [userId]
    );
    res.status(200).json(user);
  } catch (error) {
    console.error("ERROR: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// @desc    Authenticate user
// @route   POST /api/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  // const { error } = validateLogin(req.body);
  // if (error) {
  //   console.log("Validation error:", error.details[0].message);
  //   res.status(400);
  //   throw new Error(error.details[0].message);
  // }

  const { email, password } = req.body;

  // Check for user email
  const [rows] = await getDb().query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = rows[0];

  // Compare user's password
  if (user && (await bcrypt.compare(password, user.password))) {
    console.log("User logged in");
    const { id, name, email } = user;
    res.status(201).json({
      _id: id,
      name: name,
      email: email,
      token: generateToken(id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
module.exports = {
  registerUser,
  getCurrentUser,
  loginUser,
};
