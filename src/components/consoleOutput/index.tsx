'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { useEffect } from 'react';

export const ConsoleOutput = () => {
	const consoleState = useAppSelector((store) => store.console);

	return null;
};
