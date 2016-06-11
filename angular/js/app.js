var routerApp = angular.module('starter', ['ui.router','ngStorage']);

routerApp.config(function($stateProvider, $urlRouterProvider,$httpProvider) {
    
    $urlRouterProvider.otherwise('/app');
    
    $stateProvider
    
        .state('app',{
        	url:'/app',
        	templateUrl:'templates/outside.html',
        	
        	//abstract:true
        })
        
        // HOME STATES AND NESTED VIEWS ========================================
        .state('app.login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller:'LoginCtrl'
        })
        
        .state('app.register',{
        	url:'/register',
        	templateUrl:'templates/register.html',
        	controller:'RegisterCtrl'
        })
        
        .state('inside',{
        	url:'/inside',
        	templateUrl:'templates/inside.html',
        	controller:'InsideCtrl'
        })
        
      
        
})

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated'
})
 
.constant('API_ENDPOINT', {
  url: 'http://localhost:3000/api'
  //  For a simulator use: url: 'http://127.0.0.1:8080/api'
})

.run(function ($rootScope, $state) {
  /*$rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
	  var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      $state.go('inside');
    }
    else{
    	$state.go('app.login');
    }
  });*/
});

routerApp.controller('RegisterCtrl',function($scope,$http,$state){
	$scope.newUser = {};
	$scope.doRegister = function(){
		var data = {
				 'username' : $scope.newUser.username,
				 'password' : $scope.newUser.password,
				 'firstname' : $scope.newUser.firstname,
				 'lastname' : $scope.newUser.lastname
	             	}
	$http.post('http://localhost:3000/api/signup',data).success(function(res){
		if(!!res)
			$scope.msg = res.msg;
	});
	                               }
});

var LOCAL_TOKEN_KEY = 'yourTokenKey';
var isAuthenticated = false;
var authToken;

routerApp.controller('LoginCtrl',function($scope,$http,$state,$localStorage){
	$scope.user = {};
	
	
	 
	  function loadUserCredentials() {
	    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
	    if (token) {
	      useCredentials(token);
	    }
	  }
	 
	  function storeUserCredentials(token) {
	    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
	    useCredentials(token);
	  }
	 
	  function useCredentials(token) {
	    isAuthenticated = true;
	    authToken = token;
	 
	    // Set the token as header for your requests!
	    $http.defaults.headers.common.Authorization = authToken;
	  }
	  
	$scope.login = function(){
		var data = {
				 'username' : $scope.user.username,
				 'password' : $scope.user.password,
		           }
		$http.post('http://localhost:3000/api/authenticate',data).success(function(res){
			if(res.success){
				//$localStorage.token = res.token;
				storeUserCredentials(res.token);
				$state.go('inside');
				//alert($localStorage.token);
			}
			else{
				$scope.error = res.msg;
			}
		});
	}
});

routerApp.controller('InsideCtrl',function($scope,$http,$state,$localStorage){
	$scope.user = {};
	 var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
	// alert(isAuthenticated);alert(token);alert($http.defaults.headers.common.Authorization);
	 if(token){
	 $http.get('http://localhost:3000/api/memberinfo',{ headers: {
	        Authorization: token
     }}).success(function(res){
		// alert(res.success);
    	 $scope.user = res.user;
	 });
	 }
	 else{
		 $state.go('app.login');
	 }
	function destroyUserCredentials() {
	    authToken = undefined;
	    isAuthenticated = false;
	    $http.defaults.headers.common.Authorization = undefined;
	    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
	  }
	
	$scope.logout = function() {
	    destroyUserCredentials();
	    $state.go('app.login');
	  };
});


