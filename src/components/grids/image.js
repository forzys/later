import React, { createContext, useContext, useState } from 'react';
import { Image as RNImage, Text,  View, StyleSheet, TouchableOpacity } from 'react-native';
import configs from '@/common/configs'  
import Icon from '@/common/components/Icon'  
const { width, height } = configs.screen
const COLOR_GREY = '#323232';

const Image = (props) => {
  const { image, imageStyle, index } = props;
  const {
    sourceKey,
    activeOpacity,
    onPressImage,
    imageProps,
    remain,
    length,
    backgroundMask,
    numberRemainStyle,
    backgroundMaskVideo,
    videoIconStyle,
    videoKey,
    conditionCheckVideo,
    width,
    colorLoader,
    videoURLKey,
    emptyImageSource,
    componentDelete,
    showDelete,
    onDeleteImage,
    prefixPath,
    data,
    backgroundColorKey, 
  } = useContext(ImageGridContext);
  const isVideo = image?.[videoKey] === conditionCheckVideo;
  const uri =
    prefixPath +
    (typeof image === 'string'
      ? image
      : isVideo
      ? image[videoURLKey]
      : image[sourceKey]) ;
  const size =
    index === 0
      ? Math.round(width / 7)
      : index === 1 && length === 2
      ? Math.round(width / 9)
      : Math.round(width / (index + length * 2));

  const handleBackgroundColor = () => {
    const color = data?.[index]?.[backgroundColorKey];
    if (color && typeof color === 'string') {
      return color;
    }
    if (typeof colorLoader === 'string') {
      return colorLoader;
    }
    if (typeof colorLoader === 'object') {
      if (colorLoader.length > 1) {
        const random = Math.floor(Math.random() * colorLoader.length);
        return colorLoader[random];
      }
      return colorLoader[0];
    }
    return COLOR_GREY;
  };

  const backgroundColor = handleBackgroundColor();

  const [isError, setError] = useState(false);

  const onPress = () => {
    onPressImage(image, index);
  };

  const onError = () => {
    setError(true);
    imageProps?.onError();
  };

  const onDelete = () => {
    if (isError) {
      setError(false);
    }
    onDeleteImage(image, index);
  };

  return (
    <TouchableOpacity
      style={[style?.container, imageStyle]}
      onPress={onPress}
      activeOpacity={activeOpacity}
    >
      <View style={{ backgroundColor }}>
        <RNImage
          {...imageProps}
          source={isError ? emptyImageSource : { uri }}
          style={imageStyle}
          onError={onError}
          resizeMode={'cover'}
        />
      </View>
      {isVideo && (remain === 0 || index !== length - 1) && (
        <View style={[style.overlay, { backgroundColor: backgroundMaskVideo }]}>
           
          <Icon 
            style={[ style.videoIcon, { width: size },videoIconStyle ]}
            Icon="play"
            color="#FFF"
          /> 

        </View>
      )}
      {remain > 0 && index === length - 1 && (
        <View style={[style.overlay, { backgroundColor: backgroundMask }]}>
          <Text
            style={[
              style.titleRemain,
              {
                fontSize: size,
              },
              numberRemainStyle,
            ]}
          >
            +{remain}
          </Text>
        </View>
      )}
      {showDelete &&
        (componentDelete || (
          <View style={style.componentDelete}>
            <TouchableOpacity
              style={style.buttonDelete}
              activeOpacity={activeOpacity}
              onPress={onDelete}
            >

              <Icon
                name="delete"
                style={style.deleteImage}
                color={'#fff'}
              />
            </TouchableOpacity>
          </View>
        ))}
    </TouchableOpacity>
  );
}; 
 
Image.defaultProps = {};
 
const LAYOUT_ROW = 'row';
const LAYOUT_ROW_SQUARE = 'row_square';
const LAYOUT_COLUMN = 'column';

