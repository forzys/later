/* eslint-disable react-native/no-inline-styles, no-shadow */
import React, { useRef, useState, useContext, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Platform, Text, Image,TouchableWithoutFeedback, ActivityIndicator,Modal } from 'react-native';
import Video from 'react-native-video';
import Icon from '@/common/components/Icon';
 
const styles = StyleSheet.create({
    container: { backgroundColor: '#bbb' },
    seekbarContainer: {
        padding: 15,
        backgroundColor: '#dedede',
        justifyContent: 'center',
    },
    seekbar: { height: 3, backgroundColor: '#333' },
    seekHandler: {
        borderRadius: 20,
        width: 20,
        height: 20,
        backgroundColor: 'red',
        position: 'absolute',
        left: 5,
    },
    iconButton: { padding: 6 },
});

const formatSecondsTime = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.round(duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const VideoPlayerContext = React.createContext({
    currentlyPlaying: null,
    setCurrentlyPlaying: () => {},
    autoplay: null,
});

const VideoPlayerProvider = ({ children, shouldPlay = () => true, autoplay = null }) => {
    const [currentlyPlaying, setCurrentlyPlayingState] = useState(autoplay || null);

    const setCurrentlyPlaying = useCallback((src) => {
        if (src && shouldPlay(src)) {
            setCurrentlyPlayingState(src);
        } else {
            setCurrentlyPlayingState(null);
        }
    }, [shouldPlay]);

    useEffect(() => {
        setCurrentlyPlaying(currentlyPlaying);
    }, [shouldPlay, currentlyPlaying, setCurrentlyPlaying]);

    useEffect(() => {
        if (autoplay) {
            setCurrentlyPlayingState(autoplay);
        }
    }, [autoplay]);

    return (
        <VideoPlayerContext.Provider value={{ currentlyPlaying, setCurrentlyPlaying, autoplay }}>
            {children}
        </VideoPlayerContext.Provider>
    );
};
 
const VideoPlayer  = ({
    title,
    src = undefined,
    source = null,
    showSkipButtons = true,
    skipInterval = 10,
    repeat = false,
    onPreviousVideo,
    onNextVideo,
    iOSNativeControls = false,
    poster,
    onProgress,
    onLoad,
    onEnd,
    hideControlsTimeout = 4000,
    empty = null,
    ...rest
}) => {
    const inlineVideoRef = useRef(null);
    const fullscreenVideoRef = useRef(null);
    const { currentlyPlaying, setCurrentlyPlaying, autoplay } = useContext(VideoPlayerContext);

    const [fullscreen, setFullscreen] = useState(false);

    const [duration, setDuration] = useState(0);

    const [inlineVideoPosition, setInlineVideoPosition] = useState(0);
    const [fullscreenVideoPosition, setFullscreenVideoPosition] = useState(0);
    const [playableDuration, setPlayableDuration] = useState(0);
    const [fullscreenPlayableDuration, setFullscreenPlayableDuration] = useState(0);
    const [muted, setMuted] = useState(false); 
    const [showControls, setShowControls] = useState(false);
    const [showFullscreenControls, setShowFullscreenControls] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [fullScreenVideoLoaded, setFullscreenVideoLoaded] = useState(false);
    const [inlineVideoStarted, setInlineVideoStarted] = useState(source ? autoplay === source : autoplay === src);
    const returnFromFullscreen = useRef(false);
    const inlineControlsTimeoutHandle = useRef(null);
    const fullScreenControlsTimeoutHandle = useRef(null);

    let isPlaying = false;
    if (source) {
        isPlaying = currentlyPlaying === JSON.stringify(source);
    }
    if (src) {
        isPlaying = !!currentlyPlaying && currentlyPlaying === src;
    }

    useEffect(() => {
        if (autoplay) {
            if ((source && autoplay === JSON.stringify(source)) || autoplay === src) {
                setInlineVideoStarted(true);
            }
        }
    }, [autoplay, src, source]);
 
    const isPlayingWrapperRef = useRef(isPlaying);
    isPlayingWrapperRef.current = isPlaying;

    const isLoading = isPlaying && playableDuration - inlineVideoPosition <= 0;
    const fullscreenIsLoading =
        isPlaying && fullscreenPlayableDuration - fullscreenVideoPosition <= 0;

    const hideInlineControls = () => {
        inlineControlsTimeoutHandle.current = null;
        if (isPlayingWrapperRef.current) {
            setShowControls(false);
        }
    };

    const hideFullScreenControls = () => {
        fullScreenControlsTimeoutHandle.current = null;
        if (isPlayingWrapperRef.current) {
            setShowFullscreenControls(false);
        }
    };

    const displayInlineControls = () => {
        if (inlineControlsTimeoutHandle.current) {
            clearTimeout(inlineControlsTimeoutHandle.current);
        }
        inlineControlsTimeoutHandle.current = setTimeout(hideInlineControls, hideControlsTimeout);
        setShowControls(true);
    };

    const displayFullScreenControls = () => {
        if (fullScreenControlsTimeoutHandle.current) {
            clearTimeout(fullScreenControlsTimeoutHandle.current);
        }
        fullScreenControlsTimeoutHandle.current = setTimeout(
            hideFullScreenControls,
            hideControlsTimeout,
        );
        setShowFullscreenControls(true);
    };

    if (!src && !source) {
        // if (__DEV__) {
        //     console.error(
        //         'Either one of src or source props must be passed to VideoPlayer component',
        //     );
        // }
        // return null;
    }

    if (src && typeof src !== 'string') {
        // if (__DEV__) {
        //     console.error('src attribute on the VideoPlayer component must be a string');
        // }
        return null;
    }

    const exitFullScreen = () => {
        returnFromFullscreen.current = true;
        setFullscreen(false);
        setFullscreenVideoLoaded(false);
        setShowFullscreenControls(false);
        // Orientation.lockToPortrait();
        displayInlineControls();
    };

    const videoSource = source || { uri: src };
 
    return (
        <View style={{ flex: 1, width: '100%', position: 'relative' }} key={src} pointerEvents={rest?.pointerEvents}>
            {!fullscreen && (
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'black' }}>
                    {inlineVideoStarted ? (
                        <TouchableWithoutFeedback
                            onPress={() => videoLoaded && displayInlineControls()}>
                            {/* inline video*/}
                            <Video
                                repeat={repeat}
                                cache={false}
                                paused={!isPlaying}
                                fullscreenAutorotate={true}
                                posterResizeMode="cover"
                                style={StyleSheet.absoluteFillObject}
                                {...rest}
                                source={videoSource}
                                volume={1}
                                muted={muted}
                                resizeMode="contain"
                                ref={inlineVideoRef}
                                onProgress={(...params) => {
                                    const { currentTime, playableDuration } = params[0];
                                    setInlineVideoPosition(currentTime);
                                    setPlayableDuration(playableDuration);
                                    onProgress && onProgress(...params);
                                }}
                                onLoad={(...params) => {
                                    const { duration } = params[0];
                                    setDuration(duration);
                                    setVideoLoaded(true);
                                    if (inlineVideoRef.current && returnFromFullscreen.current) {
                                        inlineVideoRef.current.seek(fullscreenVideoPosition);
                                    } 
                                    onLoad && onLoad(...params);
                                }}
                                controls={iOSNativeControls && Platform.OS === 'ios'}
                                onEnd={(...params) => {
                                    setShowControls(true);
                                    if (!repeat) {
                                        setCurrentlyPlaying(null);
                                        fullscreenVideoRef.current?.seek(0);
                                        inlineVideoRef.current?.seek(0);
                                    }
                                    onEnd && onEnd(...params);
                                }}
                            />
                        </TouchableWithoutFeedback>
                    ) : (
                        <View style={[ StyleSheet.absoluteFillObject, { flexGrow: 1, alignItems: 'center', justifyContent: 'center' }]}>
                            {
                                poster && <Image style={StyleSheet.absoluteFillObject} source={{ uri: poster }} />
                            }
                          
                            {
                                videoSource?.uri ? (
                                    <TouchableOpacity
                                        onPress={() => {
                                            if(!videoSource){
                                                return 
                                            }
                                            setInlineVideoStarted(true);
                                            setCurrentlyPlaying( source ? JSON.stringify(source) : src ? src : null );
                                        }}
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            borderRadius: 40,
                                            padding: 8,
                                            paddingLeft:12,
                                        }}> 
                                        <Icon name="play" size={25 * 2} color="#fff" />
                                    </TouchableOpacity>  
                                ): empty
                            } 
                        </View>
                    )}

                    {isLoading && !videoLoaded && (
                        <View
                            style={{
                                ...StyleSheet.absoluteFillObject,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            }}>
                            <ActivityIndicator color="#fff" size="large" />
                        </View>
                    )}

                    {((Platform.OS === 'android' && videoLoaded && showControls) ||
                        (Platform.OS === 'ios' &&
                            !iOSNativeControls &&
                            videoLoaded &&
                            showControls)) && (
                        <TouchableWithoutFeedback
                            onPress={() => {
                                if (inlineControlsTimeoutHandle.current) {
                                    clearTimeout(inlineControlsTimeoutHandle.current);
                                    inlineControlsTimeoutHandle.current = null;
                                }
                                setShowControls(false);
                            }}>
                            <View
                                style={[
                                    StyleSheet.absoluteFillObject,
                                    {
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    },
                                ]}>
                                    {
                                        !!title && (
                                            <View style={{  position: 'absolute',  left: 12, top: 0, right: 24, height: 40, alignItems: 'center'}}>
                                                <Text numberOfLines={1} style={{color:'#FFF'}}>{title}</Text>
                                            </View>
                                        )
                                    }

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between', 
                                        width: '80%',
                                    }}> 
                                    {showSkipButtons && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                inlineVideoRef.current?.seek(
                                                    inlineVideoPosition - skipInterval,
                                                );
                                                displayInlineControls();
                                            }}
                                            style={{ padding: 8 }}> 
                                            <Icon name="backward" size={25} color="#fff" />
                                        </TouchableOpacity>
                                    )}
 
                                    {onPreviousVideo && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                onPreviousVideo();
                                                displayInlineControls();
                                            }}
                                            style={{ padding: 8 }}> 
                                            <Icon name="skip-previous" size={25} color="#fff" />
                                        </TouchableOpacity>
                                    )}
 
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (isPlaying) {
                                                setCurrentlyPlaying(null);
                                            } else {
                                                setInlineVideoStarted(true);
                                                setCurrentlyPlaying(source ? JSON.stringify(source) : src ? src : null);
                                            }
                                            displayInlineControls();
                                        }}
                                        style={{ padding: 8 }}>
                                        {isPlaying ? ( 
                                            <Icon name="pause" size={25 * 2} color="#fff" />
                                        ) : ( 
                                            <Icon name="play" size={25 * 2} color="#fff" />
                                        )}
                                    </TouchableOpacity>
 
                                    {onNextVideo && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                onNextVideo();
                                                displayInlineControls();
                                            }}
                                            style={{ padding: 8 }}> 
                                            <Icon name="skip-next" size={25} color="#fff" />
                                        </TouchableOpacity>
                                    )}
 
                                    {showSkipButtons && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                inlineVideoRef.current?.seek(
                                                    inlineVideoPosition + skipInterval,
                                                );
                                                displayInlineControls();
                                            }}
                                            style={{ padding: 8 }}> 
                                            <Icon name="forward" size={25} color="#fff" />
                                        </TouchableOpacity>
                                    )}
                                </View> 
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: 8,
                                        left: 0,
                                        right: 0,
                                        height: 40, 
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                    <Text style={{ color: '#fff', marginLeft: 8, fontSize: 12 }}>
                                        {formatSecondsTime(inlineVideoPosition)} /{' '}
                                        {formatSecondsTime(duration)}
                                    </Text>

                                    <View style={{ flexDirection: 'row' }}> 
                                        {muted ? (
                                            <TouchableOpacity
                                                style={[styles.iconButton]}
                                                onPress={() => {
                                                    setMuted(false);
                                                    displayInlineControls();
                                                }}> 
                                                <Icon name="volume-mute" size={25 / 1.2} color="#fff" />
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.iconButton]}
                                                onPress={() => {
                                                    setMuted(true);
                                                    displayInlineControls();
                                                }}> 
                                                <Icon name="volume-full" size={25 / 1.2} color="#fff" />
                                            </TouchableOpacity>
                                        )}
 
                                        <TouchableOpacity
                                            onPress={() => {
                                                if ( Platform.OS === 'ios' && inlineVideoRef.current) {
                                                    inlineVideoRef.current.presentFullscreenPlayer();
                                                } else {
                                                    setFullscreen(true); 
                                                    displayFullScreenControls();
                                                }
                                            }}
                                            style={styles.iconButton}> 
                                            <Icon name="fullscreen" size={25 / 1.2} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
 
                                <View
                                    style={{
                                        backgroundColor: 'rgba(150, 150, 150, 0.4)',
                                        height: 5,
                                        position: 'absolute',
                                        bottom: 5,
                                        left: 6,
                                        right: 6,
                                        borderRadius: 3,
                                    }}>
                                    <View
                                        style={[
                                            StyleSheet.absoluteFillObject,
                                            {
                                                backgroundColor: 'rgb(150, 150, 150)',
                                                width: `${(playableDuration * 100) / duration}%`,
                                            },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            StyleSheet.absoluteFillObject,
                                            {
                                                backgroundColor: '#FFF',
                                                width: `${(inlineVideoPosition * 100) / duration}%`,
                                            },
                                        ]}
                                    />
                                    <View
                                        style={{
                                            width: 12,
                                            height: 12,
                                            backgroundColor: '#FFF',
                                            borderRadius: 50,
                                            position: 'absolute',
                                            top: -4,
                                            left: `${(inlineVideoPosition * 100) / duration}%`,
                                        }}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                </View>
            )}
 
            {Platform.OS === 'android' && (
                <Modal
                    presentationStyle="fullScreen"
                    visible={fullscreen}
                    supportedOrientations={['landscape']}
                    onRequestClose={exitFullScreen}
                >
                    <StatusBar hidden={fullscreen} />
                    <TouchableWithoutFeedback
                        onPress={() => fullScreenVideoLoaded && displayFullScreenControls()}>
  
                        <Video
                            repeat={repeat}
                            paused={!isPlaying}
                            fullscreenAutorotate={true}
                            posterResizeMode="contain"
                            cache={false}
                            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'black' }]}
                            {...rest}
                            source={videoSource}
                            volume={1}
                            muted={muted}
                            resizeMode="contain"
                            ref={fullscreenVideoRef}
                            onLoad={(...params) => {
                                const { duration } = params[0];
                                setDuration(duration);
                                setFullscreenVideoLoaded(true);
                                if (fullscreenVideoRef.current) {
                                    fullscreenVideoRef.current.seek(inlineVideoPosition);
                                }
                                onLoad && onLoad(...params);
                            }}
                            onProgress={(...params) => {
                                const { currentTime, playableDuration } = params[0];
                                setFullscreenVideoPosition(currentTime);
                                setFullscreenPlayableDuration(playableDuration);
                                onProgress && onProgress(...params);
                            }}
                            controls={false}
                            onEnd={(...params) => {
                                setCurrentlyPlaying(null);
                                setShowControls(true);
                                setFullscreenVideoPosition(0);
                                setInlineVideoPosition(0);
                                fullscreenVideoRef.current?.seek(0);
                                inlineVideoRef.current?.seek(0);
                                exitFullScreen();
                                onEnd && onEnd(...params);
                            }}
                        />
                    </TouchableWithoutFeedback>
                    {fullscreenIsLoading && !fullScreenVideoLoaded && (
                        <View
                            style={{
                                ...StyleSheet.absoluteFillObject,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            }}>
                            <ActivityIndicator color="#fff" size="large" />
                        </View>
                    )}
                    {fullScreenVideoLoaded && showFullscreenControls && (
                        <TouchableWithoutFeedback
                            onPress={() => {
                                if (fullScreenControlsTimeoutHandle.current) {
                                    clearTimeout(fullScreenControlsTimeoutHandle.current);
                                    fullScreenControlsTimeoutHandle.current = null;
                                }
                                setShowFullscreenControls(false);
                            }}> 
                            <View
                                style={[
                                    StyleSheet.absoluteFillObject,
                                    {
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    },
                                ]}> 
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '80%',
                                    }}> 
                                    {showSkipButtons && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                fullscreenVideoRef.current?.seek(
                                                    fullscreenVideoPosition - skipInterval,
                                                );
                                                displayFullScreenControls();
                                            }}
                                            style={{ padding: 8 }}> 
                                            <Icon name="backward" size={25} color="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* skip previous button */}
                                    {onPreviousVideo && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                onPreviousVideo();
                                                displayFullScreenControls();
                                            }}
                                            style={{ padding: 8 }}> 
                                            <Icon name="skip-previous" size={25} color="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* play/pause button */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (isPlaying) {
                                                setCurrentlyPlaying(null);
                                            } else {
                                                setInlineVideoStarted(true);
                                                setCurrentlyPlaying(source ? JSON.stringify(source) : src ? src : null,  );
                                            }
                                            displayFullScreenControls();
                                        }}
                                        style={{ padding: 8 }}>
                                        {isPlaying ? ( 
                                            <Icon name="pause" size={25 * 2} color="#fff" />
                                        ) : ( 
                                            <Icon name="play" size={25 * 2} color="#fff" />
                                        )}
                                    </TouchableOpacity>

                                    {/* skip next button */}
                                    {onNextVideo && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                onNextVideo();
                                                displayFullScreenControls();
                                            }}
                                            style={{ padding: 8 }}>
                                            {/* <SkipNextIcon width={42} height={42} fill="#fff" /> */}
                                            <Icon name="skip-next" size={25} color="#fff" />
                                        </TouchableOpacity>
                                    )}

                                    {/* seek forward button */}
                                    {showSkipButtons && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                fullscreenVideoRef.current?.seek(
                                                    fullscreenVideoPosition + skipInterval,
                                                );
                                                displayFullScreenControls();
                                            }}
                                            style={{ padding: 8 }}>
                                            {/* <SeekForwardIcon width={42} height={42} fill="#fff" /> */}
                                            <Icon name="forward" size={25} color="#fff" />
                                        </TouchableOpacity>
                                    )}
                                </View>
 
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: 8,
                                        left: 0,
                                        right: 0,
                                        height: 40,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                    <Text style={{ color: '#fff', marginLeft: 8, fontSize: 12 }}>
                                        {formatSecondsTime(fullscreenVideoPosition)} /{' '}
                                        {formatSecondsTime(duration)}
                                    </Text>

                                    <View style={{ flexDirection: 'row' }}> 
                                        {muted ? (
                                            <TouchableOpacity
                                                style={[styles.iconButton]}
                                                onPress={() => {
                                                    setMuted(false);
                                                    displayFullScreenControls();
                                                }}> 
                                                <Icon name="volume-mute" size={25 / 1.2} color="#fff" />
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.iconButton]}
                                                onPress={() => {
                                                    setMuted(true);
                                                    displayFullScreenControls();
                                                }}> 
                                                <Icon name="volume-full" size={25 / 1.2} color="#fff" />
                                            </TouchableOpacity>
                                        )}
 
                                        <TouchableOpacity
                                            onPress={exitFullScreen}
                                            style={styles.iconButton}>
                                            <Icon name="fullscreen-exit" size={25 / 1.3} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
 
                                <View
                                    style={{
                                        backgroundColor: 'rgba(150, 150, 150, 0.4)',
                                        height: 3,
                                        position: 'absolute',
                                        bottom: 8,
                                        left: 0,
                                        right: 0,
                                    }}>
                                        <View
                                            style={[
                                                StyleSheet.absoluteFillObject,
                                                {
                                                    backgroundColor: 'rgb(150, 150, 150)',
                                                    width: `${
                                                        (fullscreenPlayableDuration * 100) / duration
                                                    }%`,
                                                },
                                            ]}
                                        />
                                        <View
                                            style={[
                                                StyleSheet.absoluteFillObject,
                                                {
                                                    backgroundColor: 'red',
                                                    width: `${
                                                        (fullscreenVideoPosition * 100) / duration
                                                    }%`,
                                                },
                                            ]}
                                        />
                                        <View
                                            style={{
                                                width: 12,
                                                height: 12,
                                                backgroundColor: 'red',
                                                borderRadius: 50,
                                                position: 'absolute',
                                                top: -5,
                                                left: `${(fullscreenVideoPosition * 100) / duration}%`,
                                            }}
                                        />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                </Modal>
            )}
        </View>
    );
};

export { VideoPlayer, VideoPlayerProvider };