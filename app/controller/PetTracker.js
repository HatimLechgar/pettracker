/*
 * File: app/controller/PetTracker.js
 *
 * This file was generated by Sencha Architect version 2.0.0.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Sencha Touch 2.0.x library, under independent license.
 * License of Sencha Architect does not include license for Sencha Touch 2.0.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('MyApp.controller.PetTracker', {
    extend: 'Ext.app.Controller',
    markers: [],
    directionsDisplay: null,
    directionsService: null,
    config: {
        stores: ['PetTracker'],
        refs: {
            petListPanel: 'petListPanel',
            petList: '#PetList',
            petMap: 'petMap',
            radiusPicker: 'radiusPicker'
        },
        control: {
            petListPanel: {
                petSelectCommand: "onPetSelected"
            },
            petMap: {
                backButton: "onBackButton",
                mapRender: "onMapRender",
                nearButton: "onNear"
            },
            radiusPicker: {
                pickerChanged: "onPickerRadiusChange"
            }
        }
    },
    launch: function() {
        // Initialize Google Map Services
        this.directionsDisplay = new google.maps.DirectionsRenderer();
        this.directionsService = new google.maps.DirectionsService();

        var mapRendererOptions = {
            //draggable: true,  //Allows to drag route
            //hideRouteList: true,
            suppressMarkers: true
        };

        this.directionsDisplay.setOptions(mapRendererOptions);
    },

    // Transitions
    slideLeftTransition: { type: 'slide', direction: 'left' },
    slideRightTransition: { type: 'slide', direction: 'right' },

    onPetSelected: function (list, record) {
        var mapView = this.getPetMap();
        mapView.setRecord(record);
        Ext.Viewport.animateActiveItem(mapView, this.slideLeftTransition);

        this.renderMap(mapView, mapView.down("#petMap").getMap(), record.data);
    },

    onBackButton: function () {
        console.log("Back to home");
        var store = Ext.getStore('PetTracker');
        store.getProxy().setUrl('http://nodetest-loutilities.rhcloud.com/dogtag/');
        store.load();
        Ext.Viewport.animateActiveItem(this.getPetListPanel(), this.slideRightTransition);
    },

    onNear: function() {
        this.getRadiusPicker().show();
    },
    onPickerRadiusChange: function(picker, pickerValue) {
        var store = Ext.getStore('PetTracker');
        var gmap = this.getPetMap().down("#petMap");
        var geo = gmap.getGeo();
        var g_marks = this.markers;
        store.getProxy().setUrl('http://nodetest-loutilities.rhcloud.com/dogtag/'
            + geo.getLongitude() + '/' + geo.getLatitude() + '/' + pickerValue["radius"]);
        store.load({
              callback: function (records, options, success) {
                  if (records.length > 0) {
                      Ext.each(records, function (record) {
                          var p = new google.maps.LatLng(record.data.latitude, record.data.longitude);
                          var m = new google.maps.Marker({
                              position: p,
                              title: record.data.name + "'s Location",
                              animation: google.maps.Animation.DROP,
                              map: gmap.getMap()
//                              icon: 'resources/img/brown_markerD.png'
                          });
                          g_marks.push(m);
                      });
                  }
              }
        });

    },

    renderMap: function (extmap, map, record) {
        // erase old markers
        if (this.markers.length > 0) {
            Ext.each(this.markers, function (marker) {
                marker.setMap(null);
            });
        }

        var position = new google.maps.LatLng(record.latitude, record.longitude);

        var dynaMarker = new google.maps.Marker({
            position: position,
            title: record.name + "'s Location",
            map: map,
            icon: 'resources/img/yellow_MarkerB.png'
        });

        this.markers.push(dynaMarker);

        var infowindow = new google.maps.InfoWindow({
            content: "We've found your dog sniffing flowers!"
        });

        google.maps.event.addListener(dynaMarker, 'click', function () {
            infowindow.open(map, dynaMarker);
        });

        setTimeout(function () {
            map.panTo(position);
        }, 1000);

        var geo = extmap.down("#petMap").getGeo();
        var currentPosition = new google.maps.LatLng(geo.getLatitude(), geo.getLongitude());
        this.plotRoute(map, currentPosition, position);

        // stop updates to center
        geo.suspendUpdates();
    },

    plotRoute: function (map, orig, dest) {
        this.directionsDisplay.setMap(map);

        var dd = this.directionsDisplay;

        var selectedMode = "WALKING"; // DRIVING, WALKING, BICYCLING
        var request = {
            origin: orig,
            destination: dest,
            travelMode: google.maps.TravelMode[selectedMode]
        };
        this.directionsService.route(request, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                dd.setDirections(response);
            }
        });

    }
});