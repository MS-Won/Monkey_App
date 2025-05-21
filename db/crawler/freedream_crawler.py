import requests
from bs4 import BeautifulSoup
import chardet
import time
import json
import os
from urllib.parse import quote

# ✅ 크롤링 함수: "꿈" 으로 끝까지
def crawl_all_from_keyword(keyword="꿈"):
    result = []
    encoded_keyword = quote(keyword, encoding='euc-kr')
    page = 1

    while True:
        print(f"[{page}] 📄 [{keyword}] 페이지 크롤링 중...")

        url = (
            f"http://www.freedream24.com/freedream/dreamsearch.asp"
            f"?page={page}"
            f"&keyword={encoded_keyword}"
            f"&result_in="
            f"&keyword_table={encoded_keyword}"
            f"&keyword_count=0"
            f"&scheck=no"
        )

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
        except Exception as e:
            print(f"❌ 요청 실패 [{page}]: {e}")
            break

        detected_encoding = chardet.detect(response.content)
        html_content = response.content.decode(detected_encoding['encoding'], errors='replace')
        soup = BeautifulSoup(html_content, 'html.parser')
        raw_text = soup.get_text(separator='\n').strip()
        lines = raw_text.split('\n')

        found_any = False
        temp_title = None
        next_is_description = False

        for line in lines:
            line = line.strip()

            if line.endswith('꿈') and '꿈의 번호' not in line:
                temp_title = line
                continue

            if line == '꿈의 번호' and temp_title:
                next_is_description = True
                continue

            if next_is_description and line == '':
                continue

            if next_is_description and line != '':
                interpretation = line
                result.append({
                    'dream': temp_title,
                    'interpretation': interpretation
                })
                temp_title = None
                next_is_description = False
                found_any = True

        if not found_any:
            print(f"🛑 [{page}] 더 이상 데이터 없음. 크롤링 종료.")
            break

        page += 1
        time.sleep(1)

    return result

# ✅ 실행
if __name__ == "__main__":
    os.makedirs('data', exist_ok=True)

    print("🚀 전체 해몽 DB 크롤링 시작 (검색어: 꿈)...")
    all_dreams = crawl_all_from_keyword("꿈")

    save_path = "data/dream_data_all.json"
    with open(save_path, 'w', encoding='utf-8') as f:
        json.dump(all_dreams, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 총 수집된 꿈 개수: {len(all_dreams)}")
    print(f"📁 저장 완료: {save_path}")
