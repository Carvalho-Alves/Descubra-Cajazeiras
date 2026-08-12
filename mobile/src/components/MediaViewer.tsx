import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  StyleProp,
  ImageStyle,
  ViewStyle,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { isVideoUrl } from '../utils/resolveAssetUrl';

type MediaViewerProps = {
  uri?: string | null;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  placeholder?: string;
};

export function MediaViewer({
  uri,
  style,
  imageStyle,
  placeholder = 'Sem mídia',
}: MediaViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!uri) {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Ionicons name="image-outline" size={32} color={Colors.muted} />
        <Text style={styles.placeholderText}>{placeholder}</Text>
      </View>
    );
  }

  if (isVideoUrl(uri)) {
    return (
      <View style={[styles.container, style]}>
        <Video
          source={{ uri }}
          style={[styles.media, imageStyle]}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          onLoadStart={() => {
            setLoading(true);
            setError(false);
          }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
        {loading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : null}
        {error ? (
          <View style={styles.overlay}>
            <Text style={styles.placeholderText}>Não foi possível carregar o vídeo</Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri }}
        style={[styles.media, imageStyle]}
        resizeMode="cover"
        onLoadStart={() => {
          setLoading(true);
          setError(false);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading ? (
        <View style={styles.overlay}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : null}
      {error ? (
        <View style={styles.overlay}>
          <Ionicons name="image-outline" size={32} color={Colors.muted} />
          <Text style={styles.placeholderText}>Imagem indisponível</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});
