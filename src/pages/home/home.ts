import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { GeolocationOptions, Geolocation, Geoposition, PositionError } from "@ionic-native/geolocation";

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
    options: GeolocationOptions;
    currentPos: Geoposition;
   //pega dados via o mapa 
   @ViewChild('map') mapElement: ElementRef;
    map: any;
    places: Array<any>;

// chave api js maps google  AIzaSyB__8tHNKpQlvT6Vmvnjdebntqg7ihmcWI 
    constructor(
      public navCtrl: NavController,
      //public platform: Platform,
      private geolocation : Geolocation
    ) {
    //incluso para carregar o mapa
    }
    //metodo que vai pegar a posição do mapa do usuário
    getUserPosition(){
      this.options = {
          enableHighAccuracy : true
      };
  
      this.geolocation.getCurrentPosition(this.options).then((pos : Geoposition) => {
  
          this.currentPos = pos;  

          console.log(pos);
          this.addMap(pos.coords.latitude, pos.coords.longitude);
  
      },(err : PositionError)=>{
          console.log("error : " + err.message);
      });

    }
    ionViewDidEnter(){
        this.getUserPosition();
    }

    //criando o mapa com suas respectivas coordenadas
    addMap(lat,long){

        let latLng = new google.maps.LatLng(lat, long);

        let mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.mapTypeId.ROADMAP
        }
            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
            
        
            this.getPontoIluminacao(latLng).then((results : Array<any>)=>{
                this.places = results;
                for(let i = 0 ;i < results.length ; i++)
                {
                    this.createMarker(results[i]);
                }
            },(status)=>console.log(status));
            this.addMarker(); //chama o metodo que vai marcar o ponto no mapa
       
     }

          //adicionando o marcardo ao mapa
     addMarker(){
         
        let marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: this.map.getCenter()
        });

        let content = "<p>Está é sua posição atual!";
        let infoWindow = new google.maps.InfoWindow({
            content: content
        });

        google.maps.event.addListener(marker, 'click', () => {
            infoWindow.open(this.map, marker);
        });
     }

     //metodo para localizar os pontos de iluminação proximos
     getPontoIluminacao(latLng){
        var service = new google.maps.places.PlacesService(this.map);
        let request = {
            location : latLng,
            radius : 8047 ,
            types: ["PI"]
     };
     return new Promise((resolve,reject)=>{
        service.nearbySearch(request,function(results,status){
            if(status === google.maps.places.PlacesServiceStatus.OK)
            {
                resolve(results);    
            }else
            {
                reject(status);
            }
         });

        });
    }

    //metodo que vai criar o ponto de ilumação no mapa

    createMarker(place)
    {
        let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: place.geometry.location
        });   
    }   

  }