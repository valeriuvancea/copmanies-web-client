angular.module('app', ['ui.grid', 'ui.grid.expandable', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.cellNav', 'ui.grid.moveColumns', 'ui.grid.validate', 'ngDialog'])
.controller('client', function($scope, $http, ngDialog, uiGridValidateService, uiGridConstants) {
  $scope.loading = false;

  $scope.grid = {
    appScopeProvider: this,
    enableColumnResizing: true,
    expandableRowTemplate: '<div ui-grid="row.entity.subGridOptions" style="height:150px;"></div>', 
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
    { name: 'Name', width: '10%', validators: {minLength: 1, maxLength: 30, required: true}, cellTemplate: 'ui-grid/cellTitleValidator'},
    { name: 'Address', width: '25%', validators: {minLength: 1, maxLength: 100, required: true}, cellTemplate: 'ui-grid/cellTitleValidator'},
    { 
      name: 'City', 
      width: '10%', 
      validators: 
      {
        required: true,
        maxLength: 30, 
        regexValidator: 
        {
          optional: false,
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
          optional: false,
          regex: /^[A-Z0-9][A-Z0-9.\-()\s]*$/i, 
          errorMessage: 'The field must contain only alpha-numeric and "-()" characters and must start with an alpha-numeric character!'
        }
      }, cellTemplate: 'ui-grid/cellTitleValidator'
    },
    { 
      name: 'Email',
      width: '15%', 
      validators: 
      { 
        maxLength: 256,//email max length 256 characters http://www.rfc-editor.org/errata_search.php?rfc=3696
        regexValidator: 
        {
          optional: true,
          regex: /^[A-Z0-9!#$%&'*+-/=?^_`{|}~]+@[A-Z0-9.-]+\.[A-Z]+$/i, 
          errorMessage: 'The field must contain a valid email!'
        }
      }, cellTemplate: 'ui-grid/cellTitleValidator'
    },
    { 
      name: 'PhoneNumber', 
      displayName: "Phone Number",
      width: '15%', 
      validators: 
      { 
        maxLength: 20,
        regexValidator: 
        {
          optional: true,
          regex: /^\+?[0-9][0-9\s\.]*$/, 
          errorMessage: 'The field must contain a valid phone number!'
        }
      }, cellTemplate: 'ui-grid/cellTitleValidator'
    },
  ];

  var getCompanies;
  (getCompanies = function (){
    $scope.loading = true;
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
      $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
      $scope.loading = false;
    }, function errorCallback(response) {
      $scope.loading = false;
      alert(response.data);
    });
  })();
  
  $scope.addCompany = function() { 
    ngDialog.openConfirm({template: 'addCompanyDialogTemplate.html',
      className: 'ngdialog-theme-default',
		  scope: $scope
		}).then(
			function(newCompany) {  
        $scope.loading = true;
				$http({
          method: 'POST',
          url: 'https://companies-web-service.herokuapp.com/companies',
          headers: {
            'Content-Type': 'application/json'
          },
          data: newCompany
        }).then(function successCallback(response) {
          getCompanies();
          $scope.loading = false;
        }, function errorCallback(response) {
          $scope.loading = true;
          alert(response.data);
        });
			},
			function(cancel) {
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
			function(cancel) {
			}
		);
  }

  function addBeneficialOwnersAtCompanyWithID(companyID) {
    $scope.loading = true;
    $http({
      method: 'POST',
      url: 'https://companies-web-service.herokuapp.com/companies/' + companyID + '/beneficialOwners',
      headers: {
        'Content-Type': 'application/json'
      },
      data: $scope.beneficialOwners
    }).then(function successCallback(response) {
      getCompanies();
      $scope.loading = false;
    }, function errorCallback(response) {
      $scope.loading = false;
      alert(response.data)
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
      Email: rowEntity.Email,
      Name: rowEntity.Name,
      PhoneNumber: rowEntity.PhoneNumber
    };
    $scope.loading = true;
    $http({
      method: 'PUT',
      url: 'https://companies-web-service.herokuapp.com/companies/' + rowEntity.CompanyID, 
      headers: {
        'Content-Type': 'application/json'
      },
      data: updatedCompany
    }).then(function successCallback(response) {
      getCompanies();
      $scope.loading = false;
    }, function errorCallback(response) {
      $scope.loading = false;
      alert(response.data);
    });
  }

  //adding custom validator for ui-grid edit
  uiGridValidateService.setValidator('regexValidator',
  function(validator) {
    return function(oldValue, newValue, rowEntity, colDef) {
      if (validator.optional && newValue == "")
      {
        return true;
      }
      return validator.regex.test(newValue)
    };
  },
  function(validator) {
    return validator.errorMessage;
  });


}).directive('autofocus', function () { //an angular diretive used to focus the first element of a scope
  return {
    restrict: 'A',
    link: function (scope, element) {
      element[0].focus();
    }
  };
});

    