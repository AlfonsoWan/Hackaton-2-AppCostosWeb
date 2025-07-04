import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { useNotification } from '../contexts/NotificationContext';

const calculatePasswordStrength = (password: string): { strength: number; message: string; color: string } => {
    let strength = 0;
    let message = '';
    let color = '';
    if (password.length >= 12) {
        strength += 1;
    }
    if (password.match(/[a-z]+/)) {
        strength += 1;
    }
    if (password.match(/[A-Z]+/)) {
        strength += 1;
    }
    if (password.match(/[0-9]+/)) {
        strength += 1;
    }
    if (password.match(/[!@#$%^&*(),.?":{}|<>]+/)) {
        strength += 1;
    }

    switch (strength) {
        case 0:
            message = 'Muy débil';
            color = 'bg-red-500';
            break;
        case 1:
            message = 'Débil';
            color = 'bg-red-400';
            break;
        case 2:
            message = 'Regular';
            color = 'bg-yellow-500';
            break;
        case 3:
            message = 'Buena';
            color = 'bg-green-400';
            break;
        case 4:
        case 5:
            message = 'Fuerte';
            color = 'bg-green-600';
            break;
        default:
            message = '';
            color = 'bg-gray-200';
    }

    return { strength, message, color };
};

export function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '', color: 'bg-gray-200' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showSuccess } = useNotification();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('El nombre es requerido');
            return false;
        }
        if (!formData.email.trim()) {
            setError('El correo electrónico es requerido');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('El correo electrónico no es válido');
            return false;
        }
        if (formData.password.length < 12) {
            setError('La contraseña debe tener al menos 12 caracteres');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await AuthService.register(formData.email, formData.password, formData.name);
            showSuccess('¡Registro exitoso! Por favor, inicia sesión.');
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'Error al registrar el usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Crear una cuenta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">
                                Nombre
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Nombre completo"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Correo electrónico"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={12}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Contraseña (mínimo 12 caracteres)"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {formData.password && (
                                <div className="mt-1">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 h-2 rounded-full bg-gray-200">
                                            <div
                                                className={`h-full rounded-full ${passwordStrength.color}`}
                                                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {passwordStrength.message}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        La contraseña debe tener mínimo 12 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales
                                    </p>
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirmar Contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Confirmar contraseña"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            {loading ? (
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <svg className="animate-spin h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                </span>
                            ) : null}
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
