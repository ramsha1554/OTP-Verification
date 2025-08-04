require('dotenv').config()
const express = require('express')
const session = require('express-session'); 
const bodyParser = require('body-parser'); 
const nodemailer = require('nodemailer');  
const crypto = require('crypto'); 



const app = express();
const PORT = 5000;




app.use(bodyParser.urlencoded({ extended: false }));




app.use(session({         
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.set('view engine', 'ejs');



const transporter = nodemailer.createTransport({

service : 'gmail' , 
auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
    pool: true,
  maxConnections: 5,
  maxMessages: 10,


})

function generateOTP() {
  return Math.floor (100000 + Math.random() * 900000)  //OTP
}


app.get('/', (req, res) => {
  res.render('index');  
});

app.post('/signup', (req, res) => {
  const email = req.body.email;
  const otp = generateOTP();

  req.session.email = email;
  req.session.otp = otp;

  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'OTP Verification',
    text: `your otp is : ${otp}. Please dont share with anyone .`,
  }, (error) => {
    if (error) {
      console.log(error);
      return res.render('index', { message: 'Unable to send the OTP.' });
    }
    res.redirect('/verify');
  });
});




app.get('/verify', (req, res) => {
  res.render('verify', { message: null }); 
});

app.post('/verify', (req, res) => {
  const userOtp = req.body.otp;
  if (userOtp == req.session.otp) {
    res.render('verify', { message: 'Email has been verified!' });
  } else {
    res.render('verify', { message: 'wrong OTP.' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on  http://localhost:${PORT}`);
});


