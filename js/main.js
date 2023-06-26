const office = { lat: 37.727623143379745, lng: -122.47726223558236 };

(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})
({key: "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg", v: "weekly"});

const FOOD_TRUCK_DATA = "https://data.sfgov.org/api/views/rqzj-sfat/rows.json";

function createSurpriseButton(map, markers) {
  const button = document.createElement('button');

  button.style.backgroundColor = '#fff';
  button.style.border = '2px solid #fff';
  button.style.borderRadius = '3px';
  button.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  button.style.color = 'rgb(25,25,25)';
  button.style.cursor = 'pointer';
  button.style.fontFamily = 'Roboto,Arial,sans-serif';
  button.style.fontSize = '16px';
  button.style.lineHeight = '38px';
  button.style.margin = '8px 0 22px';
  button.style.padding = '0 5px';
  button.style.textAlign = 'center';

  button.textContent = 'Surprise me';
  button.title = 'Choose a random truck';
  button.type = 'button';

  button.addEventListener('click', () => {
    const randomIndex = (Math.floor(Math.random() * markers.length));
    new google.maps.event.trigger(markers[randomIndex], 'click' );
  });

  const centerButtonDiv = document.createElement('div');
  centerButtonDiv.appendChild(button);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerButtonDiv);
}

async function addMarker(map, infoWindow, title, position, content) {
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const marker = new AdvancedMarkerElement({
    map,
    title: title,
    position: position,
    content: content
  });

  marker.addListener("click", () => {
    infoWindow.close();
    infoWindow.setContent(marker.title);
    infoWindow.open(marker.map, marker);
  });

  return marker;
}

function distanceCompare(t1, t2) {
  const location1 = t1[31];
  const lat1 = parseFloat(location1[1]);
  const lng1 = parseFloat(location1[2]);
  const distance1 = (office.lat - lat1)**2 + (office.lng - lng1)**2;

  const location2 = t2[31];
  const lat2 = parseFloat(location2[1]);
  const lng2 = parseFloat(location2[2]);

  const distance2 = (office.lat - lat2)**2 + (office.lng - lng2)**2;

  return (distance1 < distance2) ? -1 : 1;
}
document.addEventListener('DOMContentLoaded', function () {
  async function initMap() {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { PinElement } = await google.maps.importLibrary("marker");

    const map = new Map(document.getElementById("map"), {
      center: office,
      zoom: 12,
      mapId: "1"
    });
    const infoWindow = new InfoWindow();
    const markers = [];

    $.getJSON(FOOD_TRUCK_DATA, (trucks) => {
      trucks.data.sort(distanceCompare).forEach((truck, i) => {
        const title = `${i} - truck[9]`
        const address = truck[13];
        const location = truck[31];
        const lat = parseFloat(location[1]);
        const lng = parseFloat(location[2]);

        addMarker(
          map,
          infoWindow,
          `${title}<br>${address}`,
          {lat, lng},
          new PinElement().element
        ).then((marker) => markers.push(marker));
      });

      addMarker(map, infoWindow, 'Office', office, new PinElement({
        glyphColor: "white",
        background: "#0000FF",
        borderColor: "#FFFFFF",
        title: "Office",
        scale: 2
      }).element);

      createSurpriseButton(map, markers);
    });

  }
  initMap();
});
