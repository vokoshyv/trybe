/*
* @Author: vincetam
* @Date:   2015-05-05 10:16:27
* @Last Modified by:   Justin Webb
* @Last Modified time: 2015-05-05 17:40:14
*/

'use strict';

(function (angular, _) {

  /**
   * Sets config for module
   * @param {angular} $stateProvider
   * @param {angular} $urlRouterProvider
   */
  var AppStateConfig = function($stateProvider, $urlRouterProvider){
    $stateProvider.state('root', {
      url: '/',
      controller: AppCtrl
    });

    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise('/');
  };

  /**
   * Entry point for application. Loads all client-side dependencies
   * @param {angular} $scope
   */
  var AppCtrl = function($scope) {
    $scope.items = ['A', 'List', 'Of', 'Items'];
  };

  //Entry point for for module
  angular

    .module('trybe-app', [
      // angular modules
      'ngAnimate',
      'ui.router',

      // app modules
      'trybe-app.workout',
      'trybe-app.feed'
      // 'trybe-app.login'
    ])

    .config(AppStateConfig)

    .controller('AppCtrl', AppCtrl);

})(angular, _);
