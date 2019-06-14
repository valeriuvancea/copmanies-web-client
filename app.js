angular.module('app', ['ui.grid', 'ui.grid.expandable', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.cellNav', 'ui.grid.moveColumns', 'ui.grid.validate', 'ngDialog'])
.controller('client', function($scope, $http, ngDialog, uiGridValidateService, uiGridConstants) {

  uiGridValidateService.setValidator('regexValidator',
  function(validator) {
    return function(oldValue, newValue, rowEntity, colDef) {
      return validator.regex.test(newValue)
    };
  },
  function(validator) {
    return validator.errorMessage;
  });

  $scope.grid = {
    appScopeProvider: this,
    enableColumnResizing: true,
    expandableRowTemplate: '<div ui-grid="row.entity.subGridOptions" style="height:150px;"></div>',
    showExpandAllButton: false, 
    enableSorting: true,
    enableColumnMenus: false,
    enableRowHashing: false,
    enableCellEditOnFocus: true,
    expandableRowScope: {
      openAddBeneficialOwnersModal: openAddBeneficialOwnersModal
    }
  };

  $scope.grid.onRegisterApi = function(gridApi) 
  {
    $scope.gridApi = gridApi;
    gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
      $scope.$apply();
      if (!gridApi.validate.isInvalid(rowEntity,colDef) && newValue != oldValue)
      {
        updateCompanyFromRowEntity(rowEntity);
      }
    })
  }

  $scope.grid.columnDefs = 
  [
    { name: 'CompanyID', displayName: 'Company ID', enableCellEdit: false, type: "number", width: '10%'},
    { name: 'Name', width: '10%', validators: {maxLength: 30, required: true}, cellTemplate: 'ui-grid/cellTitleValidator'},
    { name: 'Address', width: '25%', validators: {maxLength: 100, required: true}, cellTemplate: 'ui-grid/cellTitleValidator'},
    { 
      name: 'City', 
      width: '10%', 
      validators: 
      {
        required: true,
        maxLength: 30, 
        regexValidator: 
        {
          regex: /^[A-Z0-9][A-Z0-9.\-()\s]*$/i, 
          errorMessage: 'The field must contain only alpha-numeric and "-()" characters and must start with an alpha-numeric character!'
        }
      }, cellTemplate: 'ui-grid/cellTitleValidator'
    },
    { 
      name: 'Country', 
      width: '10%', 
      validators: 
      {
        required: true,
        maxLength: 30, 
        regexValidator: 
        {
          regex: /^[A-Z0-9][A-Z0-9.\-()\s]*$/i, 
          errorMessage: 'The field must contain only alpha-numeric and "-()" characters and must start with an alpha-numeric character!'
        }
      }, cellTemplate: 'ui-grid/cellTitleValidator'
    },
    { 
      name: 'EMail', 
      displayName: "Email",
      width: '15%', 
      validators: 
      { 
        maxLength: 256,//email max length 256 characters http://www.rfc-editor.org/errata_search.php?rfc=3696
        regexValidator: 
        {
          regex: /^[A-Z0-9!#$%&'*+-/=?^_`{|}~]+@[A-Z0-9.-]+\.[A-Z]+$/i, 
          errorMessage: 'The field must contain a valid email!'
        }
      }, cellTemplate: 'ui-grid/cellTitleValidator'
    },
    { 
      name: 'PhoneNumber', 
      displayName: "Phone Number",
      width: '17%', 
      validators: 
      { 
        maxLength: 20,
        regexValidator: 
        {
          regex: /^\+?[0-9]+$/, 
          errorMessage: 'The field must contain a valid phone number!'
        }
      }, cellTemplate: 'ui-grid/cellTitleValidator'
    },
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
          headerTemplate: '<div class="ui-grid-top-panel" style="text-align: center">' +
                            '<div style="line-height: 40px;height:0px">Beneficial owners</div>' +
                            '<button class="btn smallBtn" ng-click="grid.appScope.openAddBeneficialOwnersModal('+data[i].CompanyID+')">Add beneficial owner(s)</button>' +
                          '</div>',
          columnDefs: [{name: 'Beneficial Owners', field: 'FullName', enableColumnMenu: false }],
          data: data[i].BeneficialOwners
        }
      }
      $scope.grid.data=response.data;
      console.log(response.data);
      $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
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
        }, function errorCallback(response) {
        });
			},
			function(error) {
			}
    );
  };

  function openAddBeneficialOwnersModal(companyID) {
    $scope.beneficialOwners = 
    [
      {
        "FullName": ""
      }
    ];
    $scope.addBeneficialOwner = function () {
      var itemToAdd = { "FullName": ""};
      $scope.beneficialOwners.push(itemToAdd);
    }

    $scope.removeBeneficialOwner = function (itemIndex) {
      $scope.beneficialOwners.splice(itemIndex, 1);
    }

    ngDialog.openConfirm({template: 'addBeneficialOwnerDialogTemplate.html',
      className: 'ngdialog-theme-default',
		  scope: $scope
		}).then(
			function(success) {
				addBeneficialOwnersAtCompanyWithID(companyID);
			},
			function(error) {
			}
		);
  }

  function addBeneficialOwnersAtCompanyWithID(companyID) {
    $http({
      method: 'POST',
      url: 'https://companies-web-service.herokuapp.com/companies/' + companyID + '/beneficialOwners',
      headers: {
        'Content-Type': 'application/json'
      },
      data: $scope.beneficialOwners
    }).then(function successCallback(response) {
      getCompanies();
    }, function errorCallback(response) {
    });
    $scope.beneficialOwners =[];
  }

  function updateCompanyFromRowEntity(rowEntity)
  {
    var updatedCompany = 
    {
      Address: rowEntity.Address,
      City: rowEntity.City,
      Country: rowEntity.Country,
      EMail: rowEntity.EMail,
      Name: rowEntity.Name,
      PhoneNumber: rowEntity.PhoneNumber
    };
    $http({
      method: 'PUT',
      url: 'https://companies-web-service.herokuapp.com/companies/' + rowEntity.CompanyID, 
      headers: {
        'Content-Type': 'application/json'
      },
      data: updatedCompany
    }).then(function successCallback(response) {
      getCompanies();
    }, function errorCallback(response) {
    });
  }
});

    