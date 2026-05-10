import { useEffect } from "react";
import { useMap } from "react-leaflet";

const FlyToLocation = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(location, 15);
    }
  }, [location, map]);

  return null;
};

export default FlyToLocation;