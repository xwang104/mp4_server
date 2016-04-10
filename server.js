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
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

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
    console.log(req);
    console.log(req.body.name + req.body.email + "new user");
    if (req.body.name === undefined && req.body.email === undefined) 
        res.status(500).send({message: 'Validation Error: A name is required! An email is required!', data: []});
    else if (req.body.name === undefined)
        res.status(500).send({message: 'Validation Error: A name is required!', data: []});
    else if (req.body.email === undefined)
        res.status(500).send({message: 'Validation Error: An email is required!', data: []});
    else {
        User.findOne({email: req.body.email}, function(err, user) {
            if (err)
                res.status(500).send({message: 'Internal Server Error', data: []});
            else if (user) 
                res.status(500).send({message: 'This email already exists!', data: []});
            else {
                var user = new User(); 
                user.name = req.body.name;
                user.email = req.body.email;
                user.save(function(err) {
                    if (err)
                        res.status(500).send({message: 'Internal Server Error', data: []});
                    res.status(201).json({message: 'User created!', data: user});
                });
            }
        });
    }
})
.get(function(req, res) {
    console.log(req.query);
    var where = null;
    where = eval("("+ req.query.where + ")");
    var sort = null;
    sort = eval("(" + req.query.sort + ")");
    var select = null;
    select = eval("("+ req.query.select + ")");
    var skip = null;
    skip = eval("("+ req.query.skip + ")");
    var limit = null;
    limit = eval("("+ req.query.limit + ")");
    var count = false;
    count = eval("("+ req.query.count + ")");

    User.find(where)
    .sort(sort)
    .select(select)
    .skip(skip)
    .limit(limit)
    .exec(function(err, users) {
        if (err)
            res.status(500).send({message: 'Internal Server Error', data: []});
        if (count === true)
            res.json({message: 'Users count obtained!', data: users.length});
        else
            res.json({message: 'Users obtained!', data: users});
    })
})
.options(function(req, res){
      res.writeHead(200);
      res.end();
});

//on routes that end in /users/:id
var userRoute = router.route('/users/:user_id');

userRoute
.get(function(req, res) {
    console.log(req.params.user_id);
    if (req.params.user_id.match(/^[0-9a-fA-F]{24}$/)) {
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.status(500).send({message: 'Internal Server Error', data: []});
            console.log(JSON.stringify(user));
            if (user == null) {
                console.log("user is null");
                res.status(404).send({message: 'User not found', data: []});
            }
            else
                res.json({message: 'user obtained!', data: user});
        });
    }
    else
        res.status(404).send({message: 'User not found', data: []});
})
.put(function(req, res) {
    if (req.params.user_id.match(/^[0-9a-fA-F]{24}$/)) {
        console.log(req.body);
        var update = req.body;
        User.findByIdAndUpdate(req.params.user_id, update, {new: true}, function(err, user) {
            if (err)
                res.status(500).send({message: 'Internal Server Error', data: []});
            if (user == null)
                res.status(404).send({message: 'User not found', data: []});
            else
                res.json({message: 'User updated!', data: user});

        });
    }
    else
        res.status(404).send({message: 'User not found', data: []});
})
.delete(function(req, res) {
    if (req.params.user_id.match(/^[0-9a-fA-F]{24}$/)) {
        User.findByIdAndRemove(req.params.user_id, function(err, user) {
            if (err)
                res.status(500).send({message: 'Internal Server Error', data: []});
            if (user == null) {
                console.log("not found");
                res.status(404).send({message: 'User not found', data: []});
            }
            else
                res.json({message: 'User successfully deleted', data: user});
        });
    }
    else 
        res.status(404).send({message: 'User not found', data: []});
});



//on routes that end in /tasks
var tasksRoute = router.route('/tasks');

tasksRoute
.post(function(req, res) {
    if (req.body.name === undefined && req.body.deadline === undefined) 
        res.status(500).send({message: 'Validation Error: A name is required! A deadline is required!', data: []});
    else if (req.body.name === undefined)
        res.status(500).send({message: 'Validation Error: A name is required!', data: []});
    else if (req.body.deadline === undefined)
        res.status(500).send({message: 'Validation Error: A deadline is required!', data: []});
    else {
        var task = new Task(); 
        task.name = req.body.name;
        task.deadline = req.body.deadline;
        if (req.body.description !== undefined) 
            task.description = req.body.description;
        if (req.body.assignedUser !== undefined)
            task.assignedUser = req.body.assignedUser;
        if (req.body.assignedUserName !== undefined)
            task.assignedUserName = req.body.assignedUserName;
        task.save(function(err) {
            if (err)
                res.status(500).send({message: 'Internal Server Error', data: []});
            res.status(201).json({message: 'Task created!', data: task});
        });
    }
})
.get(function(req, res) {
    console.log(req.query);
    var where = null;
    where = eval("("+ req.query.where + ")");
    var sort = null;
    sort = eval("(" + req.query.sort + ")");
    var select = null;
    select = eval("("+ req.query.select + ")");
    var skip = null;
    skip = eval("("+ req.query.skip + ")");
    var limit = null;
    limit = eval("("+ req.query.limit + ")");
    var count = false;
    count = eval("("+ req.query.count + ")");

    Task.find(where)
    .sort(sort)
    .select(select)
    .skip(skip)
    .limit(limit)
    .exec(function(err, tasks) {
        if (err)
            res.status(500).send({message: 'Internal Server Error', data: []});
        if (count === true)
            res.json({message: 'Tasks count obtained!', data: tasks.length});
        else
            res.json({message: 'Tasks obtained!', data: tasks});
    })
})
.options(function(req, res){
      res.writeHead(200);
      res.end();
});

//on routes that end in /tasks/:id
var taskRoute = router.route('/tasks/:task_id');

taskRoute
.get(function(req, res) {
    console.log(req.params.task_id);
    if (req.params.task_id.match(/^[0-9a-fA-F]{24}$/)) {
        Task.findById(req.params.task_id, function(err, task) {
            if (err)
                res.status(500).send({message: 'Internal Server Error', data: []});
            console.log(JSON.stringify(task));
            if (task == null) {
                console.log("task is null");
                res.status(404).send({message: 'Task not found', data: []});
            }
            else
                res.json({message: 'task obtained!', data: task});
        });
    }
    else
        res.status(404).send({message: 'Task not found', data: []});
})
.put(function(req, res) {
    if (req.params.task_id.match(/^[0-9a-fA-F]{24}$/)) {
        console.log(req.body);
        var update = req.body;
        console.log(update);
        Task.findByIdAndUpdate(req.params.task_id, update, {new: true}, function(err, task) {
            if (err)
                res.status(500).send({message: 'Internal Server Error', data: []});
            if (task == null)
                res.status(404).send({message: 'Task not found', data: []});
            else
                res.json({message: 'Task updated!', data: task});

        });
    }
    else
        res.status(404).send({message: 'Task not found', data: []});
})
.delete(function(req, res) {
    if (req.params.task_id.match(/^[0-9a-fA-F]{24}$/)) {
        Task.findByIdAndRemove(req.params.task_id, function(err, task) {
            if (err)
                res.status(500).send({message: 'Internal Server Error', data: []});
            if (task == null) {
                console.log("not found");
                res.status(404).send({message: 'Task not found', data: []});
            }
            else
                res.json({message: 'Task successfully deleted', data: task});
        });
    }
    else 
        res.status(404).send({message: 'Task not found', data: []});
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
