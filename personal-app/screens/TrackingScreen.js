import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';

const STORAGE_KEY = '@expense_data';
const CATEGORIES_KEY = '@expense_categories';
const CURRENCY_SYMBOL = '$'; // Change this to your preferred currency symbol

const DEFAULT_CATEGORIES = [
  'Misc',
  'Personal Care',
  'Travel',
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Transportation',
];

export default function TrackingScreen() {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newExpense, setNewExpense] = useState({
    category: '',
    name: '',
    price: '',
  });

  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setMonths(parsed);
        if (parsed.length > 0 && !selectedMonth) {
          setSelectedMonth(parsed[0].id);
        }
      } else {
        // Initialize with current month
        const currentMonth = getCurrentMonthLabel();
        const initialMonth = {
          id: Date.now().toString(),
          label: currentMonth,
          expenses: [],
        };
        setMonths([initialMonth]);
        setSelectedMonth(initialMonth.id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([initialMonth]));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await AsyncStorage.getItem(CATEGORIES_KEY);
      if (data) {
        setCategories(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const saveCategories = async (cats) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
      setCategories(cats);
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    if (categories.includes(newCategoryName.trim())) {
      Alert.alert('Error', 'Category already exists');
      return;
    }
    const updated = [...categories, newCategoryName.trim()];
    saveCategories(updated);
    setNewCategoryName('');
  };

  const deleteCategory = (category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = categories.filter((cat) => cat !== category);
            saveCategories(updated);
          },
        },
      ]
    );
  };

  const getCurrentMonthLabel = () => {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[now.getMonth()]} ${now.getFullYear().toString().slice(-2)}`;
  };

  const getNextMonth = (currentLabel) => {
    const parts = currentLabel.split(' ');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = monthNames.indexOf(parts[0]);
    const currentYear = parseInt(parts[1]);

    let nextMonthIndex = currentMonthIndex + 1;
    let nextYear = currentYear;

    if (nextMonthIndex > 11) {
      nextMonthIndex = 0;
      nextYear = currentYear + 1;
    }

    return `${monthNames[nextMonthIndex]} ${nextYear}`;
  };

  const addMonth = () => {
    if (months.length === 0) {
      const currentMonth = getCurrentMonthLabel();
      const newMonth = {
        id: Date.now().toString(),
        label: currentMonth,
        expenses: [],
      };
      const updated = [...months, newMonth];
      setMonths(updated);
      setSelectedMonth(newMonth.id);
      saveData(updated);
    } else {
      const lastMonth = months[months.length - 1];
      const nextMonthLabel = getNextMonth(lastMonth.label);
      const newMonth = {
        id: Date.now().toString(),
        label: nextMonthLabel,
        expenses: [],
      };
      const updated = [...months, newMonth];
      setMonths(updated);
      setSelectedMonth(newMonth.id);
      saveData(updated);
    }
  };

  const deleteMonth = (monthId) => {
    Alert.alert(
      'Delete Month',
      'Are you sure you want to delete this month? All expenses in this month will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = months.filter((month) => month.id !== monthId);
            
            // If we deleted the selected month, select another one
            if (selectedMonth === monthId) {
              if (updated.length > 0) {
                setSelectedMonth(updated[0].id);
              } else {
                setSelectedMonth(null);
              }
            }
            
            setMonths(updated);
            saveData(updated);
          },
        },
      ]
    );
  };

  const addExpense = () => {
    if (!newExpense.category || !newExpense.name || !newExpense.price) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const price = parseFloat(newExpense.price);
    if (isNaN(price)) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const updated = months.map((month) => {
      if (month.id === selectedMonth) {
        return {
          ...month,
          expenses: [
            ...month.expenses,
            {
              id: Date.now().toString(),
              category: newExpense.category,
              name: newExpense.name,
              price: price,
            },
          ],
        };
      }
      return month;
    });

    setMonths(updated);
    saveData(updated);
    setNewExpense({ category: '', name: '', price: '' });
    setShowAddExpense(false);
  };

  const deleteExpense = (expenseId) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = months.map((month) => {
              if (month.id === selectedMonth) {
                return {
                  ...month,
                  expenses: month.expenses.filter((exp) => exp.id !== expenseId),
                };
              }
              return month;
            });
            setMonths(updated);
            saveData(updated);
          },
        },
      ]
    );
  };

  const getCurrentMonth = () => {
    return months.find((m) => m.id === selectedMonth);
  };

  const calculateTotal = () => {
    const currentMonth = getCurrentMonth();
    if (!currentMonth) return 0;
    return currentMonth.expenses.reduce((sum, exp) => sum + exp.price, 0);
  };

  const getCategoryData = () => {
    const currentMonth = getCurrentMonth();
    if (!currentMonth || currentMonth.expenses.length === 0) return [];

    const categoryMap = {};
    currentMonth.expenses.forEach((exp) => {
      if (categoryMap[exp.category]) {
        categoryMap[exp.category] += exp.price;
      } else {
        categoryMap[exp.category] = exp.price;
      }
    });

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E91E63', '#8BC34A'];
    let colorIndex = 0;

    return Object.keys(categoryMap).map((category) => ({
      name: category,
      amount: categoryMap[category],
      color: colors[colorIndex++ % colors.length],
      legendFontColor: '#333',
      legendFontSize: 14,
    }));
  };

  const getAllTimeCategoryData = () => {
    if (months.length === 0) return [];

    const categoryMap = {};
    let totalAllTime = 0;

    // Combine all expenses from all months
    months.forEach((month) => {
      month.expenses.forEach((exp) => {
        if (categoryMap[exp.category]) {
          categoryMap[exp.category] += exp.price;
        } else {
          categoryMap[exp.category] = exp.price;
        }
        totalAllTime += exp.price;
      });
    });

    if (totalAllTime === 0) return [];

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E91E63', '#8BC34A'];
    let colorIndex = 0;

    return Object.keys(categoryMap).map((category) => ({
      name: category,
      amount: categoryMap[category],
      color: colors[colorIndex++ % colors.length],
      legendFontColor: '#333',
      legendFontSize: 14,
    }));
  };

  const calculateAllTimeTotal = () => {
    let total = 0;
    months.forEach((month) => {
      month.expenses.forEach((exp) => {
        total += exp.price;
      });
    });
    return total;
  };

  const currentMonth = getCurrentMonth();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.topSpacer} />
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => setShowMonthDropdown(!showMonthDropdown)}
          >
            <Text style={styles.monthButtonText}>
              {currentMonth ? currentMonth.label : 'Select Month'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addMonthButton} onPress={addMonth}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Month Dropdown */}
        {showMonthDropdown && (
          <View style={styles.dropdown}>
            {months.map((month) => (
              <View
                key={month.id}
                style={[
                  styles.dropdownItem,
                  selectedMonth === month.id && styles.dropdownItemSelected,
                ]}
              >
                <TouchableOpacity
                  style={styles.dropdownItemButton}
                  onPress={() => {
                    setSelectedMonth(month.id);
                    setShowMonthDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{month.label}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteMonthButton}
                  onPress={() => {
                    setShowMonthDropdown(false);
                    deleteMonth(month.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#f44336" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Expenses:</Text>
          <Text style={styles.totalAmount}>{CURRENCY_SYMBOL}{calculateTotal().toFixed(2)}</Text>
        </View>

        {/* Pie Chart */}
        {currentMonth && currentMonth.expenses.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Expenses by Category</Text>
            <View style={styles.pieChartWrapper}>
              <PieChart
                data={getCategoryData()}
                width={Dimensions.get('window').width}
                height={260}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="85"
                absolute={false}
                hasLegend={false}
                avoidFalseZero={true}
              />
            </View>
            <View style={styles.legendContainer}>
              {getCategoryData().map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>
                    {item.name} ({((item.amount / calculateTotal()) * 100).toFixed(1)}%): {CURRENCY_SYMBOL}{item.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Expense Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.categoryColumn]}>Category</Text>
            <Text style={[styles.tableHeaderText, styles.nameColumn]}>Name</Text>
            <Text style={[styles.tableHeaderText, styles.priceColumn]}>Price</Text>
            <View style={styles.actionColumn} />
          </View>

          {currentMonth &&
            currentMonth.expenses.map((expense) => (
              <View key={expense.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.categoryColumn]}>{expense.category}</Text>
                <Text style={[styles.tableCell, styles.nameColumn]}>{expense.name}</Text>
                <Text style={[styles.tableCell, styles.priceColumn]}>{CURRENCY_SYMBOL}{expense.price.toFixed(2)}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteExpense(expense.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#f44336" />
                </TouchableOpacity>
              </View>
            ))}

          {currentMonth && currentMonth.expenses.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No expenses added yet</Text>
            </View>
          )}
        </View>

        {/* All-Time Expenses Pie Chart */}
        {months.length > 0 && calculateAllTimeTotal() > 0 && (
          <View style={styles.allTimeChartContainer}>
            <Text style={styles.chartTitle}>All-Time Expenses by Category</Text>
            <View style={styles.pieChartWrapper}>
              <PieChart
                data={getAllTimeCategoryData()}
                width={Dimensions.get('window').width}
                height={260}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="85"
                absolute={false}
                hasLegend={false}
                avoidFalseZero={true}
              />
            </View>
            <View style={styles.legendContainer}>
              {getAllTimeCategoryData().map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>
                    {item.name} ({((item.amount / calculateAllTimeTotal()) * 100).toFixed(1)}%): {CURRENCY_SYMBOL}{item.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.allTimeTotalContainer}>
              <Text style={styles.allTimeTotalLabel}>All-Time Total:</Text>
              <Text style={styles.allTimeTotalAmount}>{CURRENCY_SYMBOL}{calculateAllTimeTotal().toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Manage Categories Button */}
      <TouchableOpacity
        style={styles.manageCategoriesFab}
        onPress={() => setShowManageCategories(true)}
      >
        <Ionicons name="settings-outline" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Add Expense Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddExpense(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddExpense}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddExpense(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <TouchableOpacity onPress={() => setShowAddExpense(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={[styles.dropdownButtonText, !newExpense.category && styles.placeholderText]}>
                {newExpense.category || 'Select Category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {showCategoryDropdown && (
              <View style={styles.categoryDropdown}>
                <ScrollView style={styles.categoryScrollView}>
                  {categories.map((cat, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.categoryDropdownItem}
                      onPress={() => {
                        setNewExpense({ ...newExpense, category: cat });
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.categoryDropdownItemText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newExpense.name}
              onChangeText={(text) =>
                setNewExpense({ ...newExpense, name: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Price"
              value={newExpense.price}
              onChangeText={(text) =>
                setNewExpense({ ...newExpense, price: text })
              }
              keyboardType="decimal-pad"
            />

            <TouchableOpacity style={styles.addButton} onPress={addExpense}>
              <Text style={styles.addButtonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Manage Categories Modal */}
      <Modal
        visible={showManageCategories}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManageCategories(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Categories</Text>
              <TouchableOpacity onPress={() => setShowManageCategories(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.addCategoryContainer}>
              <TextInput
                style={styles.categoryInput}
                placeholder="New Category Name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <TouchableOpacity style={styles.addCategoryButton} onPress={addCategory}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoriesList}>
              {categories.map((cat, index) => (
                <View key={index} style={styles.categoryItem}>
                  <Text style={styles.categoryItemText}>{cat}</Text>
                  <TouchableOpacity onPress={() => deleteCategory(cat)}>
                    <Ionicons name="trash-outline" size={20} color="#f44336" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  topSpacer: {
    height: 40,
  },
  monthSelector: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  monthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  monthButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addMonthButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
  },
  dropdown: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 5,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dropdownItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  dropdownItemButton: {
    flex: 1,
    padding: 15,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  deleteMonthButton: {
    padding: 15,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginTop: 15,
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  pieChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  legendContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 10,
  },
  legendText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  allTimeTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#2196F3',
  },
  allTimeTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  allTimeTotalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  allTimeChartContainer: {
    backgroundColor: '#fff',
    marginTop: 5,
    marginHorizontal: 15,
    marginBottom: 80,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  tableContainer: {
    backgroundColor: '#fff',
    marginTop: 15,
    marginHorizontal: 15,
    marginBottom: 80,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
  categoryColumn: {
    flex: 2,
  },
  nameColumn: {
    flex: 2,
  },
  priceColumn: {
    flex: 1.5,
    textAlign: 'right',
  },
  actionColumn: {
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  manageCategoriesFab: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  categoryDropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    maxHeight: 150,
    backgroundColor: '#fff',
  },
  categoryScrollView: {
    maxHeight: 150,
  },
  categoryDropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryDropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  addCategoryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  addCategoryButton: {
    backgroundColor: '#4CAF50',
    width: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
});

