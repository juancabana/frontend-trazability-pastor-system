import Link from 'next/link';
import { btn } from '@/config/theme';

type ButtonVariant = 'primary' | 'outline' | 'success' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface ButtonAsButtonProps extends ButtonBaseProps {
  as?: 'button';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

interface ButtonAsLinkProps extends ButtonBaseProps {
  as: 'link';
  href: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary: btn.primary,
  outline: btn.outline,
  success: btn.success,
  danger: btn.danger,
  ghost: btn.ghost,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: btn.sm,
  md: '',
  lg: btn.lg,
};

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    disabled,
  } = props;

  const classes = [
    btn.base,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  if (props.as === 'link') {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
