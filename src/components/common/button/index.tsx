'use client';

import { ComponentPropsWithoutRef, ReactNode } from 'react';

import { HTMLMotionProps, motion } from 'framer-motion';

import { cn } from '@/lib/utils';

type ColorVariant = 'success' | 'warning' | 'error';
type ButtonVariant = 'button-icon';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
	variant: ButtonVariant;
	colorVariant: ColorVariant;
	children?: ReactNode;
}

const BUTTON_COLORS: Record<ColorVariant, string> = {
	success: 'bg-success',
	warning: 'bg-transparent border-2 border-blue',
	error: 'border-error border-2 bg-transparent',
};

const BASE_CLASSES = 'pointer text-sm box-border';
const VARIANT_CLASSES: Record<string, string> = {
	'button-icon': 'w-5 h-5 rounded-[50px]',
};

export const Button = ({
	variant,
	colorVariant,
	className,
	children,
	style,
	name,
	...rest
}: ButtonProps & HTMLMotionProps<'button'>) => {
	const buttonClasses = `${BUTTON_COLORS[colorVariant]} ${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`;

	return (
		<motion.button
			title={name}
			className={cn(buttonClasses, className)}
			style={style}
			whileHover={{ scale: 1.2, filter: 'brightness(1.2)' }}
			whileTap={{ scale: 0.9 }}
			transition={{ type: 'spring', stiffness: 400, damping: 17 }}
			{...rest}
		></motion.button>
	);
};
