import { OPENAI_API_KEY } from '@env';

export const getGPTInterpretation = async (text: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '당신은 전통 한국 꿈 해몽 전문가입니다. 입력되는 문장은 사용자의 꿈 중 일부입니다. 심리학적 해석 없이 전통적 해몽 기반으로만 해석해주세요.',
        },
        {
          role: 'user',
          content: `"${text}" 이 꿈은 어떤 의미인가요?`,
        },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content.trim();
  } else {
    console.error('GPT 응답 실패:', data);
    return 'GPT 해석을 가져오지 못했습니다.';
  }
};
