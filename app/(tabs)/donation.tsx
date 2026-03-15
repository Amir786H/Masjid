import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function DonationScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Donation Screen Placeholder</Text>
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
