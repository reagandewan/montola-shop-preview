import React from 'react';
import { FaGraduationCap, FaBookOpen, FaLayerGroup, FaVideo, FaQuestionCircle, FaFilePdf } from 'react-icons/fa';

type PlaceholderType = 'class' | 'subject' | 'chapter' | 'lecture' | 'quiz' | 'pdf';

interface ChapterPlaceholderProps {
    title?: string;
    subjectName?: string;
    className?: string;
    variant?: 'full' | 'thumbnail';
    /** Icon type — determines which icon and accent color is shown.
     *  Defaults to 'chapter' for backward compatibility. */
    type?: PlaceholderType;
}

const typeConfig: Record<PlaceholderType, {
    icon: React.ReactNode;
    smallIcon: React.ReactNode;
    accent: string;
    iconColor: string;
    bg: string;
    pattern: string;
}> = {
    class: {
        icon: <FaGraduationCap size={28} />,
        smallIcon: <FaGraduationCap size={14} />,
        accent: 'bg-primary-100',
        iconColor: 'text-primary-500',
        bg: 'bg-gradient-to-br from-white to-primary-50',
        pattern: 'bg-primary-100/60',
    },
    subject: {
        icon: <FaBookOpen size={26} />,
        smallIcon: <FaBookOpen size={14} />,
        accent: 'bg-primary-100',
        iconColor: 'text-primary-500',
        bg: 'bg-gradient-to-br from-white to-primary-50',
        pattern: 'bg-primary-100/60',
    },
    chapter: {
        icon: <FaLayerGroup size={26} />,
        smallIcon: <FaLayerGroup size={14} />,
        accent: 'bg-primary-100',
        iconColor: 'text-primary-500',
        bg: 'bg-gradient-to-br from-white to-primary-50',
        pattern: 'bg-primary-100/60',
    },
    lecture: {
        icon: <FaVideo size={24} />,
        smallIcon: <FaVideo size={12} />,
        accent: 'bg-blue-100',
        iconColor: 'text-blue-500',
        bg: 'bg-gradient-to-br from-white to-blue-50',
        pattern: 'bg-blue-100/60',
    },
    quiz: {
        icon: <FaQuestionCircle size={26} />,
        smallIcon: <FaQuestionCircle size={14} />,
        accent: 'bg-amber-100',
        iconColor: 'text-amber-500',
        bg: 'bg-gradient-to-br from-white to-amber-50',
        pattern: 'bg-amber-100/60',
    },
    pdf: {
        icon: <FaFilePdf size={24} />,
        smallIcon: <FaFilePdf size={12} />,
        accent: 'bg-red-100',
        iconColor: 'text-red-400',
        bg: 'bg-gradient-to-br from-white to-red-50',
        pattern: 'bg-red-100/60',
    },
};

const ChapterPlaceholder: React.FC<ChapterPlaceholderProps> = ({
    className = "",
    variant = "full",
    type = "chapter",
}) => {
    const config = typeConfig[type];

    if (variant === 'thumbnail') {
        return (
            <div className={`w-full h-full flex items-center justify-center ${config.bg} select-none ${className}`}>
                <div className={`w-8 h-8 rounded-lg ${config.accent} flex items-center justify-center ${config.iconColor}`}>
                    {config.smallIcon}
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full flex items-center justify-center ${config.bg} select-none relative overflow-hidden ${className}`}>
            {/* Decorative dots pattern */}
            <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
                color: 'rgb(var(--color-primary-200, 187 247 208) / 0.5)',
            }} />

            {/* Center icon */}
            <div className={`relative z-10 w-16 h-16 rounded-2xl ${config.accent} flex items-center justify-center ${config.iconColor} shadow-sm transition-transform duration-500 group-hover:scale-110`}>
                {config.icon}
            </div>

            {/* Corner accents */}
            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${config.pattern}`} />
            <div className={`absolute bottom-3 left-3 w-3 h-3 rounded-full ${config.pattern}`} />
        </div>
    );
};

export default ChapterPlaceholder;
