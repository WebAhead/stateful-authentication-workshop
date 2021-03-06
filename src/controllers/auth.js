// use these functions to manipulate our database
const { findByUsername, addNewUser } = require('../models/users/User.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.loginPage = (req, res) => {
  res.render('login', { activePage: { login: true } });
};
exports.registerPage = (req, res) => {
  res.render('register', { activePage: { register: true } });
};

// This function handles the POST /addUser route
// checks if the password and confirmPassword are equal if not send back
// a proper error message
// hash the password, then add the new user to our database using the v addNewUser method
// make sure to handle any error that might occured
exports.addUser = (req, res, err) => 
  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      return res.render('register', {
        activePage: { register: true },
        error: error.message
      });
    }

    try {
      await addNewUser(username, hash)
      
      res.redirect('/login')
    } catch(error) {

      res.render('register', {
        activePage: { register: true },
        error: error.message
      })

    }
  });

// this function handles the POST /authenticate route
// it finds the user in our database by his username that he inputed
// then compares the password that he inputed with the one in the db
// using bcrypt and then redirects back to the home page
// make sure to look at home.hbs file to be able to modify the home page when user is logged in
// also handle all possible errors that might occured by sending a message back to the cleint
exports.authenticate = async (req, res) => {
  try {
    const { password, username } = req.bodu;
    
    const user = await findByUsername(username);

    bcrypt.compare(password, user.password, function(err, result) {
      if (!result) {
        return res.render('login', {
          activePage: { login: true },
          error: 'Password is incorrect'
        });
      }

      jwt.sign(user.username, process.env.JWT_SECRET, function(err, token) {
        if (err) {
          res.render('login', {
            activePage: { login: true },
            error: err.message
          });
        }

        res.cookie('access_token', token);
        res.redirect('/');
      });
    });
  } catch (error) {
    res.render('login', {
      activePage: { login: true },
      error: error.message
    });
  }
};

exports.logout = (req, res, next) => {
  res.clearCookie('access_token');

  res.redirect('/');

  next();
};
