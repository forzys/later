import React, { forwardRef, memo, useMemo, useCallback, useEffect, useState } from 'react';
import { FlatList, View, Dimensions, SectionList } from 'react-native';
import { generateStyles, calculateDimensions, chunkArray, getAdjustedTotalDimensions, } from '@/common/common';
import useRows, {useRenderRow} from '@/hooks/useRows';
import useDimensions from '@/hooks/useDimensions';

export const FlatGrid = memo(forwardRef((props, ref) => {
    const {
        style,
        spacing,
        fixed,
        data,
        itemDimension,
        renderItem,
        horizontal,
        onLayout: _,
        staticDimension,
        maxDimension,
        additionalRowStyle: externalRowStyle,
        itemContainerStyle,
        keyExtractor: customKeyExtractor,
        invertedRow,
        maxItemsPerRow,
        adjustGridToStyles,
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
FlatGrid.defaultProps = {
  fixed: false,
  itemDimension: 120,
  spacing: 10,
  style: {},
  additionalRowStyle: undefined,
  itemContainerStyle: undefined,
  staticDimension: undefined,
  horizontal: false,
  onLayout: null,
  keyExtractor: null,
  listKey: undefined,
  maxDimension: undefined,
  invertedRow: false,
  maxItemsPerRow: undefined,
  adjustGridToStyles: false,
  onItemsPerRowChange: undefined,
  customFlatList: undefined,
};

export const SimpleGrid = memo(forwardRef((props, ref) => {
    const {
      style,
      spacing,
      fixed,
      data,
      itemDimension,
      renderItem,
      horizontal,
      additionalRowStyle: externalRowStyle,
      itemContainerStyle,
      keyExtractor: customKeyExtractor,
      invertedRow,
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
SimpleGrid.defaultProps = {
  fixed: false,
  itemDimension: 120,
  spacing: 10,
  style: {},
  additionalRowStyle: undefined,
  itemContainerStyle: undefined,
  staticDimension: undefined,
  horizontal: false,
  onLayout: null,
  keyExtractor: null,
  listKey: undefined,
  maxDimension: undefined,
  invertedRow: false,
  maxItemsPerRow: undefined,
  adjustGridToStyles: false,
  onItemsPerRowChange: undefined,
};


export const SectionGrid = memo(forwardRef((props, ref) => {
    const {
        sections,
        style,
        spacing,
        fixed,
        itemDimension,
        staticDimension,
        maxDimension,
        renderItem: originalRenderItem,
        keyExtractor,
        onLayout,
        additionalRowStyle: externalRowStyle,
        itemContainerStyle,
        invertedRow,
        maxItemsPerRow,
        adjustGridToStyles,
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
 
SectionGrid.defaultProps = {
    fixed: false,
    itemDimension: 120,
    spacing: 10,
    style: {},
    additionalRowStyle: undefined,
    itemContainerStyle: undefined,
    staticDimension: undefined,
    onLayout: null,
    listKey: undefined,
    maxDimension: undefined,
    invertedRow: false,
    keyExtractor: null,
    maxItemsPerRow: undefined,
    adjustGridToStyles: false,
    customSectionList: undefined,
    onItemsPerRowChange: null,
}

export default FlatGrid