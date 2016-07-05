var fD = angular.module('farmerData',['uiGmapgoogle-maps'])
    .factory('Farmers',['$q','$http',function($q,$http){

        return function(){
            var deferred = $q.defer();

            $http.get('./francesco.json').success(
            function(data) {
                var jsonData = []
                angular.forEach(data, function(value, key){
                    var item = value;
                    item.phone = item.phone.split(",")[0];

                    var icons = item.icones || '';
                    item.icones = icons.split(',')[0];
                    
                    var prod = item.produit || '';
                    item.produit = prod.split(',') || '';
                    
                    var contactName = item.contactname || '';
                    item.contactname = contactName.split(',');

                    var producttypefrench = item.producttypefrench || '';
                    item.producttypefrench = producttypefrench.split(',');
                    // item.qualitylabel = item.qualitylabel.split(',') || '';
                    // item.producttype = item.producttype.split(',') || '';
                    item.id = key;
                    jsonData.push(item);
                })
                deferred.resolve(jsonData);
            }).error(
                function(data){
                deferred.reject(new Error("Cannot load farmer data"));
                }
            ); 
            return deferred.promise;
        }
    }])

    .factory('farmerMarkers',['$q','Farmers',function($q,Farmers){

        return {
            all  : function(){
            
            var markers = [];

            var makeMarkers = function(data){ angular.forEach(data, function(value, key) {
                marker = {
                    id : value.id,
                    icon : '/icon.png',
                    latitude : value.lat,
                    longitude :value.lng,
                    title : value.contactname,
                    category : value.icones,
                    region : value.region,
                    options : {}
                }
                    markers.push(marker);
                   // console.log('Marker',marker);
                });
            };

            Farmers().then(function(data){
                makeMarkers(data);
                //return markers;
            },function(error){
                //return [];
            });
            return markers;
            
        },
        filterCategory : function(category){
            console.log(all());

        }
    }

    }])

.factory('farmerCategories',['$q','Farmers',function($q,Farmers){

        return {
            all : function(){
            
            var categories = ['All'];

            var getCategories = function(data){ 
                var _cats = [];
                angular.forEach(data,function(value, key){
                    var _cat = value.icones;
                    if(categories.indexOf(_cat) < 0){
                        categories.push(_cat);
                    }
                });
            };

            Farmers().then(function(data){
                getCategories(data);
            });
            return categories;
            
        }
    }
    }])
.factory('farmerRegions',['$q','Farmers',function($q,Farmers){

        return {
            all : function(){
            
            var regions = ['All'];

            var getRegions = function(data){ 
                var region = [];
                angular.forEach(data,function(value, key){
                    var region = value.region;
                    if(regions.indexOf(region) < 0){
                        regions.push(region);
                    }
                });
            };

            Farmers().then(function(data){
                getRegions(data);
            });
            return regions;
            
        }
    }
    }])
