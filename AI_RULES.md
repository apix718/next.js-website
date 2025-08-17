# AI Rules for Webtmize App

## Tech Stack Overview

- React with TypeScript for building the user interface.
- React Router v6 for client-side routing and navigation.
- Tailwind CSS for styling with utility-first CSS classes and custom theming.
- Shadcn/ui component library (built on Radix UI) for accessible, prebuilt UI components.
- Framer Motion for animations and transitions.
- Lucide-react for icons.
- React Hook Form and Zod for form handling and validation.
- Sonner for toast notifications.
- React Markdown for rendering markdown content.
- Context API for managing language and theme state.
- Vite as the build tool and development server.

## Library Usage Rules

- **UI Components:** Always use components from the shadcn/ui library for buttons, badges, inputs, toggles, dialogs, etc., to ensure consistent styling and accessibility. Do not create custom UI components unless a specific need arises that shadcn/ui does not cover.

- **Styling:** Use Tailwind CSS exclusively for styling. Avoid inline styles or other CSS-in-JS solutions. Extend Tailwind config only when necessary for custom colors, animations, or spacing.

- **Routing:** Use React Router v6 exclusively for routing. Keep all routes defined in `src/App.tsx`. Use `<Link>` from `react-router-dom` for internal navigation.

- **State Management:** Use React Context API for global state like language and theme. Avoid introducing external state management libraries.

- **Forms:** Use React Hook Form for form state and validation, combined with Zod for schema validation.

- **Animations:** Use Framer Motion for all animations and transitions. Avoid mixing with other animation libraries.

- **Icons:** Use lucide-react for all icons to maintain a consistent icon style.

- **Markdown:** Use react-markdown for rendering markdown content safely.

- **Toasts:** Use sonner for toast notifications and feedback messages.

- **SEO:** Use the custom `useSEO` hook for managing meta tags and structured data dynamically.

- **Avoid:** Do not add new UI libraries or CSS frameworks. Do not use jQuery or other DOM manipulation libraries. Avoid heavy state management libraries like Redux unless explicitly requested.

This ensures the app remains lightweight, consistent, and maintainable.

---

*This document guides AI and developers on the tech stack and library usage conventions for the Webtmize app.*