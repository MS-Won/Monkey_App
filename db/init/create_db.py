# 파일 경로: db/init/create_db.py

import sqlite3
import json
import os

# ✅ 파일 경로 설정
input_json_path = '../crawler/data/dream_data_structured.json'
output_db_path = '../dreams.db'

# ✅ 데이터 로드
with open(input_json_path, 'r', encoding='utf-8') as f:
    dream_data = json.load(f)

# ✅ 기존 DB 삭제 (초기화용, 주의)
if os.path.exists(output_db_path):
    os.remove(output_db_path)
    print("✅ 기존 DB 파일 삭제 완료")

# ✅ SQLite 연결
conn = sqlite3.connect(output_db_path)
cursor = conn.cursor()

# ✅ 테이블 생성
cursor.execute('''
CREATE TABLE dreams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dream TEXT,
    keyword TEXT,
    action TEXT,
    subject TEXT,
    object TEXT,
    context TEXT,
    type TEXT,
    interpretation TEXT
)
''')
print("✅ dreams 테이블 생성 완료")

# ✅ 데이터 삽입
for entry in dream_data:
    cursor.execute('''
    INSERT INTO dreams (dream, keyword, action, subject, object, context, type, interpretation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        entry.get('dream', ''),
        entry.get('keyword', ''),
        entry.get('action', ''),
        entry.get('subject', ''),
        entry.get('object', ''),
        entry.get('context', ''),
        entry.get('type', ''),
        entry.get('interpretation', '')
    ))

conn.commit()
conn.close()

print(f"🚀 {len(dream_data)}개 데이터 삽입 완료!")
