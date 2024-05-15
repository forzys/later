import {forwardRef, memo} from "react"; 
import QRCode, { ErrorLevel } from '@/common/lib/qrcode'

import Svg, {
	Defs,
	G,
	Rect,
	LinearGradient,
	Stop,
	Image,
} from "react-native-svg";

const Dot = memo(({ value,  row, column, cellSize, color, logoStartCell, logoStopCell, sideCount, dotScale, dotRadius, svgDom }) => {
    if (!value) {
      return null;
    }

    const inPositioningPattern = () => {
      // Top left
      if (column <= 7 && row <= 7) {
        return true;
      }
      // Top right
      if (column >= sideCount - 8 && row <= 7) {
        return true;
      }
      // Bottom left
      if (column <= 7 && row >= sideCount - 7) {
        return true;
      }
      return false;
    };

    const inLogoArea = logoStartCell && logoStopCell && column >= logoStartCell && column < logoStopCell && row >= logoStartCell && row < logoStopCell;

 
    if (inLogoArea || inPositioningPattern()) {
      return null;
    }
 
    const size = cellSize * (dotScale || 1);
    const offset = dotScale !== 1 ? (cellSize - size) / 2 : 0;
    const x = column * cellSize + offset;
    const y = row * cellSize + offset;

    const { Rect } = svgDom;
    return (  <Rect  x={x}  y={y}  width={size} height={size} fill={color} ry={dotRadius} /> );
  }
);

function Logo({ size, logo, logoSize, svgDom }) {
  if (!logoSize) {
    return null;
  }
  const logoPosition = (size - logoSize) / 2; 
  const { Image } = svgDom; 
  return (<Image x={logoPosition} y={logoPosition} width={logoSize} height={logoSize} href={logo} />);
}

function PositionPattern({ placement, cellSize, positionColor, sideCount, positionRadius, svgDom }) {
  const innerOffset = cellSize * 2;
  const innerSize = 3 * cellSize;
  let outerSize = 7 * cellSize;
  let outerX = 0;
  let outerY = 0;

  if (placement === "top-right") {
    outerX = (sideCount - 7) * cellSize;
  } else if (placement === "bottom-left") {
    outerY = (sideCount - 7) * cellSize;
  }

  // Keep the stroke inside the box
  outerSize -= cellSize;
  const strokeCorrection = cellSize / 2;

  // Get radius values
  let outerRx = 0;
  let outerRy = 0;
  let innerRx = 0;
  let innerRy = 0;
  if (
    typeof positionRadius === "string" ||
    typeof positionRadius === "number"
  ) {
    outerRx = outerRy = innerRx = innerRy = positionRadius;
  } else if (Array.isArray(positionRadius)) {
    if (typeof positionRadius[0] === "object") {
      outerRx = positionRadius[0].rx;
      outerRy = positionRadius[0].ry;
    } else {
      outerRx = outerRy = positionRadius[0];
    }

    if (typeof positionRadius[1] === "object") {
      innerRx = positionRadius[1].rx;
      innerRy = positionRadius[1].ry;
    } else {
      innerRx = innerRy = positionRadius[1];
    }
  }

  const { G, Rect } = svgDom;
  return (
    <G>
      <Rect
        x={outerX + strokeCorrection}
        y={outerY + strokeCorrection}
        width={outerSize}
        height={outerSize}
        stroke={positionColor}
        strokeWidth={cellSize}
        rx={outerRx}
        ry={outerRy}
        fillOpacity={0}
      />
      <Rect
        x={outerX + innerOffset}
        y={outerY + innerOffset}
        width={innerSize}
        height={innerSize}
        fill={positionColor}
        rx={innerRx}
        ry={innerRy}
      />
    </G>
  );
}