const checkLayoutImage = (data, length, widthKey, heightKey) => {
  if (length >= 2) {
    const firstItem = data[0];
    if (
      typeof firstItem === 'string' ||
      !firstItem?.[widthKey] ||
      !firstItem?.[heightKey]
    ) {
      if (length === 5) {
        return LAYOUT_COLUMN;
      }
      return LAYOUT_ROW;
    }
    let isLandscapeFirst = checkLandscape(firstItem, widthKey, heightKey); // mean: is Reactangle Horizontal First Item
    switch (length) {
      case 2:
        const secondItem = data[1];
        let isLandscapeSecond = checkLandscape(secondItem, widthKey, heightKey); // mean: is Reactangle Horizontal Second Item
        if (isLandscapeFirst && isLandscapeSecond) {
          return LAYOUT_COLUMN;
        }
        if (isLandscapeFirst !== isLandscapeSecond) {
          return LAYOUT_ROW_SQUARE;
        }
        return LAYOUT_ROW;
      case 3:
      case 4:
        if (isLandscapeFirst) {
          return LAYOUT_COLUMN;
        }
        return LAYOUT_ROW;
      default:
        return LAYOUT_COLUMN;
    }
  }
};

const checkLandscape = (data, widthKey, heightKey) => {
  const width = Number(data[widthKey]);
  const height = Number(data[heightKey]);
  if (width > height) {
    return true;
  }
  return false;
};

 
const One = () => {
  const {
    data,
    width,
    heightKey,
    widthKey,
    ratioImagePortrait,
    ratioOneLandscape,
  } = useContext(ImageGridContext);

  const handleStyle = () => {
    let heightShape = width;
    let widthShape = width;
    const widthImage = Number(data[0][widthKey]);
    const heightImage = Number(data[0][heightKey]);
    if (!Number.isNaN(widthImage) && !Number.isNaN(heightImage)) {
      let ratio = widthImage / heightImage;
      if (heightImage > widthImage) {
        ratio = heightImage / widthImage;
        heightShape =
          ratio > ratioImagePortrait
            ? width * ratioImagePortrait
            : ratio * width;
      } else if (widthImage > heightImage) {
        ratio = widthImage / heightImage;
        heightShape =
          ratio > ratioOneLandscape ? width / ratioOneLandscape : width / ratio;
      }
    }
    return {
      width: widthShape,
      height: heightShape,
    };
  };

  return (
    <View style={[{ justifyContent: 'space-between'}, handleStyle()]}>
      <Image key={0} image={data[0]} index={0} imageStyle={handleStyle()} />
    </View>
  );
};
  

const Two = ({ layoutProps, dataProps }) => {
  const { data: dataMain, width, layout: layoutMain, spaceSize } = useContext(
    ImageGridContext
  );

  const data = dataProps || dataMain;
  const layoutChange = layoutProps || layoutMain;
  const layout = layoutProps || layoutChange.match('row') ? 'row' : 'column';
  const widthCommon = width / 2 - spaceSize / 2;

  const handleStyle = () => {
    let widthShape = widthCommon;
    let heightShape = width;

    switch (layoutChange) {
      case LAYOUT_ROW_SQUARE:
        widthShape = widthCommon;
        heightShape = widthCommon;
        break;
      case LAYOUT_COLUMN:
        widthShape = width;
        heightShape = widthCommon;
        break;
      default:
    }
    return {
      width: widthShape,
      height: heightShape,
    };
  };

  return (
    <View
      style={[
        {justifyContent: 'space-between'},
        {
          width,
          height: layoutChange === LAYOUT_ROW_SQUARE ? widthCommon : width,
          flexDirection: layout,
        },
      ]}
    >
      {data.map((item, index) => {
        return (
          <Image
            key={index}
            image={item}
            index={index}
            imageStyle={handleStyle()}
          />
        );
      })}
    </View>
  );
};

