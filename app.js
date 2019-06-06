angular.module('app', []).controller('client', function($scope, $http) {
    $http({
    method: 'GET',
    url: 'http://companies-web-service.herokuapp.com/companies'
    }).then(function successCallback(response) {
        $scope.companies=response.data;
    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
});
    