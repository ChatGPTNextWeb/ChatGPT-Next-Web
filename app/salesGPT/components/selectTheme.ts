export const selectTheme = (theme: any) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: "var(--variant-primary-default)",
    primary75: "var(--variant-primary-l-2)",
    primary50: "var(--variant-primary-l-4)",
    primary25: "var(--variant-primary-l-4)",
    neutral0: "var(--variant-secondary-4-l-4)",
    neutral5: "var(--variant-secondary-4-l-4)",
    neutral10: "var(--variant-secondary-4-default)",
    neutral20: "var(--variant-secondary-4-d-1)",
    neutral30: "var(--variant-secondary-4-d-1)",
    neutral40: "var(--variant-secondary-4-d-1)",
    neutral90: "var(--variant-secondary-4-d-4)",
  },
});
