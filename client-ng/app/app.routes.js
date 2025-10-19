(function() {
  'use strict';

  angular.module('charityApp')
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

      $routeProvider
        .when('/', {
          templateUrl: 'app/components/events-list.html',
          controller: 'EventsListCtrl',
          controllerAs: '$vm'
        })
        .when('/event/:id', {
          templateUrl: 'app/components/event-detail.html',
          controller: 'EventDetailCtrl',
          controllerAs: '$vm'
        })
        .when('/search', {
          templateUrl: 'app/components/search.html',
          controller: 'SearchCtrl',
          controllerAs: '$vm'
        })
        .when('/register/:id', {
          templateUrl: 'app/components/registration.html',
          controller: 'RegisterCtrl',
          controllerAs: '$vm'
        })
        .otherwise({ redirectTo: '/' });

    }])

    .controller('EventsListCtrl', ['$q', 'Api', function($q, Api) {
      var vm = this;
      vm.loading = true;
      vm.events = [];

      $q.when(Api.getEvents()).then(function(res) {
        vm.events = res.data;
      }).finally(function() {
        vm.loading = false;
      });
    }])

    .controller('EventDetailCtrl', ['$routeParams', '$q', 'Api', function($routeParams, $q, Api) {
      var vm = this;
      vm.loading = true;
      vm.ev = null;

      $q.when(Api.getEvent($routeParams.id)).then(function(res) {
        vm.ev = res.data;
      }).finally(function() {
        vm.loading = false;
      });
    }])

    .controller('SearchCtrl', ['$q', 'Api', function($q, Api) {
      var vm = this;
      vm.loading = false;
      vm.form = { date: '', city: '', categoryId: '' };
      vm.categories = [];
      vm.results = [];

      $q.when(Api.getCategories()).then(function(res) {
        vm.categories = res.data;
      });

      vm.search = function() {
        vm.loading = true;
        $q.when(Api.getEvents(vm.form)).then(function(res) {
          vm.results = res.data;
        }).finally(function() { vm.loading = false; });
      };

      vm.reset = function() {
        vm.form = { date: '', city: '', categoryId: '' };
        vm.results = [];
      };
    }])

    .controller('RegisterCtrl', ['$routeParams', '$q', 'Api', function($routeParams, $q, Api) {
      var vm = this;
      vm.event = null;
      vm.loading = true;
      vm.form = { user_name: '', contact_email: '', num_tickets: 1 };

      $q.when(Api.getEvent($routeParams.id)).then(function(res) {
        vm.event = res.data;
      }).finally(function() { vm.loading = false; });

      vm.submit = function() {
        if (!vm.form.user_name || !vm.form.contact_email) {
          alert('Please enter your name and email.');
          return;
        }

        var payload = {
          event_id: vm.event.id,
          user_name: vm.form.user_name,
          contact_email: vm.form.contact_email,
          num_tickets: vm.form.num_tickets
        };

        Api.createRegistration(payload).then(function() {
          alert('✅ Registration successful!');
          vm.form = { user_name: '', contact_email: '', num_tickets: 1 };
        }).catch(function(err) {
          console.error(err);
          alert('❌ Registration failed. Please try again.');
        });
      };
    }]);

})();
