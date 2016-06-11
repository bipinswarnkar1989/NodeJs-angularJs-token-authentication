angular.module('starter')
 
.controller('LoginCtrl', function($scope, AuthService, $state) {
  $scope.user = {
    username: '',
    password: ''
  };
 
  $scope.login = function() {
    AuthService.login($scope.user).then(function(msg) {
      $state.go('inside');
    }, function(errMsg) {
      $scope.error = errMsg;
    });
  };
})

.controller('InsideCtrl', function($scope, AuthService, API_ENDPOINT, $http, $state) {
  $scope.destroySession = function() {
    AuthService.logout();
  };
 
  $scope.getInfo = function() {
    $http.get(API_ENDPOINT.url + '/memberinfo').then(function(result) {
      $scope.memberinfo = result.data.msg;
    });
  };
 
  $scope.logout = function() {
    AuthService.logout();
    $state.go('app.login');
  };
})

.controller('AppCtrl', function($scope, $state, AuthService, AUTH_EVENTS) {
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('app.login');
    
  });
});