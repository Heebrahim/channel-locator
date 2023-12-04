import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BiCurrentLocation } from "react-icons/bi";

type FormProps = React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>;

export function Search({
  onSubmit,
  onAutocomplete,
  onCurrentLocation,
  google_maps_loaded,
}: {
  google_maps_loaded: boolean;
  onCurrentLocation: () => void;
  onAutocomplete: (latlng: google.maps.LatLng) => void;
} & Pick<FormProps, "onSubmit">) {
  const [searchInput, setSearchInput] = useState<HTMLInputElement | null>(null);

  const autocomplete = useMemo(() => {
    if (google_maps_loaded && searchInput) {
      return new google.maps.places.Autocomplete(searchInput, {
        componentRestrictions: { country: "NG" },
      });
    }

    return null;
  }, [searchInput, google_maps_loaded]);

  const handleAutocomplete = useCallback(() => {
    pipe(
      O.fromNullable(autocomplete),
      O.map((_) => _.getPlace()),
      O.flatMap((place) => O.fromNullable(place.geometry)),
      O.flatMap((geometry) => O.fromNullable(geometry.location)),
      O.map(onAutocomplete)
    );
  }, [onAutocomplete, autocomplete]);

  useEffect(() => {
    let listener: google.maps.MapsEventListener | undefined;

    if (autocomplete) {
      listener = autocomplete.addListener("place_changed", handleAutocomplete);
    }

    return () => {
      listener?.remove();
    };
  }, [autocomplete, handleAutocomplete]);

  return (
    <form onSubmit={onSubmit}>
      <InputGroup variant="filled">
        <Input
          name="query"
          type="search"
          variant="filled"
          ref={setSearchInput}
          className="search-field-intro"
          placeholder="Address, State, Landmark, Lat-Lng..."
        />

        <InputRightElement>
          <IconButton
            type="button"
            colorScheme="gray"
            onClick={onCurrentLocation}
            className="search-field-auto-intro"
            aria-label="Search using my location"
            icon={<BiCurrentLocation size={20} />}
          />
        </InputRightElement>
      </InputGroup>
    </form>
  );
}
