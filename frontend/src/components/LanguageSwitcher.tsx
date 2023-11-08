import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

interface Language {
    [key: string]: {
        nativeName: string;
    };
}

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const languages : Language = {
        en: { nativeName: 'English' },
        nl: { nativeName: 'Nederlands' },
        da: { nativeName: 'Dansk' },
        es: { nativeName: 'Español' },
        fr: { nativeName: 'Français' },
        zh: { nativeName: '中国人' },
    };

    const handleChange = (
        _event: React.SyntheticEvent | null,
        newValue: string | null,
    ) => {
        if (newValue) {
            i18n.changeLanguage(newValue).catch((reason) => console.error(reason));
        }
    };

    return (
        <Select
            value={i18n.resolvedLanguage}
            onChange={handleChange}
            variant={'soft'}
        >
            {Object.keys(languages).map((language) => (
                <Option key={language} value={language}>
                    {languages[language].nativeName}
                </Option>
            ))}
        </Select>
    );
};

