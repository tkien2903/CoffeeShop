import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAudioRecorder, useAudioPlayer, AudioModule, RecordingPresets } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';

export default function MediaScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [fileInfo, setFileInfo] = useState<string | null>(null);

  // useAudioRecorder must be called at top level (Rules of Hooks)
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // File System info
  const checkFileInfo = async (uri: string) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        setFileInfo(
          `Kích thước: ${(info.size / 1024 / 1024).toFixed(2)} MB\nThư mục gốc: ${FileSystem.documentDirectory}`
        );
      }
    } catch (e) {
      console.log('Error reading file info', e);
    }
  };

  // Gallery picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Cần quyền truy cập thư viện ảnh!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const type = result.assets[0].type;
      const uri = result.assets[0].uri;
      if (type === 'video') {
        setVideoUri(uri);
        setImageUri(null);
      } else {
        setImageUri(uri);
        setVideoUri(null);
      }
      checkFileInfo(uri);
    }
  };

  // Camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Cần quyền truy cập camera!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const type = result.assets[0].type;
      const uri = result.assets[0].uri;
      if (type === 'video') {
        setVideoUri(uri);
        setImageUri(null);
      } else {
        setImageUri(uri);
        setVideoUri(null);
      }
      checkFileInfo(uri);
    }
  };

  // Audio Recording — uses expo-audio (replaces deprecated expo-av Audio)
  const startRecording = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) return;
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.record();
      setIsRecording(true);
      setFileInfo(null);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      setIsRecording(false);
      const uri = recorder.uri;
      if (uri) {
        setAudioUri(uri);
        checkFileInfo(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  // Save to Media Library
  const saveToGallery = async (uri: string) => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        alert('Đã lưu thành công vào thư viện!');
      } catch (err) {
        alert('Lỗi lưu file: ' + err);
      }
    }
  };

  return (
    <ScreenShell active="more">
      <BrandHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Multimedia API Demo</Text>

        {/* Gallery / Camera */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btn} onPress={pickImage}>
            <Ionicons name="images" size={24} color="#fff" />
            <Text style={styles.btnText}>Thư viện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.btnText}>Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Audio Recording */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: isRecording ? palette.red : palette.orange }]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons name="mic" size={24} color="#fff" />
            <Text style={styles.btnText}>{isRecording ? 'Dừng thu' : 'Ghi âm'}</Text>
          </TouchableOpacity>
          {/* AudioPlayButton is a separate component so useAudioPlayer hook is always called */}
          {audioUri && <AudioPlayButton uri={audioUri} />}
        </View>

        {/* File System Info */}
        {fileInfo && (
          <View style={styles.infoContainer}>
            <Ionicons name="document-text" size={20} color={palette.ink} />
            <Text style={styles.infoText}>{fileInfo}</Text>
          </View>
        )}

        {/* Image Preview */}
        {imageUri && (
          <View style={styles.previewContainer}>
            <Text style={styles.subtitle}>Ảnh đã chọn:</Text>
            <Image source={{ uri: imageUri }} style={styles.image} contentFit="contain" />
            <TouchableOpacity style={styles.saveBtn} onPress={() => saveToGallery(imageUri)}>
              <Text style={styles.saveBtnText}>Lưu ảnh vào Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Video Preview — separate component so useVideoPlayer hook is always called */}
        {videoUri && <VideoPreview uri={videoUri} onSave={() => saveToGallery(videoUri)} />}
      </ScrollView>
    </ScreenShell>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

// Separate component so useAudioPlayer is always called unconditionally
function AudioPlayButton({ uri }: { uri: string }) {
  const player = useAudioPlayer({ uri });

  const handlePlay = () => {
    player.seekTo(0);
    player.play();
  };

  return (
    <TouchableOpacity style={[styles.btn, { backgroundColor: '#4caf50' }]} onPress={handlePlay}>
      <Ionicons name="play" size={24} color="#fff" />
      <Text style={styles.btnText}>Nghe lại</Text>
    </TouchableOpacity>
  );
}

// Separate component so useVideoPlayer is always called unconditionally
function VideoPreview({ uri, onSave }: { uri: string; onSave: () => void }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  return (
    <View style={styles.previewContainer}>
      <Text style={styles.subtitle}>Video đã chọn:</Text>
      <VideoView player={player} style={styles.image} contentFit="contain" nativeControls />
      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveBtnText}>Lưu video vào Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.ink,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.ink,
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    backgroundColor: palette.orange,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: palette.ink,
    lineHeight: 20,
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  saveBtn: {
    marginTop: 15,
    backgroundColor: palette.ink,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
