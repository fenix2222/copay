'use strict';

angular.module('copayApp.controllers').controller('CreateProfileController', function($scope, $rootScope, $location, notification, controllerUtils, pluginManager, identityService) {
  controllerUtils.redirIfLogged();
  $scope.retreiving = true;

  identityService.checkIdentity($scope);

  $scope.createProfile = function(form) {
    if (form && form.$invalid) {
      notification.error('Error', 'Please enter the required fields');
      return;
    }
    $scope.loading = true;
    identityService.createIdentity($scope, form);
  }

});
