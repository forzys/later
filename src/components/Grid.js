import React, { forwardRef, memo, useMemo, useCallback, useEffect, useState } from 'react';
import { FlatList, View, Dimensions, SectionList } from 'react-native';
// import { generateStyles, calculateDimensions, getAdjustedTotalDimensions, } from '@/common/common';
// import useRows, {useRenderRow} from '@/hooks/useRows';
 
 
  function generateStyles({
    itemDimension,
    containerDimension,
    spacing,
    fixed,
    horizontal,
    fixedSpacing,
    itemsPerRow,
  }) {
    let rowStyle = {
      flexDirection: 'row',
      paddingLeft: fixed ? fixedSpacing : spacing,
      paddingBottom: spacing,
    };
  
    let containerStyle = {
      flexDirection: 'column',
      justifyContent: 'center',
      width: fixed ? itemDimension : (containerDimension - spacing),
      marginRight: fixed ? fixedSpacing : spacing,
    };
  
    const containerFullWidthStyle = {
      flexDirection: 'column',
      justifyContent: 'center',
      width: containerDimension * itemsPerRow - spacing,
      marginBottom: spacing,
    };
  
    if (horizontal) {
      rowStyle = {
        flexDirection: 'column',
        paddingTop: fixed ? fixedSpacing : spacing,
        paddingRight: spacing,
      };
  
      containerStyle = {
        flexDirection: 'row',
        justifyContent: 'center',
        height: fixed ? itemDimension : (containerDimension - spacing),
        marginBottom: fixed ? fixedSpacing : spacing,
      };
    }
  
    return {
      containerFullWidthStyle,
      containerStyle,
      rowStyle,
    };
  }

  
function getStyleDimensions(style,  horizontal = false) {
    let space1 = 0;
    let space2 = 0;
    let maxStyleDimension;
    if (style) {
      const flatStyle = Array.isArray(style) ? StyleSheet.flatten(style) : style;
      let sMaxDimensionXY = 'maxWidth';
      let sPaddingXY = 'paddingHorizontal';
      let sPadding1 = 'paddingLeft';
      let sPadding2 = 'paddingRight';
      if (horizontal) {
        sMaxDimensionXY = 'maxHeight';
        sPaddingXY = 'paddingVertical';
        sPadding1 = 'paddingTop';
        sPadding2 = 'paddingBottom';
      }
  
      if (flatStyle[sMaxDimensionXY] && typeof flatStyle[sMaxDimensionXY] === 'number') {
        maxStyleDimension = flatStyle[sMaxDimensionXY];
      }
  
      const padding = flatStyle[sPaddingXY] || flatStyle.padding;
      const padding1 = flatStyle[sPadding1] || padding || 0;
      const padding2 = flatStyle[sPadding2] || padding || 0;
      space1 = (typeof padding1 === 'number' ? padding1 : 0);
      space2 = (typeof padding2 === 'number' ? padding2 : 0);
    }
    return { space1, space2, maxStyleDimension };
  }

function getAdjustedTotalDimensions({
    totalDimension,
    maxDimension,
    contentContainerStyle,
    style,
    horizontal = false,
    adjustGridToStyles = false,
  }) {
    let adjustedTotalDimension = totalDimension;
    let actualMaxDimension = totalDimension; // keep track of smallest max dimension
  
    // adjust for maxDimension prop
    if (maxDimension && totalDimension > maxDimension) {
      actualMaxDimension = maxDimension;
      adjustedTotalDimension = maxDimension;
    }
  
    if (adjustGridToStyles) {
      if (contentContainerStyle) {
        const { space1, space2, maxStyleDimension } = getStyleDimensions(contentContainerStyle, horizontal);
        // adjust for maxWidth or maxHeight in contentContainerStyle
        if (maxStyleDimension && adjustedTotalDimension > maxStyleDimension) {
          actualMaxDimension = maxStyleDimension;
          adjustedTotalDimension = maxStyleDimension;
        }
        // subtract horizontal or vertical padding from adjustedTotalDimension
        if (space1 || space2) {
          adjustedTotalDimension = adjustedTotalDimension - space1 - space2;
        }
      }
  
      if (style) {
        const edgeSpaceDiff = (totalDimension - actualMaxDimension) / 2; // if content is floating in middle of screen get margin on either side
        const { space1, space2 } = getStyleDimensions(style, horizontal);
        // only subtract if space is greater than the margin on either side
        if (space1 > edgeSpaceDiff) {
          adjustedTotalDimension -= (space1 - edgeSpaceDiff); // subtract the padding minus any remaining margin
        }
        if (space2 > edgeSpaceDiff) {
          adjustedTotalDimension -= (space2 - edgeSpaceDiff); // subtract the padding minus any remaining margin
        }
      }
    }
  
    return adjustedTotalDimension;
  }

