import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function RedirectControl({ label, title, to }) {
  const map = useMap();
  const router = useRouter();

  useEffect(() => {
    const control = L.control({ position: 'topleft' });

    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      const button = L.DomUtil.create('a', '', div);
      button.innerHTML = label;
      button.title = title;
      button.href = '#';

      L.DomEvent.on(button, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        router.push(to);
      });

      return div;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map, router, label, title, to]);

  return null;
}
