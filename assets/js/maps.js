var app = angular.module('app', ['uiSlider', 'ui.bootstrap']);

var Slidey = function($scope, $http){

  $scope.getMac = function() {
    $scope.needsaddr = false;
    $http.get('/mac/' + $scope.mac).then(function(result) {
      if (result.data.length == 0) {
        $scope.problem = true;
      } else {
        $scope.locs = result.data;
        $scope.timeidx = $scope.locs.length - 1;
        $scope.updateMarkers();
      }
    });
  }

  $scope.needsaddr = true;

  $scope.askQuestions = function() {
    $scope.questions = true;
  }

  $scope.replyQuestions = function() {
    $scope.questions = false;
    $http.post('/questions/' + $scope.mac, {
      creepy: $scope.creepy,
      gov: $scope.gov,
      others: $scope.others,
      warrant: $scope.warrant
    }).then(function(result) {
      console.log(result.data);
    });
  }
  
  function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(41.3111, -72.9267),
        zoom: 17 
    };
    $scope.map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    var infowindow = new google.maps.InfoWindow({});
    
    $scope.CEID = new google.maps.Marker({
        position: new google.maps.LatLng(41.312508, -72.925242),
        title:"CEID"
    }); 

    $scope.WOOLSEY = new google.maps.Marker({
        position: new google.maps.LatLng(41.311823, -72.926014),
        title:"Woolsey Hall"
    });

    $scope.OC = new google.maps.Marker({
        position: new google.maps.LatLng(41.308894, -72.928706),
        title:"Old Campus"
    });

    google.maps.event.addListener($scope.WOOLSEY, 'click', function() {
      infowindow.setContent('<div id="content">You were in Woolsey Hall at ' + $scope.locs[$scope.timeidx].time + '</div>');
      infowindow.open($scope.map, $scope.WOOLSEY);
    });

    google.maps.event.addListener($scope.CEID, 'click', function() {
      infowindow.setContent('<div id-"content"> You were in the CEID at ' + $scope.locs[$scope.timeidx].time + '</div>');
      infowindow.open($scope.map, $scope.CEID);
    });

    google.maps.event.addListener($scope.OC, 'click', function() {
      infowindow.setContent('<div id="content"> You were on Old Campus at ' + $scope.locs[$scope.timeidx].time + '</div>');
      infowindow.open($scope.map, $scope.OC);
    });

  }

  google.maps.event.addDomListener(window, 'load', initialize);
  
  $scope.updateMarkers = function() {
    if (!$scope.locs) return;
    var info = $scope.locs[$scope.timeidx];
    if ($scope[info.loc]) {
      if ($scope.prev) $scope.prev.setMap(null);
      $scope[info.loc].setMap($scope.map);    
      $scope.prev = $scope[info.loc];
    }
  }
}

Slidey.$inject = ['$scope', '$http'];
