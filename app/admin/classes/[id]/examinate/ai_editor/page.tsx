"use client";

import { Form } from "antd";
import { useParams, useSearchParams } from "next/navigation";
import { useTestData } from "./hooks/useTestData";
import { useQuestionActions } from "./hooks/useQuestionActions";
import { useTestMetadata } from "./hooks/useTestMetadata";
import QuestionCard from "./components/QuestionCard";
import SettingsPanel from "./components/SettingsPanel";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";

export default function AIEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const classId = params.id as string;
  const testId = searchParams.get("testId");

  const [metadataForm] = Form.useForm();

  // Custom hooks
  const { loading, test, setTest, refetch } = useTestData(testId, metadataForm);
  const { saving: questionSaving, changeCorrectAnswer } = useQuestionActions({
    testId,
    test,
    setTest,
    refetch,
  });
  const { saving: metadataSaving, saveMetadata, togglePublish } = useTestMetadata({
    testId,
    test,
    setTest,
    refetch,
    classId,
  });

  // Early returns
  if (!testId) {
    return <ErrorState type="noTestId" classId={classId} />;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!test) {
    return <ErrorState type="notFound" classId={classId} />;
  }

  // Show loading state when saving
  if (metadataSaving || questionSaving) {
    return <LoadingState />;
  }

  return (
    <div className="grid grid-cols-12 w-full gap-4 min-h-screen">
      {/* Left: Questions List */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-3">
        {test.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            onSelectAnswer={changeCorrectAnswer}
            disabled={metadataSaving || questionSaving}
          />
        ))}
      </div>

      {/* Right: Settings Panel */}
      <SettingsPanel
        form={metadataForm}
        onSave={saveMetadata}
        onTogglePublish={togglePublish}
        saving={metadataSaving || questionSaving}
        isPublished={test.is_published}
        classId={classId}
      />
    </div>
  );
}
