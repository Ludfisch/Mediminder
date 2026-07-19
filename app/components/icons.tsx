import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PillIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m8.2 15.8 7.6-7.6a4 4 0 0 1 5.7 5.7l-7.6 7.6a4 4 0 0 1-5.7-5.7Z" />
      <path d="m11.7 12.3 5.7 5.7" />
    </IconBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12.5 4 4L19 7" />
    </IconBase>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 5.5 5.8v5.6c0 4.1 2.7 7.8 6.5 9.6 3.8-1.8 6.5-5.5 6.5-9.6V5.8L12 3Z" />
      <path d="m9.2 12 1.8 1.8 3.8-4" />
    </IconBase>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16m-10 4v5m4-5v5M6 7l1 14h10l1-14m-9-3h6l1 3H8l1-3Z" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </IconBase>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3c.5 4.4 2.6 6.5 7 7-4.4.5-6.5 2.6-7 7-.5-4.4-2.6-6.5-7-7 4.4-.5 6.5-2.6 7-7Z" />
      <path d="M19 16c.2 1.7 1.1 2.6 3 3-1.9.4-2.8 1.3-3 3-.2-1.7-1.1-2.6-3-3 1.9-.4 2.8-1.3 3-3Z" />
    </IconBase>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c.7-3.7 3-5.5 6.5-5.5s5.8 1.8 6.5 5.5" />
    </IconBase>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 5H5v14h5m4-3 4-4-4-4m4 4H9" />
    </IconBase>
  );
}
