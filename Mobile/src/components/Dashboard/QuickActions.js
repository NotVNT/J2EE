import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ActionButton from '../ui/ActionButton';
import { useAppColors } from '../../constants/colors';

export default function QuickActions() {
  const navigation = useNavigation();
  const colors = useAppColors();

  const ACTION_ITEMS = [
    { icon: 'chatbubble-ellipses-outline', label: 'Trò chuyện\nAI', color: colors.ACTION_VOICE || '#A855F7', route: 'Chat' },
    { icon: 'cart-outline', label: 'Thêm\nChi tiêu', color: colors.ACTION_EXPENSE || '#F97316', route: 'AddExpense' },
    { icon: 'wallet-outline', label: 'Thêm\nThu nhập', color: colors.ACTION_INCOME || '#22C55E', route: 'AddIncome' },
    { icon: 'flag-outline', label: 'Thiết lập\nMục tiêu', color: colors.ACTION_GOAL || '#3B82F6', route: 'Goal' },
  ];

  return (
    <View style={styles.container}>
      {ACTION_ITEMS.map((item, index) => (
        <ActionButton
          key={index}
          icon={item.icon}
          label={item.label}
          color={item.color}
          onPress={() => {
            if (item.route === 'Chat') {
              navigation.navigate('HomeTab', { screen: 'Chat' });
            } else {
              navigation.navigate('HomeTab', { screen: item.route });
            }
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 4,
  },
});
