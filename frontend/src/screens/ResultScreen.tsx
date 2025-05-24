import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { analyzeSentence } from '../logic/AnalyzeSentence';

export default function ResultScreen({ route }) {
  const { sentences } = route.params;
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const runAnalysis = async () => {
      const temp = [];

      for (const sentence of sentences) {
        const analysis = await analyzeSentence(sentence);
        temp.push({ sentence, ...analysis });
        setResults([...temp]); // 갱신
      }
    };
    runAnalysis();
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      {results.length === 0 ? (
        <ActivityIndicator size="large" />
      ) : (
        results.map((item, idx) => (
          <View key={idx} style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.sentence}</Text>
            <Text style={{ color: '#555' }}>방법: {item.method}</Text>
            <Text>{item.result}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
