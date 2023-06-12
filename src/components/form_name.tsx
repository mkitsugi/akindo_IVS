import { useState } from "react";
import styled from "styled-components";

interface Step2Props {
  onNext: (nickname: string) => void;
}

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; // viewport height
`;

const StyledInput = styled.input`
  padding: 10px;
  font-size: 1em;
  width: 200px;
`;

const StyledButton = styled.button`
  margin-top: 10px;
  padding: 10px 20px;
`;

function Step2({ onNext }: Step2Props) {
  const [nickname, setNickname] = useState("");

  const handleButtonClick = () => {
    onNext(nickname);
  };

  return (
    <CenteredContainer>
      <h1>あなたのニックネームは？</h1>
      <StyledInput
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="ニックネームを入力"
      />
      <StyledButton onClick={handleButtonClick}>次へ</StyledButton>
    </CenteredContainer>
  );
}

export default Step2;
