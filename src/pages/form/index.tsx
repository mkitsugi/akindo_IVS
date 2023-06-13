import { useState } from "react";
import { Box } from "@chakra-ui/react";

import Step1 from "@/components/form/form_gender";
import Step2 from "@/components/form/form_name";
import Step3 from "@/components/form/form_age";
import Step4 from "@/components/form/form_job";

// import { CSSTransition, TransitionGroup } from "react-transition-group";
import { AnimatePresence, motion } from "framer-motion";
import styled from "@emotion/styled";

const MotionBox = motion(Box);

function Survey() {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const getCurrentStep = (step: number) => {
    switch (step) {
      case 1:
        return {
          component: (
            <Box maxH="860px">
              <Step1 onNext={handleNext} />
            </Box>
          ),
          key: "step1",
        };
      case 2:
        return {
          component: (
            <Box maxH="860px">
              <Step2
                onNext={handleNext}
                onBack={() => setStep((prevStep) => prevStep - 1)}
              />
            </Box>
          ),
          key: "step2",
        };
      case 3:
        return {
          component: (
            <Box maxH="860px">
              <Step3
                onNext={handleNext}
                onBack={() => setStep((prevStep) => prevStep - 1)}
              />
            </Box>
          ),
          key: "step3",
        };
      case 4:
        return {
          component: (
            <Box maxH="860px">
              <Step4
                onNext={handleNext}
                onBack={() => setStep((prevStep) => prevStep - 1)}
              />
            </Box>
          ),
          key: "step2",
        };
      // Assuming you have Step3 and Step4 components
      // case 3:
      //   return <Step3 onNext={handleNext} />;
      // case 4:
      //   return <Step4 onNext={handleNext} />;
      default:
        return {
          component: (
            <Box h="860px">
              <div>すべてのステップが完了しました。</div>
            </Box>
          ),
          key: "completed",
        };
    }
  };

  const currentStep = getCurrentStep(step);

  return (
    <Box>
      {/* //{" "} */}
      {/* <AnimationContainer> */}
      {/* <TransitionGroup>
        <CSSTransition key={currentStep.key} timeout={300} classNames="slide"> */}
      <MotionBox
        key={step}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.6 }}
      >
        {currentStep.component}
      </MotionBox>
      {/* </CSSTransition> */}
      {/* </TransitionGroup> */}
      {/* </AnimationContainer> */}
    </Box>
  );
}

export default Survey;
