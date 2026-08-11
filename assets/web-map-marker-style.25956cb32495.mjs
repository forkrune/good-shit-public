export const MAP_ICON_SOURCE_SIZE_PX = 64;
export const MAP_ICON_PIXEL_RATIO = 2;
export const SELECTED_POINT_RADIUS_PX = 30;

const POINT_RADIUS_STOPS = Object.freeze([
  [3, 12],
  [10, 18],
  [16, 24]
]);

function iconSizeForRadius(radiusPx) {
  const renderedIconSizePx = MAP_ICON_SOURCE_SIZE_PX / MAP_ICON_PIXEL_RATIO;
  return (radiusPx * 2) / renderedIconSizePx;
}

export function pointCircleRadiusExpression() {
  return ['interpolate', ['linear'], ['zoom'],
    ...POINT_RADIUS_STOPS.flatMap(([zoom, radiusPx]) => [zoom, radiusPx])
  ];
}

export function pointIconSizeExpression(selectedId) {
  return ['case',
    ['==', ['get', 'id'], selectedId ?? '__none__'],
    iconSizeForRadius(SELECTED_POINT_RADIUS_PX),
    ['interpolate', ['linear'], ['zoom'],
      ...POINT_RADIUS_STOPS.flatMap(([zoom, radiusPx]) => [zoom, iconSizeForRadius(radiusPx)])
    ]
  ];
}