function calculateDimensions({
	itemDimension,
	staticDimension,
	totalDimension,
	fixed,
	spacing,
	maxItemsPerRow,
}) {
  const usableTotalDimension = staticDimension || totalDimension;
  const availableDimension = usableTotalDimension - spacing; // One spacing extra
  const itemTotalDimension = Math.min(itemDimension + spacing, availableDimension); // itemTotalDimension should not exceed availableDimension
  const itemsPerRow = Math.min(Math.floor(availableDimension / itemTotalDimension), maxItemsPerRow || Infinity);
  const containerDimension = availableDimension / itemsPerRow;

  let fixedSpacing;
  if (fixed) {
    fixedSpacing = (totalDimension - (itemDimension * itemsPerRow)) / (itemsPerRow + 1);
  }

  return {
    itemTotalDimension,
    availableDimension,
    itemsPerRow,
    containerDimension,
    fixedSpacing,
  };
}

const useDimensions = (props) => {
    const {
      staticDimension,
      maxDimension,
      horizontal,
      onLayout,
      adjustGridToStyles,
      contentContainerStyle,
      style,
      itemDimension,
      spacing,
      fixed,
      maxItemsPerRow,
    } = props;
  
    const [totalDimension, setTotalDimension] = useState(() => {
      let defaultTotalDimension = staticDimension;
  
      if (!staticDimension) {
        const dimension = horizontal ? 'height' : 'width';
        defaultTotalDimension = getAdjustedTotalDimensions({
          totalDimension: Dimensions.get('window')[dimension], maxDimension, contentContainerStyle, style, horizontal, adjustGridToStyles,
        });
      }
  
      return defaultTotalDimension;
    });
  
    const onLayoutLocal = useCallback(
      (e) => {
        if (!staticDimension) {
          const { width, height } = e.nativeEvent.layout || {};
          let newTotalDimension = horizontal ? height : width;
  
          newTotalDimension = getAdjustedTotalDimensions({
            totalDimension: newTotalDimension, maxDimension, contentContainerStyle, style, horizontal, adjustGridToStyles,
          });
  
          if (totalDimension !== newTotalDimension && newTotalDimension > 0) {
            setTotalDimension(newTotalDimension);
          }
        }
  
        // call onLayout prop if passed
        if (onLayout) {
          onLayout(e);
        }
      },
      [staticDimension, maxDimension, totalDimension, horizontal, onLayout, adjustGridToStyles],
    );
  
  
    const { containerDimension, itemsPerRow, fixedSpacing } = useMemo(
      () => calculateDimensions({
        itemDimension,
        staticDimension,
        totalDimension,
        spacing,
        fixed,
        maxItemsPerRow,
      }),
      [itemDimension, staticDimension, totalDimension, spacing, fixed, maxItemsPerRow],
    );
  
  
    return {
      totalDimension,
      onLayout: onLayoutLocal,
      containerDimension,
      itemsPerRow,
      fixedSpacing,
    };
  };
 
 
