import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SPACING } from '../../constants/theme';

interface DataPoint {
  date: string;
  maxWeight: number;
}

interface WeightProgressChartProps {
  data: DataPoint[];
  weightUnit: 'kg' | 'lbs';
}

export function WeightProgressChart({ data, weightUnit }: WeightProgressChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - SPACING.md * 2;
  const labels = data.map((d) => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  const values = data.map((d) => d.maxWeight);

  // Show at most 6 labels to avoid crowding
  const labelInterval = Math.max(1, Math.floor(labels.length / 6));
  const displayLabels = labels.map((l, i) =>
    i % labelInterval === 0 ? l : ''
  );

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: displayLabels,
          datasets: [{ data: values }],
        }}
        width={screenWidth}
        height={220}
        yAxisSuffix={` ${weightUnit}`}
        chartConfig={{
          backgroundColor: COLORS.surface,
          backgroundGradientFrom: COLORS.surface,
          backgroundGradientTo: COLORS.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
          labelColor: () => COLORS.textSecondary,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: COLORS.primary,
          },
          propsForBackgroundLines: {
            stroke: COLORS.border,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  empty: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
  },
});
