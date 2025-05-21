# 파일 경로: db/transform/field_splitter_8field.py

import json
import time
import os
from openai import OpenAI

# ✅ OpenAI API 키 입력
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# ✅ 파일 경로 설정
input_path = '../crawler/data/dream_data_all.json'
output_path = '../crawler/data/dream_data_structured.json'

# ✅ GPT를 호출해서 8필드로 변환하는 함수
def split_into_8_fields(dream, interpretation, retries=3):
    prompt = f"""
아래는 꿈과 해몽이다.
전통 해몽 데이터를 기반으로 다음 7개 필드를 의미 단위로 분리해라.
- keyword: 꿈에 등장하는 주요 명사
- action: 주요 동작
- subject: 동작의 주체 (주체가 '너'인 경우엔 '나'로 작성, 주체가 그냥 '꿈꾸는 사람'인 경우 '나'로 작성성)
- object: 동작의 대상
- context: 장소, 상황, 배경
- type: 꿈의 유형 (길몽, 흉몽, 예지몽 등. 없으면 빈칸)
- interpretation: 주어진 해몽 그대로 사용

심리 해석 금지하고, 고전적 해몽 기준으로만 나눠야 한다.

결과는 반드시 아래와 같은 JSON 형식으로만 만들어라:

{{
  "dream": "",
  "keyword": "",
  "action": "",
  "subject": "",
  "object": "",
  "context": "",
  "type": "",
  "interpretation": ""
}}

[꿈]
{dream}

[해몽]
{interpretation}
"""

    attempt = 0
    while attempt < retries:
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": "너는 전통적인 꿈 해몽 전문가이다."},
                    {"role": "user", "content": prompt}
                ],
                timeout=30
            )

            gpt_response = response.choices[0].message.content.strip()

            if not gpt_response:
                raise ValueError("GPT 응답이 비어 있음")

            json_result = json.loads(gpt_response)
            json_result["dream"] = dream  # dream 필드 직접 추가 (혹시 누락될 경우 대비)
            return json_result

        except Exception as e:
            print(f"❌ GPT 호출 오류: {e}")
            attempt += 1
            print(f"🔁 재시도 {attempt}/{retries}...")
            time.sleep(3)

    print("🚫 재시도 실패")
    return None

# ✅ 원본 데이터 로드
with open(input_path, 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

# ✅ 기존 결과 불러오기
if os.path.exists(output_path):
    with open(output_path, 'r', encoding='utf-8') as f:
        structured_data = json.load(f)
else:
    structured_data = []

start_index = len(structured_data)
print(f"🚀 시작: 총 {len(raw_data)}개 중 {start_index}부터 시작")

# ✅ 1개씩 순차 처리
for i, entry in enumerate(raw_data[start_index:], start=start_index):
    dream = entry['dream']
    interpretation = entry['interpretation']

    print(f"\n📄 [{i+1}] {dream}")

    result = split_into_8_fields(dream, interpretation)

    if result:
        structured_data.append(result)
    else:
        structured_data.append({
            "dream": dream,
            "keyword": "",
            "action": "",
            "subject": "",
            "object": "",
            "context": "",
            "type": "",
            "interpretation": interpretation,
            "error": "GPT 실패"
        })

    # ✅ 매 요청마다 중간 저장
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(structured_data, f, ensure_ascii=False, indent=2)

    time.sleep(1)  # ✅ 서버 과부하 방지

print("\n✅ 전체 변환 및 저장 완료!")
