(function() {
  'use strict';

  angular.module('charityApp')

    .filter('hero', function() {
      return function(ev) {
        if (!ev) return '';
        if (ev.hero_image_url && ev.hero_image_url.trim() !== '') return ev.hero_image_url;
        return 'assets/img/placeholder-16x9.jpg';
      };
    })

    .filter('isEnded', function() {
      return function(endStr) {
        if (!endStr) return false;
        var t = Date.parse(endStr);
        return isNaN(t) ? false : (t < Date.now());
      };
    })

    .filter('dateTime', function() {
      return function(dtStr) {
        if (!dtStr) return '';
        var d = new Date(dtStr);
        var pad = function(n){return n<10?('0'+n):n;};
        return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+
               ' '+pad(d.getHours())+':'+pad(d.getMinutes());
      };
    })

    .filter('price', function() {
      return function(cents, isFree) {
        if (isFree || Number(cents) === 0) return 'Free';
        var dollars = Number(cents || 0) / 100;
        return '$' + dollars.toFixed(2);
      };
    });

})();
