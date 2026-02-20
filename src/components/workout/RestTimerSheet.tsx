import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useTimer } from '../../hooks/useTimer';
import { formatTimerDisplay } from '../../utils/formatting';
import { REST_TIME_PRESETS } from '../../constants/config';
import { COLORS, SPACING } from '../../constants/theme';

interface RestTimerSheetProps {
  visible: boolean;
  defaultTime: number;
  onDismiss: () => void;
}

export function RestTimerSheet({
  visible,
  defaultTime,
  onDismiss,
}: RestTimerSheetProps) {
  const timer = useTimer();

  const handlePreset = (seconds: number) => {
    timer.start(seconds);
  };

  const handleClose = () => {
    timer.reset();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              Rest Timer
            </Text>
            <IconButton icon="close" onPress={handleClose} />
          </View>

          <View style={styles.timerDisplay}>
            <Text variant="displayLarge" style={styles.timerText}>
              {formatTimerDisplay(timer.timeRemaining)}
            </Text>
            {timer.totalTime > 0 && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[styles.progressBar, { width: `${timer.progress * 100}%` }]}
                />
              </View>
            )}
          </View>

          <View style={styles.presets}>
            {REST_TIME_PRESETS.map((t) => (
              <Button
                key={t}
                mode={defaultTime === t ? 'contained' : 'outlined'}
                onPress={() => handlePreset(t)}
                compact
                style={styles.presetButton}
              >
                {t >= 60 ? `${t / 60}m` : `${t}s`}
              </Button>
            ))}
          </View>

          <View style={styles.controls}>
            {timer.isRunning ? (
              <Button mode="contained" onPress={timer.pause} icon="pause">
                Pause
              </Button>
            ) : timer.timeRemaining > 0 ? (
              <Button mode="contained" onPress={timer.resume} icon="play">
                Resume
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => timer.start(defaultTime)}
                icon="play"
              >
                Start ({defaultTime >= 60 ? `${defaultTime / 60}m` : `${defaultTime}s`})
              </Button>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl + 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  timerDisplay: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  timerText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 64,
  },
  progressBarContainer: {
    width: '80%',
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  presetButton: {
    minWidth: 56,
  },
  controls: {
    alignItems: 'center',
  },
});
