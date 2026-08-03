// Example: Donations Integration with Supabase

import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { useAppStore } from '../stores/appStore';
import { createDonation, fetchMasjids } from '../services/databaseService';

export default function DonationsExample() {
  const { user } = useAuthContext();
  const { donations, loadingDonations, loadDonations } = useAppStore();
  const [masjids, setMasjids] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedMasjid, setSelectedMasjid] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadDonations(user.id);
      loadMasjids();
    }
  }, [user]);

  const loadMasjids = async () => {
    try {
      const data = await fetchMasjids();
      setMasjids(data);
    } catch (err) {
      console.error('Error loading masjids:', err);
    }
  };

  const handleDonate = async () => {
    if (!user || !amount || !selectedMasjid) {
      alert('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      await createDonation(user.id, {
        masjid_id: selectedMasjid,
        amount: parseFloat(amount),
        currency: 'USD',
        payment_method: 'card',
        purpose: purpose || 'General',
      });

      alert('Donation successful!');
      setAmount('');
      setPurpose('');
      setSelectedMasjid(null);
      setModalVisible(false);
      
      // Reload donations
      await loadDonations(user.id);
    } catch (err) {
      alert('Failed to process donation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDonations) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Donations</Text>
        <TouchableOpacity
          style={styles.donateButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.donateButtonText}>+ New Donation</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={donations}
        renderItem={({ item }) => (
          <View style={styles.donationCard}>
            <View style={styles.cardContent}>
              <Text style={styles.masjidName}>{item.masjids?.name || 'General'}</Text>
              <Text style={styles.purpose}>{item.purpose}</Text>
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No donations yet</Text>
          </View>
        }
      />

      {/* Donation Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make a Donation</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Masjid</Text>
                <View style={styles.pickerContainer}>
                  {masjids.map((masjid) => (
                    <TouchableOpacity
                      key={masjid.id}
                      style={[
                        styles.pickerOption,
                        selectedMasjid === masjid.id && styles.pickerOptionSelected,
                      ]}
                      onPress={() => setSelectedMasjid(masjid.id)}
                    >
                      <Text style={styles.pickerOptionText}>{masjid.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  editable={!submitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Purpose (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Building Fund, Maintenance"
                  value={purpose}
                  onChangeText={setPurpose}
                  editable={!submitting}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.buttonDisabled]}
                onPress={handleDonate}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Processing...' : 'Donate'}
                </Text>
              </TouchableOpacity>
            </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  donateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  donateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  donationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardContent: {
    flex: 1,
  },
  masjidName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  purpose: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  pickerContainer: {
    gap: 8,
  },
  pickerOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
