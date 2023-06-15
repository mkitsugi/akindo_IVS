import { useState, useEffect } from "react";
import { Box, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import axios from 'axios';

import Step1 from "@/components/form/form_gender";
import Step2 from "@/components/form/form_name";
import Step3 from "@/components/form/form_age";
import Step4 from "@/components/form/form_job";

import { motion } from "framer-motion";

const MotionBox = motion(Box);

function Survey() {

  // ルーターフックをコンポーネント内で使う
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [surveyData, setSurveyData] = useState({
    gender: "",
    name: "",
    age: 0,
    job: "",
  });

  const handleNext = (data: any) => {
    // Save the data from the current step
    setSurveyData((prevData) => ({ ...prevData, ...data }));
    // Go to the next step
    setStep((prevStep) => prevStep + 1);
  };

    // When all steps are completed
    useEffect(() => {
      if (step > 4) {
        console.log("Hello World!", surveyData);

        // Post data to your API route
        axios.post("/api/user_create", surveyData)
        .then((response) => {
          console.log(response.data)
          localStorage.setItem("user", JSON.stringify(response.data))
          router.push("/list")
        })
        .catch((error) => {
          console.error("Something went wrong", error);
        });
      }
    }, [step, surveyData]);

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
      default:
        return {
          component: (
            <Box height="860px" display="flex" justifyContent="center" alignItems="center">
              <Spinner size="xl" color="blue.500" />
            </Box>
          ),
          key: "completed",
        };
    }
  };

  const currentStep = getCurrentStep(step);

  return (
    <Box>
      <MotionBox
        key={step}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.6 }}
      >
        {currentStep.component}
      </MotionBox>
    </Box>
  );
}

export default Survey;
