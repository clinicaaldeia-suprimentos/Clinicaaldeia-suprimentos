import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Button from './common/Button';
import Card from './common/Card';

const Login: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const user = state.users.find(u => u.email === email && u.password === password);

        if (user) {
            dispatch({ type: 'LOGIN', payload: { user } });
        } else {
            setError('E-mail ou senha inválidos.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md px-4">
                <div className="text-center mb-6">
                    <ion-icon name="pulse-outline" className="text-6xl text-primary-600"></ion-icon>
                    <h1 className="text-3xl font-bold text-gray-800 mt-2">ClinicSupply</h1>
                    <p className="text-gray-500">Gestão da Cadeia de Suprimentos</p>
                </div>
                <Card>
                    <form onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Endereço de e-mail
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Senha
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
                        )}

                        <div className="mt-6">
                            <Button type="submit" className="w-full justify-center">
                                Entrar
                            </Button>
                        </div>
                    </form>
                </Card>
                 <p className="mt-4 text-center text-xs text-gray-500">
                    Use <span className="font-mono">alice@clinic.com</span> e senha <span className="font-mono">123</span> para Acesso Admin.
                </p>
            </div>
        </div>
    );
};

export default Login;