function chunkArray(array = [], size) {
  if (array.length === 0) return [];

  return array.reduce((acc, val) => {
    if (acc.length === 0) acc.push([]);

    const last = acc[acc.length - 1];
    const rowHadFullWidth = last[0] && last[0]._fullWidth;
    const currentIsFullWidth = !!val._fullWidth;

    if (last.length < size && !rowHadFullWidth && !currentIsFullWidth) {
      last.push(val);
    } else {
      acc.push([val]);
    }
    return acc;
  }, []);
}


const useRows = ({
  data, itemsPerRow, invertedRow, keyExtractor, onItemsPerRowChange,
}) => {
  let rows = chunkArray(data, itemsPerRow); // Splitting the data into rows

  if (invertedRow) {
    rows = rows.map(r => r.reverse());
  }

  const localKeyExtractor = useCallback(
    (rowItems, index) => {
      if (keyExtractor) {
        return rowItems
          .map((rowItem, rowItemIndex) => keyExtractor(rowItem, rowItemIndex))
          .join('_');
      }
      return `row_${index}`;
    },
    [keyExtractor],
  );

  useEffect(() => {
    if (onItemsPerRowChange) {
      onItemsPerRowChange(itemsPerRow);
    }
  }, [itemsPerRow]);

  return { rows, keyExtractor: localKeyExtractor };
};
 
const useRenderRow = ({ renderItem, spacing, keyExtractor, externalRowStyle, itemContainerStyle, horizontal, invertedRow }) => 
    useCallback(({
        rowItems,
        rowIndex,
        separators,
        isLastRow,
        itemsPerRow,
        rowStyle,
        containerStyle,
        containerFullWidthStyle,
    }) => {
 
    let additionalRowStyle = {};
    if (isLastRow) {
      additionalRowStyle = {
        ...(!horizontal ? { marginBottom: spacing } : {}),
        ...(horizontal ? { marginRight: spacing } : {}),
      };
    }

    const hasFullWidthItem = !!rowItems.find(i => i._fullWidth);

    return (
      <View style={[rowStyle, additionalRowStyle, externalRowStyle, hasFullWidthItem ? { flexDirection: 'column', paddingBottom: 0 } : {}]}>
        {rowItems.map((item, index) => {
          const i = invertedRow ? -index + itemsPerRow - 1 : index;

          return (
            <View 
                key={ keyExtractor ? keyExtractor(item, rowIndex * itemsPerRow + i) : `item_${rowIndex * itemsPerRow + i}` }
                style={[item._fullWidth ? containerFullWidthStyle : containerStyle, itemContainerStyle]}
            >
                {renderItem({
                    item,
                    index: rowIndex * itemsPerRow + i,
                    separators,
                    rowIndex,
                })}
            </View>
          );
        })}
      </View>
    );
  },
  [renderItem, spacing, keyExtractor, externalRowStyle, itemContainerStyle, horizontal, invertedRow],
);

export const FlatGrid = memo(forwardRef((props, ref) => {
    const { 
        fixed = false,
        itemDimension = 120,
        spacing = 10,
        style = {}, 
        horizontal = false, 
        invertedRow = false,
        adjustGridToStyles = false,

        data, 
        renderItem, 
        onLayout: _,
        staticDimension,
        maxDimension,
        additionalRowStyle: externalRowStyle,
        itemContainerStyle,
        keyExtractor: customKeyExtractor, 
        maxItemsPerRow, 
        customFlatList: FlatListComponent = FlatList,
        onItemsPerRowChange,
        ...restProps
    } = props;
 
    if (props.items && !props.data) { 
        throw new Error('React Native Super Grid - Prop "items" has been renamed to "data" in version 4');
    }

    const { onLayout, totalDimension, itemsPerRow, containerDimension, fixedSpacing } = useDimensions(props);

    const { containerStyle, containerFullWidthStyle, rowStyle } = useMemo(
      () => generateStyles({ horizontal, itemDimension, containerDimension, spacing, fixedSpacing, fixed,  itemsPerRow }),
      [horizontal, itemDimension, containerDimension, itemsPerRow, spacing, fixedSpacing, fixed],
    );

    const { rows, keyExtractor } = useRows({ data, invertedRow, itemsPerRow, keyExtractor: customKeyExtractor, onItemsPerRowChange });

    const renderRow = useRenderRow({ renderItem, spacing, keyExtractor: customKeyExtractor, externalRowStyle, itemContainerStyle, horizontal, invertedRow });

    return (
        <FlatListComponent
            data={rows}
            ref={ref}
            extraData={totalDimension}
            renderItem={({ item, index }) => 
                renderRow({
                    rowItems: item,
                    rowIndex: index,
                    isLastRow: index === rows.length - 1,
                    itemsPerRow,
                    rowStyle,
                    containerStyle,
                    containerFullWidthStyle,
                })
            }
            style={[ { ...(horizontal ? { paddingLeft: spacing } : { paddingTop: spacing }) }, style ]}
            onLayout={onLayout}
            keyExtractor={keyExtractor}
            {...restProps}
            horizontal={horizontal}
        />
    );
  }),
);

