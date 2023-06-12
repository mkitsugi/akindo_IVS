import { useState } from "react";
import styled from "styled-components";

interface Step1Props {
  onNext: (selectedGender: string) => void;
}

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: "MyFont", sans-serif;
`;

const RoundedButton = styled.button`
  border-radius: 50%; //円形のボタン
  width: 100px;
  height: 100px;
  margin: 10px;
  font-size: 1.5em;
`;

function Step1({ onNext }: Step1Props) {
  const handleButtonClick = (selectedGender: string) => {
    onNext(selectedGender);
  };

  return (
    <CenteredContainer>
      <h1>あなたの性別は？</h1>
      <RoundedButton onClick={() => handleButtonClick("男性")}>
        男性
      </RoundedButton>
      <RoundedButton onClick={() => handleButtonClick("女性")}>
        女性
      </RoundedButton>
      <RoundedButton onClick={() => handleButtonClick("その他")}>
        その他
      </RoundedButton>
    </CenteredContainer>
  );
}

export default Step1;
