import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function PrayersScreen() {

    // Quran data
    // https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions.json
    
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Prayers Screen Placeholder</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
    },
});
