import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer, type VideoContentFit } from 'expo-video';

type ExerciseMediaProps = {
  uri: string;
  height?: number;
  borderRadius?: number;
  contentFit?: VideoContentFit;
};

export function ExerciseMedia({
  uri,
  height = 220,
  borderRadius = 16,
  contentFit = 'contain',
}: ExerciseMediaProps) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  return (
    <View style={[styles.container, { height, borderRadius }]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        nativeControls
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
});
