import { memo } from "react";
import IcoMoon from "react-icomoon";
import { Svg, Path } from "react-native-svg";
import iconSet from "@/assets/selection.json";

/**
 * 
 * https://svgps.app/store/boxicons
 */


/**
 * coffee-alt
 * server
 * user
 */
export default memo((props)=>{  
    return (
        <IcoMoon
            native
            iconSet={iconSet} 
            SvgComponent={Svg}
            PathComponent={Path}
            color="#000"
            icon={props?.icon || props?.name}
            {...props}
        />
    )
})