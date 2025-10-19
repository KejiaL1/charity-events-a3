(function() {
  'use strict';

  angular.module('charityApp')
    .factory('Api', ['$http', function($http) {
      var API = window.API_BASE;

      function toQuery(params) {
        if (!params) return '';
        var search = Object.keys(params)
          .filter(function(k){ return params[k]; })
          .map(function(k){ return encodeURIComponent(k)+'='+encodeURIComponent(params[k]); })
          .join('&');
        return search ? ('?'+search) : '';
      }

      return {
        getEvents: function(filters){ return $http.get(API + '/events' + toQuery(filters)); },
        getEvent:  function(id){ return $http.get(API + '/events/' + id); },
        getCategories: function(){ return $http.get(API + '/categories'); },

        createRegistration: function(payload){ return $http.post(API + '/registrations', payload); }
      };
    }]);

})();
