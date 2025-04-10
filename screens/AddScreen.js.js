import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';

export default function AddScreen({ setItems }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  const addItem = () => {
    if (name && quantity) {
      setItems(prev => [...prev, { name, quantity }]);
      setName('');
      setQuantity('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Назва товару</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Наприклад: Хліб"
      />
      <Text style={styles.label}>Кількість</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Наприклад: 2"
        keyboardType="numeric"
      />
      <Button title="Додати" onPress={addItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
});
