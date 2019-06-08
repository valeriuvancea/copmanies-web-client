angular.module('app', ['ngTouch', 'ui.grid', 'ui.grid.expandable', 'ui.grid.edit'])
.controller('client', function($scope, $http) {
  $scope.grid = { 
    expandableRowTemplate: '<div ui-grid="row.entity.subGridOptions" style="height:150px;"></div>',
    expandableRowHeight: 150,
    expandableRowScope: {
      subGridVariable: 'subGridScopeVariable'
    }
  };
  $scope.grid.columnDefs = 
  [
    { name: 'CompanyID', displayName: 'Company ID', enableCellEdit: false, width: '10%', enableColumnMenu: false },
    { name: 'Name', width: '15%', enableColumnMenu: false },
    { name: 'Address', width: '15%', enableColumnMenu: false },
    { name: 'City', width: '10%', enableColumnMenu: false },
    { name: 'Country', width: '10%', enableColumnMenu: false },
    { name: 'EMail', displayName: 'Email', width: '20%', enableColumnMenu: false },
    { name: 'PhoneNumber', displayName: 'Phone Number', width: '17%', enableColumnMenu: false }
  ];
      //set gridApi on scope
  $scope.grid.onRegisterApi = function(gridApi) {
    $scope.gridApi = gridApi;
    $scope.gridApi.edit.on.
    afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
      console.log('edited row id:' + rowEntity.CompanyID + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue);
    });
  };
  $http({
    method: 'GET',
    url: 'http://companies-web-service.herokuapp.com/companies'
  }).then(function successCallback(response) {
    var data = response.data;
    for (var i = 0; i < data.length; i++) {
      data[i].subGridOptions = {
        headerTemplate: '<button>test</button>',
        columnDefs: [{name: 'Beneficial Owners', field: 'FullName', enableColumnMenu: false }],
        data: data[i].BeneficialOwners
      }
      console.log(data[i].BeneficialOwners);
    }
    $scope.grid.data=response.data;
  }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
  });
  $scope.addData = function() {
    var n = $scope.grid.data.length + 1;
    $scope.grid.data.push({
      "CompanyID": "-",
      "Name": "Company " + n,
      "City": "City " + n,
      "Country": "Country " + n,
      "EMail": "Email " + n,
      "PhoneNumber": "Phone Number" + n
    });
  };
});
    