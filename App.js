import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, FlatList,
  StyleSheet, useColorScheme, Switch, TouchableOpacity, Alert, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const Tab = createBottomTabNavigator();
const STORAGE_KEY = 'SHOPPING_LIST';
const THEME_KEY = 'APP_THEME';

// 📌 Пуш-нотифікації
async function scheduleNotification(itemName) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🛒 Не забудь купити!',
      body: `Товар: ${itemName}`,
    },
    trigger: { seconds: 10 }, // через 10 сек
  });
}

// 🧾 Список товарів
function ListScreen({ items, setItems, theme }) {
  const [showFavorites, setShowFavorites] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedQuantity, setEditedQuantity] = useState('');

  const updateStorage = async (updated) => {
    setItems(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteItem = async (index) => {
    const updated = items.filter((_, i) => i !== index);
    updateStorage(updated);
  };

  const toggleFavorite = async (index) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, favorite: !item.favorite } : item
    );
    updateStorage(updated);
  };

  const startEdit = (item, index) => {
    setEditingItem({ ...item, index });
    setEditedName(item.name);
    setEditedQuantity(item.quantity);
    setModalVisible(true);
  };

  const saveEdit = () => {
    const updated = [...items];
    updated[editingItem.index] = {
      ...editingItem,
      name: editedName,
      quantity: editedQuantity,
    };
    updateStorage(updated);
    setModalVisible(false);
  };

  const displayedItems = showFavorites
    ? items.filter(item => item.favorite)
    : items;

  return (
    <View style={styles(theme).container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={styles(theme).label}>Показати лише улюблені</Text>
        <Switch value={showFavorites} onValueChange={setShowFavorites} />
      </View>

      {displayedItems.length === 0 ? (
        <Text style={styles(theme).empty}>Список порожній 🧺</Text>
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles(theme).item}>
              <TouchableOpacity onPress={() => toggleFavorite(index)}>
                <Text style={{ fontSize: 20 }}>
                  {item.favorite ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
              <Text style={styles(theme).itemText}>
                {item.name} — {item.quantity}
              </Text>
              <Button title="✏️" onPress={() => startEdit(item, index)} />
              <Button title="🗑" onPress={() => deleteItem(index)} />
            </View>
          )}
        />
      )}

      {/* Modal для редагування */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles(theme).modalBackground}>
          <View style={styles(theme).modalContainer}>
            <TextInput
              style={styles(theme).input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Назва"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles(theme).input}
              value={editedQuantity}
              onChangeText={setEditedQuantity}
              placeholder="Кількість"
              keyboardType="numeric"
              placeholderTextColor="#888"
            />
            <Button title="Зберегти" onPress={saveEdit} />
            <Button title="Скасувати" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ➕ Додавання товарів
function AddScreen({ setItems, theme }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  const addItem = async () => {
    if (name.trim() && quantity.trim()) {
      const newItem = { name, quantity, favorite: false };
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const updated = existing ? [...JSON.parse(existing), newItem] : [newItem];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setItems(updated);
      await scheduleNotification(name);
      setName('');
      setQuantity('');
    }
  };

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).label}>Назва товару</Text>
      <TextInput
        style={styles(theme).input}
        value={name}
        onChangeText={setName}
        placeholder="Хліб"
        placeholderTextColor={theme === 'dark' ? '#ccc' : '#999'}
      />
      <Text style={styles(theme).label}>Кількість</Text>
      <TextInput
        style={styles(theme).input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        placeholder="2"
        placeholderTextColor={theme === 'dark' ? '#ccc' : '#999'}
      />
      <Button title="Додати" onPress={addItem} />
    </View>
  );
}

// ⚙️ Налаштування
function SettingsScreen({ isDark, toggleTheme, theme }) {
  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).label}>Темна тема</Text>
      <Switch value={isDark} onValueChange={toggleTheme} />
    </View>
  );
}

export default function App() {
  const systemTheme = useColorScheme();
  const [items, setItems] = useState([]);
  const [isDark, setIsDark] = useState(systemTheme === 'dark');

  useEffect(() => {
    const loadData = async () => {
      const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
      const storedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (storedItems) setItems(JSON.parse(storedItems));
      if (storedTheme) setIsDark(storedTheme === 'dark');
      await Notifications.requestPermissionsAsync();
    };
    loadData();
  }, []);

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    await AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  const theme = isDark ? 'dark' : 'light';

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const icons = {
              'Список': 'list',
              'Додати': 'add-circle',
              'Налаштування': 'settings',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Список">
          {() => <ListScreen items={items} setItems={setItems} theme={theme} />}
        </Tab.Screen>
        <Tab.Screen name="Додати">
          {() => <AddScreen setItems={setItems} theme={theme} />}
        </Tab.Screen>
        <Tab.Screen name="Налаштування">
          {() => <SettingsScreen isDark={isDark} toggleTheme={toggleTheme} theme={theme} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// 🎨 Стилі
const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    empty: {
      marginTop: 40,
      textAlign: 'center',
      fontSize: 18,
      color: theme === 'dark' ? '#ccc' : 'gray',
    },
    item: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: '#888',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    itemText: {
      fontSize: 16,
      flex: 1,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    label: {
      marginTop: 10,
      marginBottom: 4,
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    input: {
      borderWidth: 1,
      borderColor: '#888',
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '80%',
    },
  });