FlatGrid.displayName = 'FlatGrid';

export const SimpleGrid = memo(forwardRef((props, ref) => {
    const {

        fixed = false,
        itemDimension = 120,
        spacing = 10,
        style = {},
        invertedRow = false,
        horizontal = false,
        adjustGridToStyles = false,
 
      data,
      renderItem,

      additionalRowStyle: externalRowStyle,
      itemContainerStyle,
      keyExtractor: customKeyExtractor,

      onItemsPerRowChange,
      ...restProps
    } = props;

    const {  onLayout, itemsPerRow, containerDimension, fixedSpacing } = useDimensions(props);

    const { containerStyle, containerFullWidthStyle, rowStyle } = useMemo(
      () => generateStyles({ horizontal, itemDimension, containerDimension, spacing, fixedSpacing, fixed, itemsPerRow }),
      [horizontal, itemDimension, containerDimension, itemsPerRow, spacing, fixedSpacing, fixed],
    );

    const { rows, keyExtractor } = useRows({ data, invertedRow, itemsPerRow, keyExtractor: customKeyExtractor, onItemsPerRowChange });

    const renderRow = useRenderRow({ renderItem, spacing, keyExtractor: customKeyExtractor, externalRowStyle, itemContainerStyle, horizontal, invertedRow });

    return (
        <View
            style={[ { ...(horizontal ? { paddingLeft: spacing } : { paddingTop: spacing }) },  style]}
            ref={ref}
            {...restProps}
        >
            {rows.map((row, index) => (
                <View key={keyExtractor(row, index)} onLayout={onLayout}>
                    {renderRow({ rowItems: row, rowIndex: index, isLastRow: index === rows.length - 1, itemsPerRow, rowStyle, containerStyle, containerFullWidthStyle, separators: null })}
                </View>
            ))}
        </View>
    );
  }),
);