const Three = () => {
  const { data, width, layout, spaceSize, length } = useContext(
    ImageGridContext
  );
  const subLayout = layout === LAYOUT_ROW ? LAYOUT_COLUMN : LAYOUT_ROW;

  const commonSize = width / 2 - spaceSize / 2;

  const handleStyleMain = () => {
    let widthShape = commonSize;
    let heightShape = width;
    if (layout === LAYOUT_COLUMN) {
      widthShape = width;
      heightShape = commonSize;
    }
    return {
      width: widthShape,
      height: heightShape,
    };
  };

  const handleStyleSub = () => {
    const style = {
      width: commonSize,
      height: commonSize,
    };
    return style;
  };

  return (
    <View
      style={[{justifyContent: 'space-between'}, { width, height: width, flexDirection: layout }]}
    >
      <View>
        <Image index={0} image={data[0]} imageStyle={handleStyleMain()} />
      </View>
      <View style={[style.container, { flexDirection: subLayout }]}>
        {[...data].splice(1, length).map((item, index) => {
          return (
            <Image
              key={index}
              image={item}
              index={index + 1}
              imageStyle={handleStyleSub()}
            />
          );
        })}
      </View>
    </View>
  );
};

 
const Four = () => {
  const { data, width, layout, spaceSize, length } = useContext(
    ImageGridContext
  );
  const subLayout = layout === LAYOUT_ROW ? LAYOUT_COLUMN : LAYOUT_ROW;

  const commonSize = width / 3 - (spaceSize * 2) / 3;
 

  const handleStyleMain = () => {
    let widthShape = width - commonSize - spaceSize;
    let hightShape = width;
    if (layout === LAYOUT_COLUMN) {
      widthShape = width;
      hightShape = width - commonSize - spaceSize;
    }
    return {
      width: widthShape,
      height: hightShape,
    };
  };

  return (
    <View
      style={[{justifyContent: 'space-between'}, { width, height: width, flexDirection: layout }]}
    >
      <View>
        <Image index={0} image={data[0]} imageStyle={handleStyleMain()} />
      </View>
      <View style={[style.container, { flexDirection: subLayout }]}>
        {[...data].splice(1, length).map((item, index) => {
          return (
            <Image
              key={index}
              image={item}
              index={index + 1}
              imageStyle={{
                width: commonSize,
                height: commonSize,
              }}
            />
          );
        })}
      </View>
    </View>
  );
};
 

const Five = () => {
  const { data, width, spaceSize, length } = useContext(ImageGridContext);

  const commonSize = width / 3 - (spaceSize * 2) / 3;

  return (
    <View
      style={[
        {justifyContent: 'space-between'},
        {
          width,
        },
      ]}
    >
      <Two dataProps={[...data].splice(0, 2)} layoutProps={LAYOUT_ROW_SQUARE} />
      <View
        style={[
          {justifyContent: 'space-between'},
          { flexDirection: 'row', marginTop: spaceSize },
        ]}
      >
        {[...data].splice(2, length).map((item, index) => {
          return (
            <Image
              key={index}
              image={item}
              index={index + 2}
              imageStyle={{
                width: commonSize,
                height: commonSize,
              }}
            />
          );
        })}
      </View>
    </View>
  );
};
 
