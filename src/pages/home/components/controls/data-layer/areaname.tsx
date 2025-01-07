import * as L from "leaflet";

import style from "./style.module.css";

import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { PropsWithChildren, useEffect, useState } from "react";
import { useMap } from "react-leaflet";

import { IoMap } from "react-icons/io5";

export interface Props extends L.ControlOptions, PropsWithChildren {}

export function DataLayerControlForAreaName({ children, ...props }: Props) {
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
      title="Socio-economic data"
      className="data-layers leaflet-bar leaflet-control relative data-layers-intro_"
    >
      <Popover placement="left-start" closeOnBlur={false}>
        <PopoverTrigger>
          <a
            role="button"
            className="!flex leaflet-bar-part leaflet-bar-part-single"
          >
            <IoMap size={15} className="m-auto" />
          </a>
        </PopoverTrigger>

        <PopoverContent className={style.popup}>
          <PopoverBody>{children}</PopoverBody>
        </PopoverContent>
      </Popover>
    </div>
  );
}
