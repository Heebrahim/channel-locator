/// <reference types="@types/google.maps" />

import * as L from "leaflet";

type MapType = "SATELLITE" | "ROADMAP" | "HYBRID" | "TERRAIN";

const GoogleLayer = L.Layer.extend({
  includes: L.Mixin.Events,

  options: {
    minZoom: 0,
    opacity: 1,
    maxZoom: 18,
    tileSize: 256,
    noWrap: false,
    attribution: "",
    errorTileUrl: "",
    subdomains: "abc",
    continuousWorld: false,
  },

  initialize: function (type: MapType, options?: L.LayerOptions) {
    L.Util.setOptions(this, options);

    this._ready = google.maps.Map != undefined;

    // @ts-ignore
    if (!this._ready) GoogleLayer.asyncWait.push(this);

    this._type = type || "SATELLITE";
  },

  onAdd: function (map: any, insertAtTheBottom: boolean) {
    this._map = map;
    this._insertAtTheBottom = insertAtTheBottom;

    this._initContainer();
    this._initMapObject();

    map.on("viewreset", this._resetCallback, this);

    this._limitedUpdate = L.Util.throttle(this._update, 150, this);

    map.on("move", this._update, this);
    //map.on('moveend', this._update, this);

    if (map._controlCorners) {
      map._controlCorners["bottomright"].style.marginBottom = "1em";
    }

    this._reset();
    this._update();
  },

  onRemove: function (map: any) {
    this._map._container.removeChild(this._container);
    //this._container = null;

    this._map.off("viewreset", this._resetCallback, this);

    this._map.off("move", this._update, this);

    if (map._controlCorners) {
      map._controlCorners["bottomright"].style.marginBottom = "0em";
    }

    //this._map.off('moveend', this._update, this);
  },

  getAttribution: function () {
    return this.options.attribution;
  },

  setOpacity: function (opacity: number) {
    this.options.opacity = opacity;

    if (opacity < 1) {
      L.DomUtil.setOpacity(this._container, opacity);
    }
  },

  setElementSize: function (e: any, size: { x: number; y: number }) {
    e.style.width = size.x + "px";
    e.style.height = size.y + "px";
  },

  _initContainer: function () {
    let tilePane = this._map._container;
    let first = tilePane.firstChild;

    if (!this._container) {
      const classNames = "leaflet-google-layer leaflet-top leaflet-left";

      this._container = L.DomUtil.create("div", classNames);

      this._container.id = "_GMapContainer_" + L.Util.stamp(this);

      this._container.style.zIndex = "auto";
    }

    tilePane.insertBefore(this._container, first);

    this.setOpacity(this.options.opacity);
    this.setElementSize(this._container, this._map.getSize());
  },

  _initMapObject: function () {
    if (!this._ready) return;

    this._google_center = new google.maps.LatLng(0, 0);

    const map = new google.maps.Map(this._container, {
      zoom: 0,
      tilt: 0,
      draggable: false,
      scrollwheel: false,
      disableDefaultUI: true,
      keyboardShortcuts: false,
      streetViewControl: false,
      center: this._google_center,
      disableDoubleClickZoom: true,
      mapTypeId: google.maps.MapTypeId[this._type as MapType],
    });

    const self = this;

    this._reposition = google.maps.event.addListenerOnce(
      map,
      "center_changed",
      function () {
        self.onReposition();
      }
    );

    // @ts-ignore
    map.backgroundColor = "#ff0000";

    this._google = map;
  },

  _resetCallback: function (e: any) {
    this._reset(e.hard);
  },

  _reset: function () {
    this._initContainer();
  },

  _update: function () {
    if (!this._google) return;

    this._resize();

    // const bounds = this._map.getBounds();
    // const ne = bounds.getNorthEast();
    // const sw = bounds.getSouthWest();

    // const google_bounds = new google.maps.LatLngBounds(
    //   new google.maps.LatLng(sw.lat, sw.lng),
    //   new google.maps.LatLng(ne.lat, ne.lng)
    // );

    const center = this._map.getCenter();
    const _center = new google.maps.LatLng(center.lat, center.lng);

    this._google.setCenter(_center);
    this._google.setZoom(this._map.getZoom());
    //this._google.fitBounds(google_bounds);
  },

  _resize: function () {
    const size = this._map.getSize();

    if (
      this._container.style.width == size.x &&
      this._container.style.height == size.y
    ) {
      return;
    }

    this.setElementSize(this._container, size);
    this.onReposition();
  },

  onReposition: function () {
    if (!this._google) return;
    google.maps.event.trigger(this._google, "resize");
  },
});

// @ts-ignore
GoogleLayer.asyncWait = [];

// @ts-ignore
GoogleLayer.asyncInitialize = function () {
  // @ts-ignore
  for (let i = 0; i < GoogleLayer.asyncWait.length; i++) {
    // @ts-ignore
    const item = GoogleLayer.asyncWait[i];

    item._ready = true;

    if (item._container) {
      item._initMapObject();
      item._update();
    }
  }

  // @ts-ignore
  GoogleLayer.asyncWait = [];
};

export { GoogleLayer };
