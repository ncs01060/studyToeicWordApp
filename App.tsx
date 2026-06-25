import { StyleSheet, Text, View } from 'react-native';
import ShowWords from './components/ShowWords';

export default function App() {
  return (
    <View style={styles.container}>
      
      <Text style={styles.titleText}>토익 단어장</Text>
      <ShowWords/>
    </View>
  );
}

const styles = StyleSheet.create({
  titleText:{
    fontSize: 16,
    fontWeight:'800',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
