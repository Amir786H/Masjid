import React from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    View
} from 'react-native';

import { TasbihTheme } from '../../constants/TasbihTheme';
import { useTasbihLayout } from '../../hooks/useTasbihLayout';
import type { SurahTask } from '../../types/tasbih';
import { SectionHeader } from './SectionHeader';
import { SurahListItem } from './SurahListItem';

interface SurahPickerModalProps {
    visible: boolean;
    tasks: SurahTask[];
    activeSurahId?: string;
    onClose: () => void;
    onSelect: (id: string) => void;
}

export const SurahPickerModal: React.FC<SurahPickerModalProps> = ({
    visible,
    tasks,
    activeSurahId,
    onClose,
    onSelect,
}) => {
    const { rs } = useTasbihLayout();

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.container, { padding: rs(12), marginTop: rs(20) }]}>
                    <SectionHeader title="All Surah" actionLabel="Close" onActionPress={onClose} />

                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingTop: rs(8) }}
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => onSelect(item.id)}
                                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                                <SurahListItem task={item} isActive={item.id === activeSurahId} onPress={() => onSelect(item.id)} />
                            </Pressable>
                        )}
                        ItemSeparatorComponent={() => <View style={{ height: rs(6) }} />}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: TasbihTheme.colors.background,
    },
    container: {
        flex: 1,
    },
});

export default SurahPickerModal;
