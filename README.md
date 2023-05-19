
# OTPBasedLogin
This is a simple login system based on One-Time Password (OTP) verification. It provides a secure and convenient way for users to log in to a system by generating a unique OTP and validating it..

API Deployed on : https://otpbasedlogin-blun.onrender.com/

## Tech Used:
  1. NodeJs
  2. ExpressJs
  3. MongoDB
  4. NodeMailer
  5. JWT
  6. otp-generator

## Features
 1. signUp :  Users can create an account by providing their email address.

 2. OTP Generation : An OTP is generated and sent to their registered email address.

 3. OTP verification: Users must enter the correct OTP within a     specified time limit to log in successfully.


## How to use :

 ### Clone the repo 
  
  ```
    git clone : https://github.com/Rk344300/OTPBasedLogin
  ```
 ### to install the dependencies

``` 
npm install
 ```

 ### put your secret key In .env file
  
  PORT= ENTER_THE_PORT

MONGO_URL = ENTER THE URL TO CONNECT MONOGODB 

JWT_SECRETKEY = ENTER_JWT_SECRET

TRANSPORTER_EMAIL =ENTER_TRANSPORTER_EMAIL;
TRANSPORTER_PASSWORD = ENTER_TRANSPORTER_PASSWORD;



## To run the application

```
npm start
```
This will install the dependencies and start the server on http://localhost:8000.



