type BagIconProps = { filled: boolean };

// Figma bag variants (18px frame): outline for an empty cart, solid black otherwise.
const OUTLINE_PATH =
  'M11.4706 1H6.76471V4.76471H3V17H15.2353V4.76471H11.4706V1ZM10.5294 5.70588V8.05882H11.4706V5.70588H14.2941V16H3.94118V5.70588H6.76471V8.05882H7.70588V5.70588H10.5294ZM10.5294 4.76471V1.94118H7.70588V4.76471H10.5294Z';
const FILLED_PATH =
  'M11.4706 1H6.76471V4.76471H3V17H15.2353V4.76471H11.4706V1ZM10.5294 4.76471V8.05882H11.4706V4.76471H10.5294ZM7.70588 4.76471V8.05882H6.76471V4.76471H7.70588ZM7.70588 4.76471H10.5294V1.94118H7.70588V4.76471Z';

export function BagIcon({ filled }: BagIconProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={filled ? FILLED_PATH : OUTLINE_PATH}
        fill="currentColor"
      />
    </svg>
  );
}
