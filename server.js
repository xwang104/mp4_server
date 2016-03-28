// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/user');
var Task = require('./models/task');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://xwang104:03131989Wxx@ds051833.mlab.com:51833/mp4');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

//Add more routes here

//on routes that end in /users
var usersRoute = router.route('/users');

usersRoute
.post(function(req, res) {
    var user = new User(); 
    user.name = req.body.name;
    user.email = req.body.email;
    user.save(function(err) {
        if (err)
            res.send(err);
        res.json({message: 'User created!', data: user});
    });
})
.get(function(req, res) {
    User.find(function(err, users) {
        if (err)
            res.send(err);
        res.json({message: 'Users obtained!', data: users});
    })
});

//on routes that end in /users/:id

var userRoute = router.route('/users/:user_id');

userRoute
.get(function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
        if (err)
            res.send(err);
        if (user == null)
            res.status(404).send('Not found');
        res.json({message: 'user obtained!', data: user});
    });
})
.put(function(req, res) {
    User.findById(req.params.user_id, function(err, user) {
        if (err)
            res.send(err);
        if (user == null)
            res.status(404).send('Not found');
        user.name = req.body.name;
        user.email = req.body.email;
        user.pendingTasks = req.body.pendingTasks;
        user.save(function(err) {
            if (err)
                res.send(err);
            res.json({message: 'User updated!', data: user});
        });
    });
})
.delete(function(req, res) {
    User.findByIdAndRemove(req.params.user_id, function(err, user) {
        if (err)
            res.send(err);
        if (user == null) 
            res.status(404).send('Not found');
        res.json({message: 'User successfully deleted', data: user});
    });
});

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
