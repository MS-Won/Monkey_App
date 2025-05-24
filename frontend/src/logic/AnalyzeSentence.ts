import { openDatabase } from 'react-native-sqlite-storage';
import { getGPTInterpretation } from './gpt';
import { getEmbedding, cosineSimilarity } from './embedding';

export const analyzeSentence = async (sentence: string): Promise<{
  method: 'DB' | 'EMBEDDING' | 'GPT' | 'ERROR';
  result: string;
}> => {
  try {
    const db = await openDatabase({ name: 'dreams.db', location: 'default' });

    return new Promise((resolve) => {
      db.transaction((tx: any) => {
        // 1. DB 검색
        tx.executeSql(
          'SELECT interpretation FROM dreams WHERE keyword LIKE ? LIMIT 1',
          [`%${sentence}%`],
          (_: any, { rows }: { rows: any }) => {
            if (rows.length > 0) {
              resolve({ method: 'DB', result: rows.item(0).interpretation });
            } else {
              // 2. 임베딩 유사도 비교
              tx.executeSql('SELECT title, embedding, interpretation FROM dreams', [], async (_: any, { rows }: { rows: any }) => {
                const userEmbedding = await getEmbedding(sentence);
                let bestScore = 0;
                let bestMatch = null;

                for (let i = 0; i < rows.length; i++) {
                  const row = rows.item(i);
                  const dbEmbedding = JSON.parse(row.embedding); // 문자열 → 배열
                  const score = cosineSimilarity(userEmbedding, dbEmbedding);
                  if (score > bestScore) {
                    bestScore = score;
                    bestMatch = row;
                  }
                }

                if (bestScore > 0.85 && bestMatch) {
                  resolve({ method: 'EMBEDDING', result: bestMatch.interpretation });
                } else {
                  // 3. GPT 백업
                  const gptResult = await getGPTInterpretation(sentence);
                  resolve({ method: 'GPT', result: gptResult });
                }
              });
            }
          }
        );
      });
    });
  } catch (err) {
    console.error('❌ analyzeSentence 오류:', err);
    return { method: 'ERROR', result: '해석 실패' };
  }
};
