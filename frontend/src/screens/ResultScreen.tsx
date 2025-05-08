// 파일 위치: frontend/src/screens/ResultScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { openDatabase } from '../database/database';

const ResultScreen = ({ route }: any) => {
  const { dream } = route.params; // ✅ 입력받은 꿈
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const searchDream = async () => {
      try {
        const db = await openDatabase();

        db.transaction(tx => {
          // ✅ 예시: keyword에 dream 내용 일부가 포함된 경우 검색
          tx.executeSql(
            'SELECT * FROM dreams WHERE keyword LIKE ?',
            [`%${dream}%`],
            (_, { rows }) => {
              console.log('✅ 검색 결과:', rows._array);
              setResults(rows._array);
            },
            (_, error) => {
              console.error('❌ 검색 실패:', error);
              return false;
            }
          );
        });
      } catch (error) {
        console.error('❌ DB 연결 오류:', error);
      }
    };

    searchDream();
  }, [dream]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>꿈 해몽 결과</Text>
      {results.length > 0 ? (
        results.map((item, index) => (
          <View key={index} style={styles.resultBox}>
            <Text style={styles.resultDream}>{item.dream}</Text>
            <Text style={styles.resultInterpretation}>{item.interpretation}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noResult}>결과가 없습니다.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultBox: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  resultDream: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  resultInterpretation: {
    fontSize: 14,
    color: '#555',
  },
  noResult: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ResultScreen;
