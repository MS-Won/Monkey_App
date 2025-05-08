// 파일 위치: frontend/src/database/database.ts

import SQLite from 'react-native-sqlite-storage';

// ✅ SQLite 디버그 끄기
SQLite.DEBUG(false);
SQLite.enablePromise(true);

// ✅ DB 열기 함수
export const openDatabase = async () => {
  return SQLite.openDatabase(
    {
      name: 'dreams.db',
      location: 'default',  // Android/iOS 모두 'default' 사용
    },
    () => {
      console.log('✅ SQLite DB 열기 성공');
    },
    (error: any) => {
      console.log('DB 연결 실패', error);
    }
  );
};
