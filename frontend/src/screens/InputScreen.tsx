// src/screens/InputScreen.tsx
import { OPENAI_API_KEY } from '@env';
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
} from 'react-native';

const InputScreen = ({ navigation }: any) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedInput = input?.trim();

    if (typeof trimmedInput !== 'string' || !trimmedInput || trimmedInput.length < 2) {
      Alert.alert('입력 오류', '꿈 내용을 정확히 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                '사용자가 입력한 꿈을 의미 단위로 자연스럽게 나누어줘. 각각 독립된 문장으로 최대한 자연스럽고 명확하게 분리해줘. 결과는 반드시 JSON 배열 ["문장1", "문장2", ...] 형식으로만 반환해.',
            },
            {
              role: 'user',
              content: trimmedInput,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('❌ 응답 오류 상태:', res.status);
        console.error('❌ 응답 내용:', errText);
        Alert.alert('GPT 오류', `응답 실패: ${res.status}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('GPT 응답 content가 비어 있음');

      const splitDreams = JSON.parse(content);
      console.log('🧠 분리된 꿈:', splitDreams);

      navigation.navigate('Result', { splitDreams });

    } catch (error) {
      console.error('❌ GPT 요청 실패:', error);
      Alert.alert('오류', 'GPT 호출 또는 해석 중 문제가 발생했습니다.');
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>꿈 내용을 입력해주세요</Text>
      <TextInput
        multiline
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="예: 김태희랑 쇼핑을 가서 신발을 샀는데 눈에서 피가 나고 결국 죽었어"
      />
      <Button
        title={loading ? '처리 중...' : '해몽 시작'}
        onPress={handleSubmit}
        disabled={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    padding: 10,
    minHeight: 120,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 16,
  },
});

export default InputScreen;
