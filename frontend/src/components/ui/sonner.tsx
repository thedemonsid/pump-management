import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors
      expand={true}
      duration={4000}
      gap={12}
      closeButton={true}
      visibleToasts={5}
      offset={20}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          padding: "16px 24px",
          fontSize: "16px",
          minWidth: "400px",
          maxWidth: "600px",
        },
        className: "toast-popup",
      }}
      {...props}
    />
  );
};

export { Toaster };
