import { useEffect, useMemo, useState } from "react";

export function StreetView({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const [noStreetView, setNoStreetView] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  const streetview = useMemo(() => {
    if (ref) {
      return new google.maps.StreetViewPanorama(ref, {
        position: { lat: latitude, lng: longitude },
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
      });
    }
  }, [ref, latitude, longitude]);

  useEffect(() => {
    let listener: google.maps.MapsEventListener | undefined;

    if (streetview) {
      listener = google.maps.event.addListenerOnce(
        streetview,
        "status_changed",
        () => {
          if (streetview.getStatus() !== "OK") {
            setNoStreetView(true);
          } else {
            setNoStreetView(false);
          }
        }
      );
    }

    return () => {
      listener?.remove();
    };
  }, [streetview]);

  return (
    <div className="h-full relative">
      <div ref={setRef} className="h-full"></div>

      {noStreetView ? (
        <div className="absolute inset-0 z-10 flex flex-col bg-gray-300 p-4 rounded-[inherit]">
          <p className="text-lg text-center !m-auto">
            Street View Not Available
          </p>
        </div>
      ) : null}
    </div>
  );
}
