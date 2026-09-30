import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

export default function Home() {
  return (
    <View style={globalStyles.screenContainer}>
      <Text style={globalStyles.screenTitle}>Home</Text>

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 24, paddingHorizontal: 32 }]}
        onPress={() => router.push('/explore')}
      >
        <Text style={globalStyles.buttonText}>Go to Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 12, paddingHorizontal: 32 }]}
        onPress={() => router.replace('./login')}
      >
        <Text style={globalStyles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}