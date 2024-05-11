import { memo } from "react"
import { View, Text, Image, useWindowDimensions } from "react-native"
 
const Avatar = memo(({ size, space = 0, ...props})=>{
    return (
        <View style={[{ width: size + space, height: size + space, alignItems:'center', justifyContent:'center', borderRadius: (size + space) / 2}, props.style]}>
            {props.children}
        </View>
    )
})

Avatar.Image = memo(({ size = 48, source, ...props})=>{
    return (
        <Avatar size={size} space={props.space} style={props.style}> 
            <Image
                source={source}
                style={[{ width: size, height: size, borderRadius: size / 2 }, props.imageStyle]}
                onError={props.onError}
                onLayout={props.onLayout}
                onLoad={props.onLoad}
                onLoadEnd={props.onLoadEnd}
                onLoadStart={props.onLoadStart}
                onProgress={props.onProgress}
                resizeMethod={props.resizeMethod} 
                accessibilityIgnoresInvertColors
            />
        </Avatar>
    )
})

Avatar.Text = memo(({ size = 48, space= 6, color="rgba(0, 0, 0, .54)", ...props})=>{
    const { fontScale } = useWindowDimensions();
    return (
        <Avatar size={size} style={props?.style}>
            <Text style={[
                {
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    color: color,
                    fontSize: size / 2,
                    paddingHorizontal: space,
                    lineHeight: size / fontScale,
                },
                props.textStyle,
            ]}
                numberOfLines={1}
                maxFontSizeMultiplier={props.maxFontSizeMultiplier}
            >
                {props.children}
            </Text>
        </Avatar>
    )
})

export default Avatar