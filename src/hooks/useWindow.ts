import { useState, useEffect } from 'react';

export function useWindowHeight() {
  const [windowHeight, setWindowHeight] = useState(0);
  
  useEffect(() => {
    // 初期値を設定
    setWindowHeight(window.innerHeight);
    
    // resize イベントに対するリスナーを設定
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    
    // コンポーネントのクリーンアップ時にリスナーを削除
    return () => window.removeEventListener('resize', handleResize);
  }, []);  // 空の依存配列を指定して、エフェクトをマウント時とアンマウント時にのみ実行

  return windowHeight;
}

export default useWindowHeight