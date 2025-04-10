import React from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';

export default function ListScreen({ items, setItems }) {
  const deleteItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <Text style={styles.empty}>Список порожній 🧺</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.item}>
              <Text>{item.name} – {item.quantity}</Text>
              <Button title="Видалити" onPress={() => deleteItem(index)} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 18 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
});
