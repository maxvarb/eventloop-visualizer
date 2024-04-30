'use client';

import { SVGProps } from 'react';

import { motion, SVGMotionProps } from 'framer-motion';

export const Path = (
	props: SVGMotionProps<'path'> & SVGProps<SVGPathElement>
) => (
	<motion.path
		fill="transparent"
		strokeWidth="3"
		stroke={props.stroke}
		strokeLinecap="round"
		{...props}
	/>
);
