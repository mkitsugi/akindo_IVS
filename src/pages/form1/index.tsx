import { useState } from "react";

import Step1 from "@/components/form_gender";
import Step2 from "@/components/form_name";

import { CSSTransition, TransitionGroup } from "react-transition-group";
import styled from "styled-components";

const AnimationContainer = styled.div`
  .slide-enter {
    opacity: 0; // 初期状態で不透明度を 0 に設定
    transform: translateX(100%);
  }
  .slide-enter-active {
    opacity: 1; // アニメーション中は不透明度を 1 にアニメーションさせる
    transform: translateX(0);
    transition: opacity 300ms, transform 300ms; // 不透明度と位置の両方のプロパティにアニメーションを適用
  }
  .slide-exit {
    opacity: 1; // アニメーション終了時の状態で不透明度を 1 に設定
    transform: translateX(0);
  }
  .slide-exit-active {
    opacity: 0; // アニメーション中は不透明度を 0 にアニメーションさせる
    transform: translateX(-100%);
    transition: opacity 300ms, transform 300ms; // 不透明度と位置の両方のプロパティにアニメーションを適用
  }
`;

function Survey() {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const getCurrentStep = (step: number) => {
    switch (step) {
      case 1:
        return <Step1 onNext={handleNext} />;
      case 2:
        return <Step2 onNext={handleNext} />;
      // case 3:
      //   return <Step3 onNext={handleNext} />;
      // case 4:
      //   return <Step4 onNext={handleNext} />;
      default:
        return <div>すべてのステップが完了しました。</div>;
    }
  };

  return (
    <AnimationContainer>
      <TransitionGroup>
        <CSSTransition key={step} timeout={5000} classNames="slide">
          {getCurrentStep(step)}
        </CSSTransition>
      </TransitionGroup>
    </AnimationContainer>
  );
}

export default Survey;
