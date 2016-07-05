        angular.module('appMaps', ['uiGmapgoogle-maps','farmerData','duScroll','localytics.directives'])

          .config(function (uiGmapGoogleMapApiProvider) {
            uiGmapGoogleMapApiProvider.configure({
              key: 'AIzaSyAFOD7JoFsOGfwtR1dCyj0nizxzebMqQvY',
              v: '3.18',
              libraries : 'geometry'
            });
          })
            .value('duScrollOffset', 70)
            .value('duScrollEasing', EasingFunctions.easeInOutQuad )

          .factory("GeolocationService", ['$q', '$window', '$rootScope',function ($q, $window, $rootScope) {
            return function () {
                var deferred = $q.defer();

                if (!$window.navigator) {
                    $rootScope.$apply(function() {
                        deferred.reject(new Error("Geolocation is not supported"));
                    });
                } else {
                    $window.navigator.geolocation.getCurrentPosition(function (position) {
                        $rootScope.$apply(function() {
                            deferred.resolve(position);
                        });
                    }, function (error) {
                        $rootScope.$apply(function() {
                            deferred.reject(error);
                        });
                    });
                }

                return deferred.promise;
            }
        }]) 
         .controller('mainCtrl', ['$scope','$rootScope', '$http','$document', 'GeolocationService', 'Farmers','farmerMarkers','farmerCategories','farmerRegions', 'uiGmapIsReady',
                function($scope, $rootScope, $http, $document, GeolocationService, Farmers, farmerMarkers, farmerCategories, farmerRegions, uiGmapIsReady) {
             

            //$scope.categories = farmerCategories.all(); //['All'];
            $scope.selectedCategory = $scope.selectedRegion = 'All';
            // $scope.selectedRegion = 'lorraine';

            // getting Farmers data and categories.
            Farmers().then(function(data){
                $scope.categories = farmerCategories.all();
                $scope.regions = farmerRegions.all();
                $scope.Farmers = data;
            });
            
            // track which event is active
            $scope.activeEvent = "SCROLL"; //"CLICK";

            $scope.map = {
                center: {latitude: 49.4116, longitude: 5.6319}, //6.1319
                zoom: 10, 
                control : {},
                options : {
                    disableDefaultUI: true,
                    overviewMapControl : false,
                    panControl : false,
                    zoomControl: false,
                    rotateControl : false,
                    scrollwheel: false
                }
            }
                uiGmapIsReady.promise().then(function (instances) {
                    $scope.map.control.getGMap().setOptions({
                    disableDefaultUI: true,
                    overviewMapControl : false,
                    panControl : false,
                    zoomControl: true,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.LARGE,
                        position: google.maps.ControlPosition.RIGHT_CENTER
                    },
                    rotateControl : false,
                    scrollwheel: false
                });
                   
                   $rootScope.$on('duScrollspy:becameActive', function($event, $element){
                        var farmerid = $element.data('farmerid') || 0;
                        console.log(farmerid, " became active");
                        if($scope.map.markers[farmerid]){                    
                            $(window).scrollStopped(function(){
                            $scope.$apply(function(){
                                
                            if($scope.activeEvent === "SCROLL"){
                                var previousScrolledMarker = _.filter($scope.map.markers, {'options' : { 'zIndex' : 9998} } );

                                if(previousScrolledMarker.length > 0){
                                    _.forEach(  previousScrolledMarker, function(n, key){
                                        $scope.map.markers[previousScrolledMarker[key].id].options.zIndex = null;                            
                                        $scope.map.markers[previousScrolledMarker[key].id].icon = "./icon.png";
                                    });

                                }
                                    $scope.map.markers[farmerid].options.zIndex = 9998;


                                var weight = $scope.map.control.getGMap().getZoom();
                                $scope.map.control.getGMap().panTo({lat: ($scope.map.markers[farmerid].latitude - (.5 * (Math.log10(weight)/10))) ,lng: ($scope.map.markers[farmerid].longitude - (.5 * (Math.log10(weight)/10) )) });
                                
                            

                                $scope.map.markers[farmerid].icon = "./icon-active.png";
                                // if(farmerid > 1){
                                //     console.log(farmerid);
                                //     $document.scrollToElement($element, 70, 800);
                                // }

                            }else{

                            }

                            });



                            });
                        }
                        if($scope.map.markers[$scope.activeFarmer]){
                            $scope.$apply(function(){
                                //$scope.map.markers[$scope.activeFarmer].icon = "./icon.png";
                            })
                    }

                $scope.activeFarmer = farmerid || -1;
            }); 

                })

            $scope.map.markers = farmerMarkers.all();

            $scope.map.markerEvents = {
                                click : function(marker, eventName, model, arguments) {
                                            
                                            $scope.activeEvent = "CLICK";   
                                            
                                            var someElement = angular.element(document.getElementById('card' + marker.model.id));
                                            var scrollPromise = $document.scrollToElement(someElement, 70, 800);
                                            var previousClickedMarker = _.filter($scope.map.markers, {'options' : { 'zIndex' : 9998} } );
                                            if(previousClickedMarker.length > 0){
                                                $scope.map.markers[previousClickedMarker[0].id].options.zIndex = null;                            
                                                $scope.map.markers[previousClickedMarker[0].id].icon = "./icon.png";                            
                                            }
                                            marker.model.options.zIndex = 9998;
                                            $scope.map.markers[marker.model.id].icon = "./icon-active.png";
                                            var weight = $scope.map.control.getGMap().getZoom();
                                            $scope.map.control.getGMap().panTo({lat: ($scope.map.markers[marker.model.id].latitude - (.5 * (Math.log10(weight)/10))) ,lng: ($scope.map.markers[marker.model.id].longitude - (.5 * (Math.log10(weight)/10)) ) });
                                    },
                                mouseover : function(marker, eventName, model, arguments){
                                    var previousMarker = _.filter($scope.map.markers, {'options' : { 'zIndex' : 9999} } );
                                    if(previousMarker.length > 0){
                                        $scope.map.markers[previousMarker[0].id].options.zIndex = null;                            
                                    }
                                    marker.model.options.zIndex = 9999;
                                }    
                                };


           // $document.on('scroll', function() {
              
           //  });          
            // private variable to hold all the farmerMarkers. 
            var _markers = farmerMarkers.all();

            // $scope.message = "Determining gelocation...";

            // GeolocationService().then(function (position) {
            //     $scope.position = position;
            //     console.log($scope.position);
            //    $scope.map = {center: {latitude: $scope.position.coords.latitude, longitude: $scope.position.coords.longitude}, zoom: 10 };
            //    $scope.options = {scrollwheel: true};
                
            // }, function (reason) {
            //     $scope.message = "Could not be determined."
            // });
            
                

            // filtering Categories for unique elements
             // var getCategories = function(data){ 
             //            var _cats = [];
             //            angular.forEach(data,function(value, key){
             //                var _cat = value.icones;
             //                if($scope.categories.indexOf(_cat) < 0){
             //                    $scope.categories.push(_cat);
             //                }
             //            });
             //        };


             // Events //
             $document.on('mousewheel', function() {
              $scope.activeEvent = "SCROLL";
///              console.log("SCROLLING WITH WHEEL");
            });

             $document.on('keydown', function($event){
                if( $event.keyCode === 32){
                    $scope.activeEvent = "SCROLL";     
                }
                if( $event.keyCode === 37){
                    //console.log("Prev")

                }
                if( $event.keyCode === 39){
                    //console.log("Next")
                }
                 
             })
            // udpating the markers on the map
            $scope.updateMarkers = function(){
                

                if($scope.selectedCategory === 'All' && $scope.selectedRegion === 'All'){
                    $scope.map.markers = farmerMarkers.all();           
                }
                else{
                    var selector = {};
                    if($scope.selectedCategory && $scope.selectedCategory !== 'All'){
                        selector.category = $scope.selectedCategory;
                    }
                    if($scope.selectedRegion && $scope.selectedRegion !== 'All'){
                         selector.region = $scope.selectedRegion;
                    }
                    $scope.map.markers = _.select(_markers, selector);
                }
            }

            $scope.farmerInfo = $scope.Farmers;
            // updating th farmerCards
            var updateFarmerCard = function(marker){
                var res = _.select($scope.Farmers,{lat : marker.latitude, lon : marker.longitude })
                $scope.farmerInfo = res;
                // console.log('farmerInfo',$scope.farmerInfo);
                for (var key in res) {
                    var obj = res[key];
                    for (var prop in obj) {
                        if(obj.hasOwnProperty(prop)){
                            // console.log(prop + " = " + obj[prop]);
                        }
                    }
                }
            }


                
            }]);   