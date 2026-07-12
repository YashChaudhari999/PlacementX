/**
 * ============================================
 * PlacementX — Shared Component Library
 * ============================================
 * 
 * Centralized barrel export for ALL reusable UI components.
 * Usage: import { Button, Card, Input } from '@/components/ui';
 * 
 * DO NOT create feature-specific versions of these components.
 */

// Buttons
export { Button, IconButton, buttonVariants } from './button';
export type { ButtonProps, IconButtonProps } from './button';

// Inputs
export { Input, Textarea, SearchInput, inputVariants } from './input';
export type { InputProps, TextareaProps, SearchInputProps } from './input';

// Selection
export { Select, Checkbox, RadioGroup, Switch, Autocomplete } from './selection';
export type { SelectProps, SelectOption, CheckboxProps, RadioGroupProps, RadioOption, SwitchProps, AutocompleteProps } from './selection';

// Cards
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants, StatisticCard, InformationCard, CompanyCard, StudentCard, NotificationCard } from './card';
export type { CardProps, StatisticCardProps, InformationCardProps, CompanyCardProps, StudentCardProps, NotificationCardProps } from './card';

// Tables
export { DataTable, Pagination, TableEmptyState, TableLoadingState, TableSearch } from './table';
export type { DataTableProps, ColumnDef, SortDirection, PaginationProps } from './table';

// Feedback
export { Alert, alertVariants, Banner, Progress, Skeleton, Spinner } from './feedback';
export type { AlertProps, BannerProps, ProgressProps, SkeletonProps, SpinnerProps, ToastData, ToastVariant } from './feedback';

// Navigation
export { Breadcrumb, Tabs, SidebarItem, sidebarItemVariants, NavbarItem, Menu } from './navigation';
export type { BreadcrumbItem, BreadcrumbProps, TabItem, TabsProps, SidebarItemProps, NavbarItemProps, MenuItem, MenuProps } from './navigation';

// Dialogs
export { Modal, ConfirmationDialog, DeleteDialog, Drawer } from './dialog';
export type { ModalProps, ConfirmationDialogProps, DeleteDialogProps, DrawerProps } from './dialog';

// Status
export { Badge, badgeVariants, StatusChip, Tag, Timeline } from './status';
export type { BadgeProps, StatusType, StatusChipProps, TagProps, TimelineItem, TimelineProps } from './status';

// File
export { FileUpload, AvatarUpload, ResumeUpload, ImagePreview } from './file';
export type { FileUploadProps, AvatarUploadProps, ResumeUploadProps, ImagePreviewProps } from './file';

// Layout
export { PageHeader, SectionHeader, PageContainer, Divider } from './layout';
export type { PageHeaderProps, SectionHeaderProps, PageContainerProps, DividerProps } from './layout';

// Form
export { FormWrapper, FieldWrapper, Label, ErrorMessage, HelperText } from './form';
export type { FormWrapperProps, FieldWrapperProps, LabelProps, ErrorMessageProps, HelperTextProps } from './form';