const QRCoder = memo(forwardRef(({
	value = "",
	size,
	logo,
	svgDom,
	logoSize = 0,
	dotScale = 1,
	dotRadius = 0,
	color = "black",
	backgroundColor = "white",
	margin = 0,
	level = "M",
	colorGradientDirection = ["0%", "0%", "100%", "100%"],

	positionColor,
	positionRadius = 0,
	positionGradientDirection = ["0%", "0%", "100%", "100%"],
},ref) => {
	const COLOR_GRAD = "colorGradient";
	const POS_COLOR_GRAD = "positionColorGradient";

	// Set logo size
	if (logo) {
		if (!logoSize) {
			logoSize = size * 0.2;
		}
	}

	const qrcode = new QRCode(-1, ErrorLevel[level]);
	qrcode.addData(value);
	qrcode.make();
	const matrix = qrcode.modules;

	// Convert the QRCode data into a matrix of pixels

	if (!matrix.length) {
		return null;
	}
	const sideCount = matrix.length;
	const cellSize = size / sideCount;

      // Normalize Colors
	let colorGradient = [];
	let posColorGradient = [];
	if (Array.isArray(color)) {
		colorGradient = color;
		color = `url(#${COLOR_GRAD})`;
	}
	if (!positionColor) {
		positionColor = color;
	}
	if (Array.isArray(positionColor)) {
		posColorGradient = positionColor;
		positionColor = `url(#${POS_COLOR_GRAD})`;
	}
 
	if (!dotScale || dotScale > 1 || dotScale <= 0.1) {
		dotScale = 1;
	}

	let logoStartCell = -1;
	let logoStopCell = -1;
	if (logoSize && matrix.length) {
		const logoMargin = cellSize * 0.1;
		const logoCells = Math.ceil((logoSize + logoMargin) / cellSize);
		logoStartCell = Math.floor(sideCount / 2 - logoCells / 2);
		logoStopCell = sideCount - logoStartCell;
	}

    const { Svg, Defs, G, Rect, LinearGradient, Stop } = svgDom;
      return (
        <Svg
          viewBox={[
            -margin,
            -margin,
            size + margin * 2,
            size + margin * 2,
          ].join(" ")}
          width={size}
          height={size}
          ref={ref}
        >
          {/* Linear Gradient Definitions */}
          <Defs>
            {Boolean(
              colorGradient?.length && Array.isArray(colorGradientDirection)
            ) && (
              <LinearGradient
                id={COLOR_GRAD}
                x1={colorGradientDirection[0]}
                y1={colorGradientDirection[1]}
                x2={colorGradientDirection[2]}
                y2={colorGradientDirection[3]}
              >
                <Stop offset="0" stopColor={colorGradient[0]} stopOpacity="1" />
                <Stop offset="1" stopColor={colorGradient[1]} stopOpacity="1" />
              </LinearGradient>
            )}
            {Boolean(
              posColorGradient?.length &&
                Array.isArray(positionGradientDirection)
            ) && (
              <LinearGradient
                id={POS_COLOR_GRAD}
                x1={positionGradientDirection[0]}
                y1={positionGradientDirection[1]}
                x2={positionGradientDirection[2]}
                y2={positionGradientDirection[3]}
              >
                <Stop
                  offset="0"
                  stopColor={posColorGradient[0]}
                  stopOpacity="1"
                />
                <Stop
                  offset="1"
                  stopColor={posColorGradient[1]}
                  stopOpacity="1"
                />
              </LinearGradient>
            )}
          </Defs>

          {/* Background */}
          <G>
            <Rect
              x={-margin}
              y={-margin}
              width={size + margin * 2}
              height={size + margin * 2}
              fill={backgroundColor}
            />
          </G>

          {/* Placement patterns  */}
          <G>
            <PositionPattern
              placement="top-left"
              cellSize={cellSize}
              positionColor={positionColor}
              sideCount={sideCount}
              positionRadius={positionRadius}
              svgDom={svgDom}
            />
            <PositionPattern
              placement="top-right"
              cellSize={cellSize}
              positionColor={positionColor}
              sideCount={sideCount}
              positionRadius={positionRadius}
              svgDom={svgDom}
            />
            <PositionPattern
              placement="bottom-left"
              cellSize={cellSize}
              positionColor={positionColor}
              sideCount={sideCount}
              positionRadius={positionRadius}
              svgDom={svgDom}
            />
          </G>

          {/*  QRCode Data Dots */}
          <G>
            {matrix.map((rowData, row) =>
              rowData.map(
                (pixelValue, column) =>
                  Boolean(value) && (
                    <Dot
                      value={pixelValue}
                      row={row}
                      column={column}
                      cellSize={cellSize}
                      color={color}
                      logoStartCell={logoStartCell}
                      logoStopCell={logoStopCell}
                      sideCount={sideCount}
                      dotScale={dotScale || 1}
                      dotRadius={dotRadius || 0}
                      svgDom={svgDom}
                      key={`${row}-${column}`}
                    />
                  )
              )
            )}
          </G>

          {/* Logo */}
          {logo && logoSize && (
            <G>
              <Logo
                logo={logo}
                logoSize={logoSize}
                size={size}
                svgDom={svgDom}
              />
            </G>
          )}
        </Svg>
      );
    }
  )
);
  
const svgDom = {
  Svg,
  Defs,
  G,
  Rect,
  LinearGradient,
  Stop,
  Image,
};

export default forwardRef((props, ref) => {
  return <QRCoder ref={ref} {...props} svgDom={svgDom} />;
});