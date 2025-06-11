import React from 'react';

/**
 * Enhanced button component with loading state, proper cursor handling, and accessibility
 * @param {Object} props - Button props
 * @param {boolean} props.loading - Whether the button is in loading state
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.loadingText - Text to show when loading (optional)
 * @param {React.ReactNode} props.loadingIcon - Custom loading icon (optional)
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.variant - Button variant (primary, secondary, danger, success)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {string} props.tooltip - Tooltip text
 * @param {Object} props.rest - Other button props
 */
const LoadingButton = ({
                           loading = false,
                           disabled = false,
                           loadingText,
                           loadingIcon,
                           className = '',
                           children,
                           onClick,
                           type = 'button',
                           variant = 'primary',
                           size = 'md',
                           fullWidth = false,
                           tooltip,
                           ...rest
                       }) => {
    const isDisabled = disabled || loading;

    // Base classes
    const baseClasses = [
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg shadow-md',
        'transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'hover:shadow-lg active:scale-98'
    ];

    // Size classes
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    // Variant classes
    const variantClasses = {
        primary: [
            'bg-sky-600 text-white border border-sky-500',
            'hover:bg-sky-700 hover:border-sky-600',
            'focus:ring-sky-500',
            !isDisabled && 'hover:shadow-sky-500/25'
        ].filter(Boolean).join(' '),

        secondary: [
            'bg-slate-600 text-slate-300 border border-slate-500',
            'hover:bg-slate-500 hover:border-sky-400 hover:text-white',
            'focus:ring-slate-500'
        ].filter(Boolean).join(' '),

        danger: [
            'bg-red-600 text-white border border-red-500',
            'hover:bg-red-700 hover:border-red-600',
            'focus:ring-red-500',
            !isDisabled && 'hover:shadow-red-500/25'
        ].filter(Boolean).join(' '),

        success: [
            'bg-green-600 text-white border border-green-500',
            'hover:bg-green-700 hover:border-green-600',
            'focus:ring-green-500',
            !isDisabled && 'hover:shadow-green-500/25'
        ].filter(Boolean).join(' '),

        gradient: [
            'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0',
            'hover:from-purple-600 hover:to-pink-600',
            'focus:ring-purple-500',
            !isDisabled && 'hover:scale-105'
        ].filter(Boolean).join(' ')
    };

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';

    // Combine all classes
    const buttonClasses = [
        ...baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        widthClasses,
        loading && 'cursor-wait',
        className
    ].filter(Boolean).join(' ');

    // Loading spinner component
    const LoadingSpinner = ({size: spinnerSize = 'sm'}) => (
        <div className={`loading-spinner loading-spinner-${spinnerSize}`}/>
    );

    // Handle click with loading prevention
    const handleClick = (e) => {
        if (loading || disabled) {
            e.preventDefault();
            return;
        }
        if (onClick) {
            onClick(e);
        }
    };

    // Determine button content
    const getButtonContent = () => {
        if (loading) {
            return (
                <>
                    {loadingIcon || <LoadingSpinner size={size === 'lg' ? 'md' : 'sm'}/>}
                    {loadingText || 'Loading...'}
                </>
            );
        }
        return children;
    };

    return (
        <button
            type={type}
            className={buttonClasses}
            disabled={isDisabled}
            onClick={handleClick}
            title={tooltip}
            aria-label={loading ? (loadingText || 'Loading...') : undefined}
            {...rest}
        >
            {getButtonContent()}
        </button>
    );
};

export default LoadingButton;
