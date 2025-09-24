# AI Development Rules

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with TypeScript support
- **Routing**: React Router v7
- **Styling**: Tailwind CSS with Tailwind Merge and Class Variance Authority
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **State Management**: Zustand for global state, React hooks for local state
- **Data Visualization**: Chart.js with React-Chartjs-2
- **HTTP Client**: Axios for API requests
- **Icons**: Lucide React and Heroicons
- **Date Utilities**: date-fns

## Library Usage Rules

### UI Components
- Use **shadcn/ui** components whenever possible for consistent design
- Only add new component libraries after checking if shadcn/ui has equivalent components
- For custom components, follow shadcn/ui's styling patterns using Tailwind CSS

### State Management
- Use **Zustand** for global application state that needs to persist across components
- Use React's built-in **useState** and **useContext** for local component state
- Avoid Redux unless absolutely necessary for complex state interactions

### Data Fetching
- Use **Axios** for all HTTP requests
- Implement proper error handling with try/catch blocks
- Always validate API responses before using data

### Styling
- Use **Tailwind CSS** classes exclusively for styling
- Use **cn()** utility function (tailwind-merge) for conditional class merging
- Avoid inline styles and CSS-in-JS solutions
- Never use plain CSS files except for base styles

### Icons
- Use **Lucide React** for general icons
- Use **Heroicons** only when Lucide doesn't have the required icon
- Keep icon imports consistent within the same component

### Charts and Data Visualization
- Use **Chart.js** with **react-chartjs-2** for all data visualization
- Configure charts with consistent color schemes matching STATUS_COLORS
- Always provide loading states for charts

### Date Handling
- Use **date-fns** for all date manipulations and formatting
- Use Vietnamese locale for date formatting where appropriate
- Avoid using native Date methods directly

### Routing
- Use **React Router v7** for all navigation
- Keep routes organized in App.tsx with clear path mappings
- Use lazy loading for code splitting when appropriate

### Forms and User Input
- Implement proper form validation before submission
- Use controlled components for all form inputs
- Provide clear error messages for invalid inputs

### Error Handling
- Create custom error types that extend built-in Error class
- Implement error boundaries for catching unexpected UI errors
- Display user-friendly error messages in the UI

### Performance
- Use React.memo() for components with static props
- Implement useCallback and useMemo for expensive computations
- Lazy load non-critical components when possible