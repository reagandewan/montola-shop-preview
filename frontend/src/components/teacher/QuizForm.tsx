"use client";

import { useState, useEffect } from "react";
import { QuizRequestDto, QuizType, QuizQuestionRequestDto, QuizQuestionType } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { HiPlus, HiTrash } from "react-icons/hi";

interface QuizFormProps {
    topicId: number;
    initialData?: any; // Content response from API
    onSubmit: (data: QuizRequestDto) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function QuizForm({
    topicId,
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: QuizFormProps) {
    const normalizeQuestions = (questions: any[]): QuizQuestionRequestDto[] => {
        if (!questions) return [];
        return questions.map((q) => ({
            ...q,
            options: q.options?.map((o: any) => ({
                ...o,
                isCorrect: o.isCorrect ?? false // Ensure boolean, default false
            }))
        }));
    };

    const [formData, setFormData] = useState<QuizRequestDto>({
        topicId: topicId,
        title: initialData?.title || "",
        quizType: initialData?.quizType || QuizType.MCQ,
        instruction: initialData?.instruction || "",
        timeLimit: initialData?.timeLimit || undefined,
        totalMarks: initialData?.totalMarks || undefined,
        passPercentage: initialData?.passPercentage || undefined,
        orderIndex: initialData?.orderIndex || 0,
        questions: initialData?.questions ? normalizeQuestions(initialData.questions) : [],
    });
    const [errors, setErrors] = useState<{ title?: string }>({});

    // Map QuizType to QuestionType
    const quizTypeToQuestionType = (qt: QuizType): QuizQuestionType => {
        switch (qt) {
            case QuizType.MCQ: return QuizQuestionType.MULTIPLE_CHOICE;
            case QuizType.WRITTEN: return QuizQuestionType.WRITTEN;
            case QuizType.FILL_BLANK: return QuizQuestionType.FILL_IN_THE_BLANK;
            case QuizType.TABLE_MATCHING: return QuizQuestionType.MATCHING;
            default: return QuizQuestionType.MULTIPLE_CHOICE;
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                topicId: topicId,
                title: initialData.title || "",
                quizType: initialData.quizType || QuizType.MCQ,
                instruction: initialData.instruction || "",
                timeLimit: initialData.timeLimit || undefined,
                totalMarks: initialData.totalMarks || undefined,
                passPercentage: initialData.passPercentage || undefined,
                orderIndex: initialData.orderIndex || 0,
                questions: initialData.questions ? normalizeQuestions(initialData.questions) : [],
            });
        }
    }, [initialData, topicId]);

    const validate = (): boolean => {
        const newErrors: { title?: string } = {};

        if (!formData.title || formData.title.trim().length === 0) {
            newErrors.title = "Quiz title is required";
        } else if (formData.title.length > 200) {
            newErrors.title = "Quiz title must be less than 200 characters";
        }

        // Validate each question
        if (formData.questions && formData.questions.length > 0) {
            for (let i = 0; i < formData.questions.length; i++) {
                const q = formData.questions[i];

                if (!q.questionText || q.questionText.trim().length === 0) {
                    toast.error(`Question ${i + 1}: Question text is required.`);
                    setErrors(newErrors);
                    return false;
                }

                // MCQ: must have at least one correct option
                if (q.type === QuizQuestionType.MULTIPLE_CHOICE) {
                    if (!q.options || q.options.length < 2) {
                        toast.error(`Question ${i + 1}: Must have at least 2 options.`);
                        setErrors(newErrors);
                        return false;
                    }
                    const hasCorrect = q.options.some(o => !!o.isCorrect);
                    if (!hasCorrect) {
                        toast.error(`Question ${i + 1}: You must select at least one correct option.`);
                        setErrors(newErrors);
                        return false;
                    }
                }

                // Fill in the blank: must have at least one blank answer
                if (q.type === QuizQuestionType.FILL_IN_THE_BLANK) {
                    if (!q.fillBlanks || q.fillBlanks.length === 0) {
                        toast.error(`Question ${i + 1}: Must have at least one blank answer.`);
                        setErrors(newErrors);
                        return false;
                    }
                }

                // Matching: must have at least one pair
                if (q.type === QuizQuestionType.MATCHING) {
                    if (!q.tableMatchings || q.tableMatchings.length === 0) {
                        toast.error(`Question ${i + 1}: Must have at least one matching pair.`);
                        setErrors(newErrors);
                        return false;
                    }
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        // Sanitize data: remove 'correct' property from options to prevent backend mapping issues
        const sanitizedData = {
            ...formData,
            questions: formData.questions?.map(q => ({
                ...q,
                options: q.options?.map(o => ({
                    ...o,
                    isCorrect: !!o.isCorrect // Ensure strict boolean
                })).map(({ correct, ...rest }: any) => rest) // Remove 'correct' property if present
            }))
        };


        try {
            await onSubmit(sanitizedData);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to save quiz");
        }
    };

    const addQuestion = () => {
        const derivedType = formData.quizType === QuizType.MIXED
            ? QuizQuestionType.MULTIPLE_CHOICE
            : quizTypeToQuestionType(formData.quizType);
        const newQuestion: QuizQuestionRequestDto = {
            questionText: "",
            type: derivedType,
            orderIndex: (formData.questions?.length || 0) + 1,
            marks: 1,
            options: derivedType === QuizQuestionType.MULTIPLE_CHOICE ? [{ optionText: "", isCorrect: false }] : [],
        };
        setFormData({
            ...formData,
            questions: [...(formData.questions || []), newQuestion],
        });
    };

    const removeQuestion = (index: number) => {
        const newQuestions = formData.questions?.filter((_, i) => i !== index) || [];
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateQuestion = (index: number, field: keyof QuizQuestionRequestDto, value: any) => {
        setFormData((prev) => {
            const newQuestions = [...(prev.questions || [])];
            newQuestions[index] = { ...newQuestions[index], [field]: value };
            return { ...prev, questions: newQuestions };
        });
    };

    const addOption = (questionIndex: number) => {
        setFormData((prev) => {
            const newQuestions = [...(prev.questions || [])];
            const updatedQuestion = { ...newQuestions[questionIndex] };
            updatedQuestion.options = [...(updatedQuestion.options || []), { optionText: "", isCorrect: false }];
            newQuestions[questionIndex] = updatedQuestion;
            return { ...prev, questions: newQuestions };
        });
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        setFormData((prev) => {
            const newQuestions = [...(prev.questions || [])];
            const updatedQuestion = { ...newQuestions[questionIndex] };
            updatedQuestion.options = updatedQuestion.options?.filter((_, i) => i !== optionIndex);
            newQuestions[questionIndex] = updatedQuestion;
            return { ...prev, questions: newQuestions };
        });
    };

    const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
        setFormData((prev) => {
            const newQuestions = [...(prev.questions || [])];
            const updatedQuestion = { ...newQuestions[questionIndex] };
            const updatedOptions = [...(updatedQuestion.options || [])];

            updatedOptions[optionIndex] = {
                ...updatedOptions[optionIndex],
                [field]: value
            };

            updatedQuestion.options = updatedOptions;
            newQuestions[questionIndex] = updatedQuestion;

            return { ...prev, questions: newQuestions };
        });
    };

    const addFillBlank = (questionIndex: number) => {
        const newQuestions = [...(formData.questions || [])];
        if (!newQuestions[questionIndex].fillBlanks) {
            newQuestions[questionIndex].fillBlanks = [];
        }
        const nextPosition = (newQuestions[questionIndex].fillBlanks?.length || 0) + 1;
        newQuestions[questionIndex].fillBlanks?.push({ blankPosition: nextPosition, correctAnswer: "" });
        setFormData({ ...formData, questions: newQuestions });
    };

    const removeFillBlank = (questionIndex: number, blankIndex: number) => {
        const newQuestions = [...(formData.questions || [])];
        newQuestions[questionIndex].fillBlanks = newQuestions[questionIndex].fillBlanks?.filter(
            (_, i) => i !== blankIndex
        );
        // Re-index positions
        newQuestions[questionIndex].fillBlanks?.forEach((blank, i) => {
            blank.blankPosition = i + 1;
        });
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateFillBlank = (questionIndex: number, blankIndex: number, value: string) => {
        const newQuestions = [...(formData.questions || [])];
        if (newQuestions[questionIndex].fillBlanks) {
            newQuestions[questionIndex].fillBlanks![blankIndex].correctAnswer = value;
        }
        setFormData({ ...formData, questions: newQuestions });
    };

    const addMatchingPair = (questionIndex: number) => {
        const newQuestions = [...(formData.questions || [])];
        if (!newQuestions[questionIndex].tableMatchings) {
            newQuestions[questionIndex].tableMatchings = [];
        }
        const nextOrder = (newQuestions[questionIndex].tableMatchings?.length || 0) + 1;
        newQuestions[questionIndex].tableMatchings?.push({ leftItem: "", rightItem: "", orderIndex: nextOrder });
        setFormData({ ...formData, questions: newQuestions });
    };

    const removeMatchingPair = (questionIndex: number, matchIndex: number) => {
        const newQuestions = [...(formData.questions || [])];
        newQuestions[questionIndex].tableMatchings = newQuestions[questionIndex].tableMatchings?.filter(
            (_, i) => i !== matchIndex
        );
        newQuestions[questionIndex].tableMatchings?.forEach((match, i) => {
            match.orderIndex = i + 1;
        });
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateMatchingPair = (questionIndex: number, matchIndex: number, field: "leftItem" | "rightItem", value: string) => {
        const newQuestions = [...(formData.questions || [])];
        if (newQuestions[questionIndex].tableMatchings) {
            newQuestions[questionIndex].tableMatchings![matchIndex][field] = value;
        }
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateWrittenAnswer = (questionIndex: number, value: string) => {
        const newQuestions = [...(formData.questions || [])];
        if (!newQuestions[questionIndex].writtenAnswer) {
            newQuestions[questionIndex].writtenAnswer = { sampleAnswer: "" };
        }
        newQuestions[questionIndex].writtenAnswer!.sampleAnswer = value;
        setFormData({ ...formData, questions: newQuestions });
    };


    const isMixed = formData.quizType === QuizType.MIXED;

    const handleQuizTypeChange = (newType: QuizType) => {
        const updatedData: any = { ...formData, quizType: newType };
        // If not mixed, auto-set all existing questions to the corresponding type
        if (newType !== QuizType.MIXED && formData.questions && formData.questions.length > 0) {
            updatedData.questions = formData.questions.map(q => ({
                ...q,
                type: quizTypeToQuestionType(newType),
            }));
        }
        setFormData(updatedData);
    };

    const quizTypeOptions = [
        { value: QuizType.MCQ, label: "Multiple Choice (MCQ)" },
        { value: QuizType.WRITTEN, label: "Written" },
        { value: QuizType.FILL_BLANK, label: "Fill in the Blank" },
        { value: QuizType.TABLE_MATCHING, label: "Table Matching" },
        { value: QuizType.MIXED, label: "Mixed (multiple types)" },
    ];

    const questionTypeOptions = [
        { value: QuizQuestionType.MULTIPLE_CHOICE, label: "Multiple Choice" },
        { value: QuizQuestionType.FILL_IN_THE_BLANK, label: "Fill in the Blank" },
        { value: QuizQuestionType.MATCHING, label: "Matching" },
        { value: QuizQuestionType.WRITTEN, label: "Written" },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Quiz Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={errors.title}
                maxLength={200}
                placeholder="Enter quiz title"
            />

            <Select
                label="Quiz Type"
                required
                value={formData.quizType}
                onChange={(e) => handleQuizTypeChange(e.target.value as QuizType)}
                options={quizTypeOptions}
            />

            <div>
                <label className="block mb-1 font-semibold text-gray-700">
                    Instructions
                </label>
                <textarea
                    value={formData.instruction || ""}
                    onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter quiz instructions (optional)"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    label="Time Limit (minutes)"
                    type="number"
                    value={formData.timeLimit?.toString() || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            timeLimit: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                    }
                    placeholder="Time limit (optional)"
                />

                <Input
                    label="Total Marks"
                    type="number"
                    value={formData.totalMarks?.toString() || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            totalMarks: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                    }
                    placeholder="Total marks (optional)"
                />

                <Input
                    label="Pass Percentage"
                    type="number"
                    step="0.1"
                    value={formData.passPercentage?.toString() || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            passPercentage: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                    }
                    placeholder="Pass % (optional)"
                />
            </div>

            <Input
                label="Order Index"
                type="number"
                required
                value={formData.orderIndex.toString()}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        orderIndex: parseInt(e.target.value) || 0,
                    })
                }
                placeholder="Order index"
            />

            {/* Questions Section */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Questions</h3>

                {formData.questions && formData.questions.length > 0 ? (
                    <div className="space-y-6">
                        {formData.questions.map((question, qIndex) => (
                            <div
                                key={qIndex}
                                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h4 className="font-medium text-gray-800">
                                        Question {qIndex + 1}
                                    </h4>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeQuestion(qIndex)}
                                    >
                                        <HiTrash className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-1 text-sm font-semibold text-gray-700">Question Text</label>
                                        <textarea
                                            value={question.questionText}
                                            onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            rows={2}
                                            placeholder={
                                                question.type === QuizQuestionType.FILL_IN_THE_BLANK
                                                    ? "Use __BLANK__ for blanks. Ex: The capital of France is __BLANK__."
                                                    : "Enter question text"
                                            }
                                        />
                                        {question.type === QuizQuestionType.FILL_IN_THE_BLANK && (
                                            <p className="text-xs text-gray-500 mt-1">Use <b>__BLANK__</b> to denote where the blank should appear.</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {isMixed ? (
                                            <Select
                                                label="Question Type"
                                                required
                                                value={question.type}
                                                onChange={(e) =>
                                                    updateQuestion(
                                                        qIndex,
                                                        "type",
                                                        e.target.value as QuizQuestionType
                                                    )
                                                }
                                                options={questionTypeOptions}
                                            />
                                        ) : (
                                            <div>
                                                <label className="block mb-1 text-sm font-semibold text-gray-700">Question Type</label>
                                                <p className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm">
                                                    {questionTypeOptions.find(o => o.value === question.type)?.label || question.type}
                                                </p>
                                            </div>
                                        )}

                                        <Input
                                            label="Marks"
                                            type="number"
                                            required
                                            value={question.marks.toString()}
                                            onChange={(e) =>
                                                updateQuestion(
                                                    qIndex,
                                                    "marks",
                                                    parseInt(e.target.value) || 1
                                                )
                                            }
                                            placeholder="Marks"
                                        />
                                    </div>

                                    {/* Options for Multiple Choice */}
                                    {question.type === QuizQuestionType.MULTIPLE_CHOICE && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block font-semibold text-gray-700">
                                                    Options
                                                </label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addOption(qIndex)}
                                                >
                                                    <HiPlus className="w-4 h-4 inline-block mr-1" />
                                                    Add Option
                                                </Button>
                                            </div>
                                            {question.options && question.options.length > 0 ? (
                                                <div className="space-y-2">
                                                    {question.options.map((option, oIndex) => (
                                                        <div
                                                            key={oIndex}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Input
                                                                value={option.optionText}
                                                                onChange={(e) =>
                                                                    updateOption(
                                                                        qIndex,
                                                                        oIndex,
                                                                        "optionText",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Option text"
                                                                className="flex-1"
                                                            />
                                                            <label className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!option.isCorrect}
                                                                    onChange={(e) =>
                                                                        updateOption(
                                                                            qIndex,
                                                                            oIndex,
                                                                            "isCorrect",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                    className="w-4 h-4 text-primary-600"
                                                                />
                                                                <span className="text-sm text-gray-700">
                                                                    Correct
                                                                </span>
                                                            </label>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeOption(qIndex, oIndex)}
                                                            >
                                                                <HiTrash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    No options added yet
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Fill in the Blank */}
                                    {question.type === QuizQuestionType.FILL_IN_THE_BLANK && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block font-semibold text-gray-700">Blanks</label>
                                                <Button type="button" variant="outline" size="sm" onClick={() => addFillBlank(qIndex)}>
                                                    <HiPlus className="w-4 h-4 inline-block mr-1" /> Add Blank Answer
                                                </Button>
                                            </div>
                                            {question.fillBlanks && question.fillBlanks.length > 0 ? (
                                                <div className="space-y-2">
                                                    {question.fillBlanks.map((blank, bIndex) => (
                                                        <div key={bIndex} className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium w-6">{blank.blankPosition}.</span>
                                                            <Input
                                                                value={blank.correctAnswer}
                                                                onChange={(e) => updateFillBlank(qIndex, bIndex, e.target.value)}
                                                                placeholder="Correct Answer"
                                                                className="flex-1"
                                                            />
                                                            <Button type="button" variant="outline" size="sm" onClick={() => removeFillBlank(qIndex, bIndex)}>
                                                                <HiTrash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No blanks defined yet.</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Matching */}
                                    {question.type === QuizQuestionType.MATCHING && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block font-semibold text-gray-700">Matching Items</label>
                                                <Button type="button" variant="outline" size="sm" onClick={() => addMatchingPair(qIndex)}>
                                                    <HiPlus className="w-4 h-4 inline-block mr-1" /> Add Pair
                                                </Button>
                                            </div>
                                            {question.tableMatchings && question.tableMatchings.length > 0 ? (
                                                <div className="space-y-2">
                                                    <div className="flex space-x-2 text-xs font-semibold text-gray-500 px-2">
                                                        <div className="flex-1">Left Item</div>
                                                        <div className="flex-1">Right Item</div>
                                                        <div className="w-8"></div>
                                                    </div>
                                                    {question.tableMatchings.map((match, mIndex) => (
                                                        <div key={mIndex} className="flex items-center space-x-2">
                                                            <Input
                                                                value={match.leftItem}
                                                                onChange={(e) => updateMatchingPair(qIndex, mIndex, "leftItem", e.target.value)}
                                                                placeholder="Left Item"
                                                                className="flex-1"
                                                            />
                                                            <Input
                                                                value={match.rightItem}
                                                                onChange={(e) => updateMatchingPair(qIndex, mIndex, "rightItem", e.target.value)}
                                                                placeholder="Right Item"
                                                                className="flex-1"
                                                            />
                                                            <Button type="button" variant="outline" size="sm" onClick={() => removeMatchingPair(qIndex, mIndex)}>
                                                                <HiTrash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No pairs added yet.</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Written */}
                                    {question.type === QuizQuestionType.WRITTEN && (
                                        <div>
                                            <label className="block mb-1 font-semibold text-gray-700">Sample Answer (Optional)</label>
                                            <textarea
                                                value={question.writtenAnswer?.sampleAnswer || ""}
                                                onChange={(e) => updateWrittenAnswer(qIndex, e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                rows={3}
                                                placeholder="Enter sample answer"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">
                        No questions added yet. Click &quot;Add Question&quot; to get started.
                    </p>
                )}

                {/* Add Question button at the bottom */}
                <div className="mt-4 flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addQuestion}
                    >
                        <HiPlus className="w-4 h-4 inline-block mr-1" />
                        Add Question
                    </Button>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {initialData ? "Update Quiz" : "Create Quiz"}
                </Button>
            </div>
        </form>
    );
}
