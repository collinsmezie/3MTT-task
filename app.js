require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./dbConnect');
const passport = require('passport');
const session = require('express-session');
const connectEnsureLogin = require('connect-ensure-login');
const mailer = require('./utils/mailer')
const emailMessage = require('./utils/emailMessage')
const generateOTP = require('./utils/otp_generator')
const fs = require('fs');
const path = require('path')
const userModel = require('./models/users');



// Connect to database
connectDB();

// Middleware to allow cross-origin requests
app.use(cors());

//Middleware to parse JSON requests
app.use(express.json())

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(userModel.createStrategy());
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// app.set('views', 'views');
// app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



//render the login page
app.get('/login', (req, res) => {
  res.render('login');
});

//render the signup page
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/', (req, res) => {
  res.render('index')
});

app.get('/dashboard', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  res.render('dashboard', { user: req.user });

});

// app.get('/ver', (req, res) => {
//   res.render('verification');

// });


//handle the signup request for new users
app.post('/signup', (req, res) => {
  const user = req.body;
  userModel.register(
    new userModel({ username: user.username, email: user.email }), user.password, (err) => {
      if (err) {
        console.log('error while user register!', err);
        res.status(500).send(err);

      } else {
        passport.authenticate('local')(req, res, async () => {
          try {
            const otp = generateOTP().toString()
            const message = emailMessage(user.username, otp)
            const sendMail = await mailer(user.email, "Access Token", message);
            res.render('verification', { user: req.user });
            if (sendMail) {
              fs.writeFile('otp.txt', otp, (err) => {
                if (err) {
                  console.error('Error saving OTP to file:', err);
                  res.status(500).json({ error: err.message });
                } else {
                  console.log('OTP saved to file.');
                }
              });
            } else {
              // Handle mailer error
              console.error('Error sending email:', error);
              res.status(500).json({ error: error.message });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        });
      }
    }
  );
});



//handle the login request for existing users
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
  res.render('dashboard', { user: req.user });
});


// Handle verification request using saved OTP
app.post('/verify', (req, res) => {
  const { otp } = req.body;
  fs.readFile('otp.txt', 'utf8', (err, savedOTP) => {
    if (err) {
      console.error('Error reading OTP file:', err);
      res.status(500).json({ error: err.message });
    } else {
      if (otp === savedOTP.trim()) {
        res.render('dashboard', { user: req.user });
      } else {
        // Incorrect OTP
        res.render('verification', { user: req.user, error: 'Incorrect OTP, please try again.' });
      }
    }
  });
});


// Handle logout request with redirect to login page using passport

// app.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/login');
// });



app.get('/logout', (req, res) => {
  // req.logout();
  req.session.destroy()
  res.render('index')
});


// Middleware for error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


