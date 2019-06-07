angular.module('app', ['ui.grid']).controller('client', function($scope, $http) {
    this.myData = [
        { name: 'id', enableCellEdit: false, width: '10%' },
        { name: 'name', displayName: 'Name (editable)', width: '20%' },
        { name: 'age', displayName: 'Age' , type: 'number', width: '10%' },
        { name: 'gender', displayName: 'Gender', editableCellTemplate: 'ui-grid/dropdownEditor', width: '20%',
          cellFilter: 'mapGender', editDropdownValueLabel: 'gender', editDropdownOptionsArray: [
          { id: 1, gender: 'male' },
          { id: 2, gender: 'female' }
        ] },
        { name: 'registered', displayName: 'Registered' , type: 'date', cellFilter: 'date:"yyyy-MM-dd"', width: '20%' },
        { name: 'address', displayName: 'Address', type: 'object', cellFilter: 'address', width: '30%' },
        { name: 'address.city', displayName: 'Address (even rows editable)', width: '20%',
          cellEditableCondition: function(scope){
            return scope.rowRenderIndex%2;
          }
        },
        { name: 'isActive', displayName: 'Active', type: 'boolean', width: '10%' },
        { name: 'pet', displayName: 'Pet', width: '20%', editableCellTemplate: 'ui-grid/dropdownEditor',
          editDropdownRowEntityOptionsArrayPath: 'foo.bar[0].options', editDropdownIdLabel: 'value'
        },
        { name: 'status', displayName: 'Status', width: '20%', editableCellTemplate: 'ui-grid/dropdownEditor',
          cellFilter: 'mapStatus',
          editDropdownOptionsFunction: function(rowEntity, colDef) {
            var single;
            var married = {id: 3, value: 'Married'};
            if (rowEntity.gender === 1) {
              single = {id: 1, value: 'Bachelor'};
              return [single, married];
            } else {
              single = {id: 2, value: 'Nubile'};
              return $timeout(function() {
                return [single, married];
              }, 100);
            }
          }
        }
         ];
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
    