SimpleGrid.displayName = 'SimpleGrid';
 
 
export const SectionGrid = memo(forwardRef((props, ref) => {
    const {
        fixed = false,
        itemDimension = 120,
        spacing = 10,
        style = {},
        invertedRow = false,
        adjustGridToStyles = false,

        sections,
       
        staticDimension,
        maxDimension,
        renderItem: originalRenderItem,
        keyExtractor,
        onLayout,
        additionalRowStyle: externalRowStyle,
        itemContainerStyle,
        
        maxItemsPerRow,
     
        customSectionList: SectionListComponent = SectionList,
        onItemsPerRowChange,
        ...restProps
    } = props;
  
    const [totalDimension, setTotalDimension] = useState(() => {
        let defaultTotalDimension = staticDimension; 
        if (!staticDimension) {
            defaultTotalDimension = getAdjustedTotalDimensions({
            totalDimension: Dimensions.get('window').width,
            maxDimension,
            contentContainerStyle: restProps.contentContainerStyle,
            style,
            adjustGridToStyles,
            });
        } 
        return defaultTotalDimension;
    });

    const onLocalLayout = useCallback((e) => {
        if (!staticDimension) {
            let { width: newTotalDimension } = e.nativeEvent.layout || {}; 
            newTotalDimension = getAdjustedTotalDimensions({
                totalDimension: newTotalDimension, maxDimension, contentContainerStyle: restProps.contentContainerStyle, style, adjustGridToStyles,
            }); 
            if (totalDimension !== newTotalDimension && newTotalDimension > 0) {
                setTotalDimension(newTotalDimension);
            }
        }

        if (onLayout) {
            onLayout(e);
        }
    },  [staticDimension, maxDimension, totalDimension, onLayout, adjustGridToStyles]);

    const renderRow = useCallback(({ renderItem, rowItems, rowIndex, section, itemsPerRow, rowStyle, separators, isFirstRow, containerStyle, containerFullWidthStyle }) => {
        let additionalRowStyle = {};
        if (isFirstRow) {
            additionalRowStyle = {
                marginTop: spacing,
            };
        } 
        const hasFullWidthItem = !!rowItems.find(i => i._fullWidth); 
        return (
            <View style={[rowStyle, additionalRowStyle, externalRowStyle, hasFullWidthItem ? { flexDirection: 'column', paddingBottom: 0 } : {}]}>
                {rowItems.map((item, index) => {
                    const i = invertedRow ? -index + itemsPerRow - 1 : index; 
                    return (
                        <View
                            key={ keyExtractor ? keyExtractor(item, rowIndex * itemsPerRow + i) : `item_${rowIndex * itemsPerRow + i}`}
                            style={[item._fullWidth ? containerFullWidthStyle : containerStyle, itemContainerStyle]}
                        >
                            {renderItem({ item, index: rowIndex * itemsPerRow + i,  section, separators, rowIndex })}
                        </View>
                    );
                })}
            </View>
        );
    },
    [spacing, keyExtractor, externalRowStyle, itemContainerStyle, invertedRow],
    );
  
    const { containerDimension, itemsPerRow, fixedSpacing } = useMemo(() => 
    calculateDimensions({ itemDimension, staticDimension, totalDimension, spacing, fixed, maxItemsPerRow }),
    [itemDimension, staticDimension, totalDimension, spacing, fixed, maxItemsPerRow]);

    const { containerStyle, containerFullWidthStyle, rowStyle } = useMemo(() => 
    generateStyles({ itemDimension, containerDimension, spacing, fixedSpacing,  fixed,  itemsPerRow }), 
    [itemDimension, containerDimension, itemsPerRow, spacing, fixedSpacing, fixed]);

    const groupSectionsFunc = useCallback((section) => {
        let chunkedData = chunkArray(section.data, itemsPerRow);

        if (invertedRow) {
            chunkedData = chunkedData.map($0 => $0.reverse());
        }

        const renderItem = section.renderItem || originalRenderItem;

        return {
            ...section,
            renderItem: ({ item, index, section: s }) => renderRow({
                renderItem,
                rowItems: item,
                rowIndex: index,
                section: s,
                isFirstRow: index === 0,
                itemsPerRow,
                rowStyle,
                containerStyle,
                containerFullWidthStyle,
            }),
            data: chunkedData,
            originalData: section.data,
        };
    }, [ itemsPerRow, originalRenderItem, renderRow, rowStyle, containerStyle ]);

    const groupedSections = sections.map(groupSectionsFunc);

    const localKeyExtractor = useCallback((rowItems, index) => {
        return keyExtractor ? rowItems.map((rowItem, rowItemIndex) => keyExtractor(rowItem, rowItemIndex)).join('_') : `row_${index}`
    }, [keyExtractor]);
    
    useEffect(() => {
        if (onItemsPerRowChange) {
            onItemsPerRowChange(itemsPerRow);
        }
    }, [itemsPerRow]);
    
    return (
        <SectionListComponent
            onLayout={onLocalLayout}
            extraData={totalDimension}
            sections={groupedSections}
            keyExtractor={localKeyExtractor}
            style={style}
            ref={ref}
            {...restProps}
        />
    );
}));


export default SimpleGrid