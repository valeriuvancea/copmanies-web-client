angular.module('app', ['ui.grid', 'ui.grid.expandable', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.cellNav', 'ui.grid.moveColumns','ngDialog'])
.controller('client', function($scope, $http, ngDialog) {
  $scope.grid = {
    onRegisterApi: function(gridApi) {
      $scope.gridApi = gridApi;
      gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
        console.log('edited row id:' + rowEntity.CompanyID + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue);
        $scope.$apply();
      });
    },
    appScopeProvider: this,
    enableColumnResizing: true,
    expandableRowTemplate: '<div ui-grid="row.entity.subGridOptions" style="height:150px;"></div>',
    showExpandAllButton: false, 
    enableSorting: true,
    enableColumnMenus: false,
    enableCellEditOnFocus: true,
    expandableRowScope: {
      openAddBeneficialOwnerModal: openAddBeneficialOwnerModal
    }
  };

  $scope.grid.columnDefs = 
  [
    { name: 'CompanyID', displayName: 'Company ID', enableCellEdit: false, type: "number", width: '10%'},
    { name: 'Name', width: '10%'},
    { name: 'Address', width: '25%'},
    { name: 'City', width: '10%'},
    { name: 'Country', width: '10%'},
    { name: 'EMail', displayName: 'Email', width: '15%'},
    { name: 'PhoneNumber', displayName: 'Phone Number', width: '17%'}
  ];

  var getCompanies;
  (getCompanies = function (){
    $http({
      method: 'GET',
      url: 'https://companies-web-service.herokuapp.com/companies'
    }).then(function successCallback(response) {
      var data = response.data;
      for (var i = 0; i < data.length; i++) {
        data[i].subGridOptions = {
          onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
          },
          headerTemplate: '<div class="ui-grid-top-panel" style="text-align: center">' +
                            '<div style="line-height: 40px;height:0px">Beneficial owners</div>' +
                            '<button class="btn smallBtn" ng-click="grid.appScope.openAddBeneficialOwnerModal('+data[i].CompanyID+')">Add a beneficial owner</button>' +
                          '</div>',
          columnDefs: [{name: 'Beneficial Owners', field: 'FullName', enableColumnMenu: false }],
          data: data[i].BeneficialOwners
        }
      }
      $scope.grid.data=response.data;
    }, function errorCallback(response) {
    });
  })();
  
  $scope.addCompany = function() { 
    ngDialog.openConfirm({template: 'addCompanyDialogTemplate.html',
      className: 'ngdialog-theme-default',
		  scope: $scope
		}).then(
			function(newCompany) {
				$http({
          method: 'POST',
          url: 'https://companies-web-service.herokuapp.com/companies',
          headers: {
            'Content-Type': 'application/json'
          },
          data: newCompany
        }).then(function successCallback(response) {
          getCompanies();
          $scope.gridApi.core.refresh();
        }, function errorCallback(response) {
        });
			},
			function(error) {
			}
    );
  };

  function openAddBeneficialOwnerModal(companyID) {
    ngDialog.openConfirm({template: 'addBeneficialOwnerDialogTemplate.html',
      className: 'ngdialog-theme-default',
		  scope: $scope
		}).then(
			function(fullName) {
				addBeneficialOwnerAtCompanyWithIt(fullName, companyID);
			},
			function(error) {
			}
		);
  }

  function addBeneficialOwnerAtCompanyWithIt(fullName, companyID) {
    var newBeneficialOwner = [{
      "FullName": fullName
    }];
    $http({
      method: 'POST',
      url: 'https://companies-web-service.herokuapp.com/companies/' + companyID + '/beneficialOwners',
      headers: {
        'Content-Type': 'application/json'
      },
      data: newBeneficialOwner
    }).then(function successCallback(response) {
      getCompanies();
      $scope.gridApi.core.refresh();
    }, function errorCallback(response) {
    });
  }
});

    