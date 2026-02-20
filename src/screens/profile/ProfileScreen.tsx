import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  SegmentedButtons,
  List,
  Divider,
} from 'react-native-paper';
import { useUser } from '../../context/UserContext';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { COLORS, SPACING } from '../../constants/theme';
import { REST_TIME_PRESETS } from '../../constants/config';

export function ProfileScreen() {
  const { user, loading, updatePreferences, updateProfile } = useUser();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  if (loading || !user) return <LoadingScreen />;

  const handleSaveName = async () => {
    if (nameValue.trim()) {
      await updateProfile({ displayName: nameValue.trim() });
    }
    setEditingName(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text variant="headlineLarge" style={styles.avatarText}>
            {user.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        {editingName ? (
          <TextInput
            value={nameValue}
            onChangeText={setNameValue}
            onBlur={handleSaveName}
            onSubmitEditing={handleSaveName}
            autoFocus
            mode="outlined"
            style={styles.nameInput}
          />
        ) : (
          <Text
            variant="headlineSmall"
            style={styles.name}
            onPress={() => {
              setNameValue(user.displayName);
              setEditingName(true);
            }}
          >
            {user.displayName}
          </Text>
        )}
        <Text variant="bodyMedium" style={styles.username}>
          @{user.username}
        </Text>
      </View>

      <Divider />

      <List.Section>
        <List.Subheader>Preferences</List.Subheader>

        <View style={styles.prefItem}>
          <Text variant="bodyLarge" style={styles.prefLabel}>Weight Unit</Text>
          <SegmentedButtons
            value={user.preferences.weightUnit}
            onValueChange={(value) =>
              updatePreferences({ weightUnit: value as 'kg' | 'lbs' })
            }
            buttons={[
              { value: 'lbs', label: 'lbs' },
              { value: 'kg', label: 'kg' },
            ]}
            style={styles.segmented}
          />
        </View>

        <View style={styles.prefItem}>
          <Text variant="bodyLarge" style={styles.prefLabel}>Default Rest Time</Text>
          <SegmentedButtons
            value={String(user.preferences.defaultRestTime)}
            onValueChange={(value) =>
              updatePreferences({ defaultRestTime: Number(value) })
            }
            buttons={REST_TIME_PRESETS.map((t) => ({
              value: String(t),
              label: t >= 60 ? `${t / 60}m` : `${t}s`,
            }))}
            style={styles.segmented}
          />
        </View>

        <View style={styles.prefItem}>
          <Text variant="bodyLarge" style={styles.prefLabel}>Theme</Text>
          <SegmentedButtons
            value={user.preferences.theme}
            onValueChange={(value) =>
              updatePreferences({ theme: value as 'light' | 'dark' | 'auto' })
            }
            buttons={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'Auto' },
            ]}
            style={styles.segmented}
          />
        </View>
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  name: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  nameInput: {
    width: 200,
    marginBottom: SPACING.sm,
  },
  username: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  prefItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  prefLabel: {
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  segmented: {
    alignSelf: 'stretch',
  },
});
