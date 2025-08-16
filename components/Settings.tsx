import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import Button from './common/Button';
import type { Settings as SettingsType } from '../types';

const Settings: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [settings, setSettings] = useState<SettingsType>(state.settings);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail(settings.companyEmail)) {
            setFeedback({ type: 'error', message: 'Por favor, insira um endereço de e-mail válido.' });
            return;
        }
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
        setFeedback({ type: 'success', message: 'Configurações salvas com sucesso!' });
        setTimeout(() => setFeedback(null), 3000);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Configurações</h1>
            <Card title="Informações da Empresa">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                                Nome da Empresa
                            </label>
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                value={settings.companyName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                required
                            />
                             <p className="mt-1 text-xs text-gray-500">Este nome aparecerá como remetente nos e-mails de cotação.</p>
                        </div>
                        <div>
                            <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">
                                E-mail de Envio
                            </label>
                            <input
                                type="email"
                                id="companyEmail"
                                name="companyEmail"
                                value={settings.companyEmail}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">Este e-mail será usado para enviar as solicitações de cotação.</p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                         <div className="flex-grow">
                            {feedback && (
                                <div className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {feedback.message}
                                </div>
                            )}
                        </div>
                        <Button type="submit">
                           <ion-icon name="save-outline"></ion-icon>
                           Salvar Alterações
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Settings;