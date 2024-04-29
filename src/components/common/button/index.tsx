import { ButtonHTMLAttributes, forwardRef, ReactNode, Ref } from 'react';

import { cn } from '@/lib/utils';

type ColorVariant = 'success' | 'warning' | 'error';
type ButtonVariant = 'button-icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant: ButtonVariant;
	colorVariant: ColorVariant;
	children?: ReactNode;
}

const BUTTON_COLORS: Record<ColorVariant, string> = {
	success: '#67f772',
	warning: '#ffbc6a',
	error: '#ff5656',
};

const BASE_CLASSES = 'pointer text-sm transition-all box-border duration-300';
const VARIANT_CLASSES: Record<string, string> = {
	'button-icon':
		'w-2.5 h-2.5 rounded-[50px] active:scale-210 hover:scale-200 ',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant,
			colorVariant,
			className,
			children,
			style,
			name,
			...rest
		}: ButtonProps,
		ref: Ref<HTMLButtonElement>
	) => {
		const buttonClasses = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} bg-[${BUTTON_COLORS[colorVariant]}]`;

		return (
			<button
				title={name}
				ref={ref}
				className={cn(buttonClasses, className)}
				style={style}
				{...rest}
			></button>
		);
	}
);

Button.displayName = 'Button';