const Six = () => {
  const { data, width, spaceSize, length } = useContext(ImageGridContext);

  const commonSubSize = width / 3 - (spaceSize * 2) / 3;
  const commonSize = width - commonSubSize - spaceSize;
 

  const handleStyleMain = () => {
    const style = {
      width: commonSize,
      height: commonSize,
    };
    return style;
  };

  const handleStyleSub = () => {
    const style = {
      width: commonSubSize,
      height: commonSubSize,
    };
    return style;
  };

  return (
    <View
      style={[
        {justifyContent: 'space-between'},
        {
          width,
          height: commonSize + commonSubSize + spaceSize,
        },
      ]}
    >
      <View style={[{justifyContent: 'space-between'}, { flexDirection: 'row' }]}>
        <Image image={data[0]} imageStyle={handleStyleMain()} index={0} />
        <View style={[{justifyContent: 'space-between'}, { flexDirection: 'column' }]}>
          {[...data].splice(1, 2).map((item, index) => {
            return (
              <Image
                key={index}
                image={item}
                index={index + 1}
                imageStyle={handleStyleSub()}
              />
            );
          })}
        </View>
      </View>
      <View style={[{justifyContent: 'space-between'}, { flexDirection: 'row' }]}>
        {[...data].splice(3, length).map((item, index) => {
          return (
            <Image
              key={index}
              image={item}
              index={index + 3}
              imageStyle={handleStyleSub()}
            />
          );
        })}
      </View>
    </View>
  );
};

 
const Grid = () => {
  const { containerStyle, length } = useContext(ImageGridContext);

  const renderGroup = () => {
    switch (length) {
      case 2:
        return <Two />;
      case 3:
        return <Three />;
      case 4:
        return <Four />;
      case 5:
        return <Five />;
      case 6:
        return <Six />;
      default:
        //default is 1
        return <One />;
    }
  };

  return <View style={[style.container, containerStyle]}>{renderGroup()}</View>;
};


const ImageGridContext = createContext({});

export function ImageGrid(props) {
  const { dataImage, widthKey, heightKey } = props;

  const maximum = props.maximum;

  const data = [...dataImage];
  const length = maximum > data.length ? data.length : maximum;
  const remain = data.length - length;
  data.length = length > 6 ? 6 : length;
  const layout =
    checkLayoutImage(data, length, widthKey, heightKey) || LAYOUT_ROW;

  const value = {
    ...props,
    //props
    layout,
    length,
    remain,
    data,
  };

  if (data.length) {
    return (
      <ImageGridContext.Provider value={value}>
        <Grid />
      </ImageGridContext.Provider>
    );
  }
  return null;
}
 
ImageGrid.defaultProps = {
  dataImage: [],
  colorLoader: [
    '#fcf8e8',
    '#d4e2d4',
    '#ecb390',
    '#df7861',
    '#dff3e3',
    '#86aba1',
    '#f4eeed',
  ],
  sourceKey: 'uri',
  videoURLKey: 'uri',
  width: width,
  spaceSize: 3,
  activeOpacity: 0.9,
  maximum: 6,
  backgroundMask: 'rgba(0,0,0,0.6)',
  backgroundMaskVideo: 'rgba(0,0,0,0.6)',
  videoKey: 'isVideo',
  conditionCheckVideo: true,
  heightKey: 'height',
  widthKey: 'width',
  onPressImage: () => {},
  emptyImageSource: {uri:'https://ouch-cdn2.icons8.com/z_clGpyIkW3_nN4i7s7Sd5dxs2PMJ_HXeD9HRWbZ6tE/rs:fit:368:340/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNDcw/L2FhOTUzODUxLWFl/YjItNDVlOC1hYWJk/LWM5NDU1ZWNhY2Iw/YS5zdmc.png'},
  showDelete: false,
  onDeleteImage: () => {},
  ratioImagePortrait: 1.618,
  ratioImageLandscape: 1.2,
  prefixPath: '',
  backgroundColorKey: 'backgroundColor', 
};
 
const style = StyleSheet.create({
    container: {
      overflow: 'hidden',
    },
    overlay: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleRemain: {
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#fff',
      fontFamily: 'Avenir',
    },
    videoIcon: {
      tintColor: '#fff',
    },
    componentDelete: {
      position: 'absolute',
      top: 8,
      right: 8,
    },
    buttonDelete: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      paddingHorizontal: 8,
      borderRadius: 4,
      paddingVertical: 6,
    },
    deleteImage: {
      width: 16,
      height: 16,
      tintColor: '#fff',
    },
}); 

export default ImageGrid