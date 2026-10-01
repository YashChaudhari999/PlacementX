import React from 'react';
import { PageHeader } from './Foundation';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export const ScreenHeader = ({ title, subtitle, showBack = false, rightElement }: ScreenHeaderProps) => (
  <PageHeader title={title} subtitle={subtitle} showBack={showBack} right={rightElement} />
);