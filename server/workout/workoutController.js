/* 
* @Author: nimi
* @Date:   2015-05-04 16:41:47
* @Last Modified by:   nimi
* @Last Modified time: 2015-05-10 15:08:16
*/
'use strict';

var Workout = require('../models').workout;
var Trybe = require('../models').trybe;
var Exercise = require('../models').exercise;
var User = require('../models').user;
var async = require('async');

module.exports = {

  saveWorkout: function(req, res, next){
    // Acquire workout information from the req.body;
    // Write the workout information to the sql tables

    var userID;
    var trybeID;
    var workoutID;

    //Acquire userID from User table
    User.find({where: {username: req.body.username}}).then(function(user){
      userID = user.get('id');

      //Acquire trybeID from Trybe table
      Trybe.find({where: {name: req.body.trybe}}).then(function(trybe){
        trybeID = trybe.get('id');
        
        //Insert data into Workout table
        Workout.build({
          UserId: userID,
          type: req.body.type,
          title: req.body.title,
          description: req.body.description, 
          finalResult: req.body.finalResult,
          TrybeId: trybeID
        })
        .save()
        .then(function(workout){

          //Acquire the workoutID from Workout table
          workoutID = workout.get('id');

          //Insert all exercises into Exercises table
          req.body.exercises.forEach(function(exercise){
            Exercise.build({
              exerciseName: exercise.exerciseName,
              quantity: JSON.stringify(exercise.quantity), 
              result: exercise.result, 
              WorkoutId: workoutID
            })
            .save();
          });

          //Run getAllWorkouts to return the response with 
          //an array of workouts 
          module.exports.getAllWorkouts(req, res, next);
        });
      });
    });
    



    
    // We then run getAllWorkouts to acquire workouts
    // from workout table
  },


  getAllWorkouts: function(req, res, next){
    // var body = {
    //   token : token, 
    //   workout: [1, 2, 3], 
    //   userID: userID
    // }
    var workoutsArray = [];
    var userID = req.headers['x-access-userid']
   
    User.find ({where: {id: userID}}).then(function(user){ // find the user
      user.getTrybes().then(function(trybes){ //will return an array of trybe objects
        async.eachSeries(trybes, function(trybe, outerNext){ // go through each trybe 
          trybe.getWorkouts().then(function(workouts){ // get all workouts associated with the trybe
            async.eachSeries(workouts, function(workout, innerNext){ // go through each workout in each trybe
              Exercise.findAll({where: {workoutID: workout.get('id')}}).then(function(exercises){ // finds all exercises for each workout
                var workoutObj = { // create the workout object in the proper format
                  username: user.get('username'),
                  trybe: trybe.get('name'),
                  type: workout.get('type'),
                  title: workout.get('title'),
                  description: workout.get('description'),
                  exercises: exercises,
                  finalResult: workout.get('finalResult')
                };
                workoutsArray.push(workoutObj); 
                innerNext() // this callback lets the async each know to move on to the next value
              });
            }, function(err){ // this function gets called when the async each is done going through all the workouts 
              if(err){
                console.error(err);
              }
              outerNext(err); //this lets the async each that's going through each trybe know to move to the next trybe
            })
          })
        }, function(err){ // this function gets called when there are no more trybes to go through
          if(err){
            console.error(err)
          }
          // once the each function is done doing through every trybe and all the workouts have been pushed, we send back
          // the workoutsArray to the client
          res.send(workoutsArray) 
        })
      })
    });
  }



};
