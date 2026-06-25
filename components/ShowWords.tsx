import { StyleSheet, Text, View } from "react-native";
import db from "../db/db.json"

export default function ShowWords(){
    return (
        <View style={styles.cardBox}>
            {db.map((item, index) => (
                <Text style={styles.wordText} key={index}>{item.word}</Text>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    cardBox:{
        shadowColor:"black",
        borderStyle:"solid",
        borderWidth: 2,
        borderRadius: 5,

    },
    wordText:{
        width:300,
        textAlign:"center",
        justifyContent: 'center',
        alignItems: 'center',
        height:300,
    }
})
