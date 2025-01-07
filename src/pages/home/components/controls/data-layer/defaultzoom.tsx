import * as L from "leaflet";


import { PropsWithChildren, useEffect, useState } from "react";
import { useMap } from "react-leaflet";

import { TbZoomReset } from "react-icons/tb";
import { defaultZoom } from "@/pages/home/utils";
export interface Props extends L.ControlOptions, PropsWithChildren {}

export function DefaultZommControl({...props }: Props) {
  const map = useMap();

  const [elRef, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!elRef) return;
    let control: L.Control | null = null;

    if (elRef) {
      const CustomControl = L.Control.extend({ onAdd: () => elRef });
      control = new CustomControl(props);
      map.addControl(control);
    }

    return () => {
      if (control) {
        map.removeControl(control);
      }
    };
  }, [map, elRef, props]);

  return (
    <div
      ref={setRef}
      title="Default Zoom"
      className="zoom zoom-default leaflet-bar leaflet-control relative"
    >   
 
          <a
            role="button"
            className="!flex leaflet-bar-part leaflet-bar-part-single"
            onClick={() => {
              map.setView(map.getCenter(), defaultZoom);
            }}
          >
            <TbZoomReset size={15} className="m-auto" />
          </a>

    </div>
  );
}
