import { memo } from 'react';
import { Text, StyleSheet } from 'react-native'
import { useFontFace } from "@/hooks/index";
 
const RNText = ({
    h1, h2, h3, h4, h5, h6,t4,t3,t5,t1,t2,
    style, left, bold, right, color,
    center, children, fontFamily,mt,
    ...rest
}) => {
    const { fontName = 'Roboto' } = useFontFace()
    return (
        <Text
            style={StyleSheet.flatten([
                { lineHeight: 24 },
                mt && { marginTop: -3},
                color && { color },
                center && styles.center,
                right && styles.right,
                left && styles.left,
                bold && styles.bold,
                h1 && styles.h1,
                h2 && styles.h2,
                h3 && styles.h3,
                h4 && styles.h4,
                h5 && styles.h5,
                h6 && styles.h6,
                t1 && styles.t,
                t2 && styles.t,
                t3 && styles.t3,
                t4 && styles.t4,
                t5 && styles.t5,
                { fontFamily: fontFamily || fontName },
                style && style,
            ])}
            {...rest}
        >
            {children}
        </Text>
    );
};

const styles =  StyleSheet.create({
    h1: {
        fontSize: 32,
        marginLeft: 0,
        marginRight: 0,
    },
    h2: {
        fontSize: 24,
        marginLeft: 0,
        marginRight: 0,
    },
    h3: {
        fontSize: 18,
        marginLeft: 0,
        marginRight: 0,
    },
    h4: {
        fontSize: 16,
        marginLeft: 0,
        marginRight: 0,
    },
    h5: {
        fontSize: 13,
        marginLeft: 0,
        marginRight: 0,
    },
    h6: {
        fontSize: 10,
        marginLeft: 0,
        marginRight: 0,
    },
    t:{
        fontSize: 14,
        lineHeight: 24,
    },
    t3:{
        fontSize: 12,
        lineHeight: 18,
    },
    t4:{
        fontSize: 11,
        lineHeight: 16,
    },
    t5:{
        fontSize: 10,
        lineHeight: 16,
    },
  
    center: {
        textAlign: "center",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
    },
    left: {
        textAlign: "left",
        alignItems: "flex-start",
        alignContent: "flex-start",
        justifyContent: "flex-start",
    },
    right: {
        textAlign: "right",
        alignItems: "flex-end",
        alignContent: "flex-end",
        justifyContent: "flex-end",
    },
    bold: {
        fontWeight: "bold",
    },

});

export default memo(RNText);