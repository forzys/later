import { memo } from 'react';
import { View } from 'react-native';
import { VideoPlayer, VideoPlayerProvider } from './controls/video';

export default memo((props)=>{
    return ( 
        <VideoPlayerProvider autoplay={props?.autoplay}> 
            <View style={props.style}>
                <VideoPlayer
                    src={props?.src}
                    title={props?.title}
                    source={props?.source}
                    poster={props?.poster}
                    empty={props?.empty}
                />
            </View> 
        </VideoPlayerProvider>
    )
})